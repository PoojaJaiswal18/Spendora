package com.jaiswal.service;

import com.jaiswal.exception.ResourceNotFoundException;
import com.jaiswal.exception.ValidationException;
import com.jaiswal.model.document.Category;
import com.jaiswal.model.dto.CategoryDTO;
import com.jaiswal.repository.CategoryRepository;
import com.jaiswal.repository.ReceiptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ReceiptRepository receiptRepository;

    @Cacheable(value = "categories", key = "#userId")
    public List<CategoryDTO> getCategoriesByUser(String userId) {
        List<Category> categories = categoryRepository.findByUserIdOrUserIdIsNullOrderByNameAsc(userId);
        return categories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "categories", key = "#categoryId")
    public CategoryDTO getCategoryById(String categoryId, String userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        // Check if user has access to this category
        if (category.getUserId() != null && !category.getUserId().equals(userId)) {
            throw new ValidationException("Category does not belong to user");
        }

        return convertToDTO(category);
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryDTO createCategory(String userId, CategoryDTO categoryDTO) {
        validateCategoryCreation(userId, categoryDTO);

        Category category = Category.builder()
                .name(categoryDTO.getName())
                .description(categoryDTO.getDescription())
                .color(categoryDTO.getColor() != null ? categoryDTO.getColor() : "#6366f1")
                .icon(categoryDTO.getIcon() != null ? categoryDTO.getIcon() : "📁")
                .userId(userId)
                .parentCategoryId(categoryDTO.getParentCategoryId())
                .isDefault(false)
                .isActive(true)
                .keywords(categoryDTO.getKeywords())
                .budget(convertBudgetFromDTO(categoryDTO.getBudget()))
                .build();

        Category savedCategory = categoryRepository.save(category);
        log.info("Created category: {} for user: {}", savedCategory.getName(), userId);
        return convertToDTO(savedCategory);
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryDTO updateCategory(String categoryId, String userId, CategoryDTO categoryDTO) {
        Category existingCategory = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        if (!existingCategory.getUserId().equals(userId)) {
            throw new ValidationException("Category does not belong to user");
        }

        // Update fields
        if (categoryDTO.getName() != null) {
            existingCategory.setName(categoryDTO.getName());
        }

        if (categoryDTO.getDescription() != null) {
            existingCategory.setDescription(categoryDTO.getDescription());
        }

        if (categoryDTO.getColor() != null) {
            existingCategory.setColor(categoryDTO.getColor());
        }

        if (categoryDTO.getIcon() != null) {
            existingCategory.setIcon(categoryDTO.getIcon());
        }

        if (categoryDTO.getKeywords() != null) {
            existingCategory.setKeywords(categoryDTO.getKeywords());
        }

        if (categoryDTO.getBudget() != null) {
            existingCategory.setBudget(convertBudgetFromDTO(categoryDTO.getBudget()));
        }

        Category updatedCategory = categoryRepository.save(existingCategory);
        log.info("Updated category: {}", updatedCategory.getName());
        return convertToDTO(updatedCategory);
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(String categoryId, String userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        if (!category.getUserId().equals(userId)) {
            throw new ValidationException("Category does not belong to user");
        }

        if (category.isDefault()) {
            throw new ValidationException("Cannot delete default category");
        }

        // Check if category has receipts
        long receiptCount = receiptRepository.countByUserIdAndCategoryId(userId, categoryId);
        if (receiptCount > 0) {
            throw new ValidationException("Cannot delete category with existing receipts");
        }

        categoryRepository.deleteById(categoryId);
        log.info("Deleted category: {} for user: {}", category.getName(), userId);
    }

    public String suggestCategory(String merchantName, String description) {
        String searchText = (merchantName + " " + description).toLowerCase();

        // Simple keyword-based categorization
        if (containsAny(searchText, Arrays.asList("grocery", "supermarket", "walmart", "target", "food"))) {
            return "Groceries";
        } else if (containsAny(searchText, Arrays.asList("gas", "fuel", "shell", "exxon", "bp"))) {
            return "Transportation";
        } else if (containsAny(searchText, Arrays.asList("restaurant", "cafe", "pizza", "burger", "dining"))) {
            return "Dining";
        } else if (containsAny(searchText, Arrays.asList("movie", "theater", "entertainment", "netflix"))) {
            return "Entertainment";
        } else if (containsAny(searchText, Arrays.asList("pharmacy", "cvs", "walgreens", "medicine", "health"))) {
            return "Healthcare";
        }

        return "Other";
    }

    @Transactional
    public void initializeDefaultCategories(String userId) {
        if (categoryRepository.countActiveByUserId(userId) > 0) {
            return; // User already has categories
        }

        List<Category> defaultCategories = Arrays.asList(
                createDefaultCategory("Groceries", "Food and household items", "#10b981", "🛒"),
                createDefaultCategory("Transportation", "Gas, public transport, parking", "#3b82f6", "🚗"),
                createDefaultCategory("Dining", "Restaurants and takeout", "#f59e0b", "🍽️"),
                createDefaultCategory("Entertainment", "Movies, games, subscriptions", "#8b5cf6", "🎬"),
                createDefaultCategory("Healthcare", "Medical expenses and pharmacy", "#ef4444", "🏥"),
                createDefaultCategory("Shopping", "Clothing, electronics, misc", "#ec4899", "🛍️"),
                createDefaultCategory("Utilities", "Bills and services", "#6b7280", "⚡"),
                createDefaultCategory("Other", "Miscellaneous expenses", "#6366f1", "📦")
        );

        defaultCategories.forEach(category -> {
            category.setUserId(userId);
            categoryRepository.save(category);
        });

        log.info("Initialized default categories for user: {}", userId);
    }

    private void validateCategoryCreation(String userId, CategoryDTO categoryDTO) {
        if (categoryRepository.existsByUserIdAndNameIgnoreCase(userId, categoryDTO.getName())) {
            throw new ValidationException("Category with name '" + categoryDTO.getName() + "' already exists");
        }
    }

    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .color(category.getColor())
                .icon(category.getIcon())
                .parentCategoryId(category.getParentCategoryId())
                .isDefault(category.isDefault())
                .isActive(category.isActive())
                .keywords(category.getKeywords())
                .budget(convertBudgetToDTO(category.getBudget()))
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();

        // Add current spending if budget exists
        if (category.getBudget() != null && category.getUserId() != null) {
            LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
            LocalDate endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());

            var monthlySpending = receiptRepository.getSpendingSummaryByUserAndDateRange(
                    category.getUserId(), startOfMonth, endOfMonth);

            dto.setCurrentMonthSpending(monthlySpending.filter(summary -> summary.getTotalAmount() != null).map(ReceiptRepository.SpendingSummaryAggregation::getTotalAmount).orElse(BigDecimal.ZERO));
        }

        return dto;
    }

    private Category.CategoryBudget convertBudgetFromDTO(CategoryDTO.CategoryBudgetDTO budgetDTO) {
        if (budgetDTO == null) return null;

        return Category.CategoryBudget.builder()
                .monthlyLimit(budgetDTO.getMonthlyLimit())
                .yearlyLimit(budgetDTO.getYearlyLimit())
                .alertEnabled(budgetDTO.getAlertEnabled() != null ? budgetDTO.getAlertEnabled() : false)
                .alertThreshold(budgetDTO.getAlertThreshold() != null ? budgetDTO.getAlertThreshold() : BigDecimal.valueOf(0.8))
                .build();
    }

    private CategoryDTO.CategoryBudgetDTO convertBudgetToDTO(Category.CategoryBudget budget) {
        if (budget == null) return null;

        return CategoryDTO.CategoryBudgetDTO.builder()
                .monthlyLimit(budget.getMonthlyLimit())
                .yearlyLimit(budget.getYearlyLimit())
                .alertEnabled(budget.isAlertEnabled())
                .alertThreshold(budget.getAlertThreshold())
                .build();
    }

    private Category createDefaultCategory(String name, String description, String color, String icon) {
        return Category.builder()
                .name(name)
                .description(description)
                .color(color)
                .icon(icon)
                .isDefault(true)
                .isActive(true)
                .build();
    }

    private boolean containsAny(String text, List<String> keywords) {
        return keywords.stream().anyMatch(text::contains);
    }
}
