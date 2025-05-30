package com.jaiswal.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryDTO {

    private String id;

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
            message = "Color must be a valid hex color")
    private String color;

    private String icon;

    private String parentCategoryId;
    private String parentCategoryName;

    private Boolean isDefault;
    private Boolean isActive;

    private List<String> keywords;
    private CategoryBudgetDTO budget;
    private BigDecimal currentMonthSpending;
    private BigDecimal currentYearSpending;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBudgetDTO {
        private BigDecimal monthlyLimit;
        private BigDecimal yearlyLimit;
        private Boolean alertEnabled;
        private BigDecimal alertThreshold;
    }
}

