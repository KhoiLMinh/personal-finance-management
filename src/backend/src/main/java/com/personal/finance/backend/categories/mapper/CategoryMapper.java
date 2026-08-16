package com.personal.finance.backend.categories.mapper;

import com.personal.finance.backend.categories.dto.response.CategoryDTO;
import com.personal.finance.backend.categories.dto.response.CategoryRuleDTO;
import com.personal.finance.backend.categories.entity.Category;
import com.personal.finance.backend.categories.entity.CategoryRule;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryDTO toDTO(Category category) {
        if (category == null) return null;
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setType(category.getType());
        dto.setIcon(category.getIcon());
        dto.setColor(category.getColor());
        dto.setHidden(category.isHidden());
        dto.setParentId(category.getParent() != null ? category.getParent().getId() : null);
        return dto;
    }

    public CategoryRuleDTO toDTO(CategoryRule rule) {
        if (rule == null) return null;
        CategoryRuleDTO dto = new CategoryRuleDTO();
        dto.setId(rule.getId());
        dto.setKeyword(rule.getKeyword());
        dto.setPriority(rule.getPriority());
        return dto;
    }
}