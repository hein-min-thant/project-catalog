package com.ucsmgy.projectcatalog.controllers;

import com.ucsmgy.projectcatalog.ai.Message;
import com.ucsmgy.projectcatalog.ai.OpenRouterService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@AllArgsConstructor
public class AIController {

    private final OpenRouterService openRouterService;

    @PostMapping("/generate")
    public ResponseEntity<String> askQuestion(@RequestBody Map<String, Object> payload){
        List<Message> messages = (List<Message>) payload.get("messages");
        String modelId = (String) payload.get("modelId");

        if (modelId == null || modelId.isEmpty()) {
            modelId = "deepseek/deepseek-chat-v3-0324:free";
        }

        // Pass the entire conversation history to the service
        String answer = openRouterService.getAnswer(messages, modelId);
        return ResponseEntity.ok(answer);
    }
}
