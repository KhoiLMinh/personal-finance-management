package com.personal.finance.backend.categories.controller;

import com.personal.finance.backend.categories.dto.request.CreateCategoryRequest;
import com.personal.finance.backend.categories.dto.request.CreateCategoryRuleRequest;
import com.personal.finance.backend.categories.dto.request.UpdateCategoryRequest;
import com.personal.finance.backend.categories.dto.response.CategoryDTO;
import com.personal.finance.backend.categories.dto.response.CategoryRuleDTO;
import com.personal.finance.backend.categories.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.createCategory(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getMyCategories(@RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(categoryService.getCategoriesForUser(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, userId, request));
    }

    @PatchMapping("/{id}/hide")
    public ResponseEntity<Void> hideCategory(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        categoryService.hideCategory(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/unhide")
    public ResponseEntity<Void> unhideCategory(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        categoryService.unhideCategory(id, userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        categoryService.deleteCategory(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/rules")
    public ResponseEntity<CategoryRuleDTO> addRule(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody CreateCategoryRuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.addRule(id, userId, request));
    }

    @GetMapping("/{id}/rules")
    public ResponseEntity<List<CategoryRuleDTO>> getRules(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getRules(id, userId));
    }

    @DeleteMapping("/{id}/rules/{ruleId}")
    public ResponseEntity<Void> deleteRule(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @PathVariable Long ruleId) {
        categoryService.deleteRule(id, ruleId, userId);
        return ResponseEntity.noContent().build();
    }
}