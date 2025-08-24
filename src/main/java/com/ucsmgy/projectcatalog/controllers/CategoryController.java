package com.ucsmgy.projectcatalog.controllers;

import com.ucsmgy.projectcatalog.entities.Category;
import com.ucsmgy.projectcatalog.exceptions.EntityNotFoundException;
import com.ucsmgy.projectcatalog.services.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/{id}")
    public ResponseEntity<String> getCategoryName(@PathVariable("id") Long categoryId) {
        try {
            String category = categoryService.getCategoryById(categoryId).getName();
            return ResponseEntity.ok(category);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // You can also add a global exception handler or keep it specific to this controller
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Void> handleEntityNotFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
