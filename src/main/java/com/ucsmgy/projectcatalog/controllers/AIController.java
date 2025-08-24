package com.ucsmgy.projectcatalog.controllers;

import com.ucsmgy.projectcatalog.ai.Message;
import com.ucsmgy.projectcatalog.ai.OpenRouterService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@AllArgsConstructor
public class AIController {

    private static final Logger logger = LoggerFactory.getLogger(AIController.class);
    private final OpenRouterService openRouterService;

    @PostMapping("/generate")
    public ResponseEntity<String> askQuestion(@RequestBody Map<String, Object> payload){
        try {
            logger.info("Received AI request with payload: {}", payload);
            
            @SuppressWarnings("unchecked")
            List<Message> messages = (List<Message>) payload.get("messages");
            String modelId = (String) payload.get("modelId");

            if (messages == null || messages.isEmpty()) {
                logger.error("Messages list is null or empty");
                return ResponseEntity.badRequest().body("Error: No messages provided");
            }

            if (modelId == null || modelId.isEmpty()) {
                modelId = "deepseek/deepseek-chat-v3-0324:free";
                logger.info("Using default model: {}", modelId);
            }

            logger.info("Processing request with {} messages and model: {}", messages.size(), modelId);
            
            String answer = openRouterService.getAnswer(messages, modelId);
            
            logger.info("Successfully generated response");
            return ResponseEntity.ok(answer);
            
        } catch (Exception e) {
            logger.error("Error processing AI request", e);
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
