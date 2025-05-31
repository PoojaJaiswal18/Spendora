package com.jaiswal.controller;

import com.jaiswal.model.dto.ApiResponse;
import com.jaiswal.model.dto.CategoryDTO;
import com.jaiswal.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Validated
@Tag(name = "Category Management", description = "APIs for managing expense categories")
@SecurityRequirement(name = "bearerAuth")
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "Get all categories", description = "Retrieve all categories available to the user")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getCategories(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<CategoryDTO> categories = categoryService.getCategoriesByUser(getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @Operation(summary = "Get category by ID", description = "Retrieve a specific category by its ID")
    @GetMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryDTO>> getCategoryById(
            @Parameter(description = "Category ID", required = true)
            @PathVariable String categoryId,
            @AuthenticationPrincipal UserDetails userDetails) {

        CategoryDTO category = categoryService.getCategoryById(categoryId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @Operation(summary = "Create new category", description = "Create a new expense category")
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryDTO>> createCategory(
            @Valid @RequestBody CategoryDTO categoryDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        CategoryDTO createdCategory = categoryService.createCategory(getUserId(userDetails), categoryDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", createdCategory));
    }

    @Operation(summary = "Update category", description = "Update an existing category")
    @PutMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryDTO>> updateCategory(
            @Parameter(description = "Category ID", required = true)
            @PathVariable String categoryId,
            @Valid @RequestBody CategoryDTO categoryDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        CategoryDTO updatedCategory = categoryService.updateCategory(categoryId, getUserId(userDetails), categoryDTO);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", updatedCategory));
    }

    @Operation(summary = "Delete category", description = "Delete a category")
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @Parameter(description = "Category ID", required = true)
            @PathVariable String categoryId,
            @AuthenticationPrincipal UserDetails userDetails) {

        categoryService.deleteCategory(categoryId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }

    @Operation(summary = "Get category suggestions", description = "Get category suggestions based on merchant name")
    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<String>> getCategorySuggestion(
            @Parameter(description = "Merchant name")
            @RequestParam String merchantName,
            @Parameter(description = "Description")
            @RequestParam(required = false) String description) {

        String suggestion = categoryService.suggestCategory(merchantName, description != null ? description : "");
        return ResponseEntity.ok(ApiResponse.success(suggestion));
    }

    private String getUserId(UserDetails userDetails) {
        return ((com.jaiswal.model.document.User) userDetails).getId();
    }
}

