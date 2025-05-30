
package com.jaiswal.model.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "categories")
@CompoundIndex(def = "{'userId': 1, 'name': 1}", unique = true)
public class Category {

    @Id
    private String id;

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
            message = "Color must be a valid hex color")
    @Builder.Default
    private String color = "#6366f1";

    @Builder.Default
    private String icon = "📁";

    @Indexed
    private String userId; // null for system categories

    private String parentCategoryId;

    @Builder.Default
    private boolean isDefault = false;

    @Builder.Default
    private boolean isActive = true;

    private List<String> keywords; // for auto-categorization

    private CategoryBudget budget;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBudget {
        private java.math.BigDecimal monthlyLimit;
        private java.math.BigDecimal yearlyLimit;
        private boolean alertEnabled;
        private java.math.BigDecimal alertThreshold; // percentage (0.8 = 80%)
    }
}
