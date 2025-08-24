package com.ucsmgy.projectcatalog.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class OpenRouterService {
    
    private static final Logger logger = LoggerFactory.getLogger(OpenRouterService.class);

    @Value("${openrouter.api.key}")
    private String apiKey;

    private final WebClient webClient;

    public OpenRouterService(WebClient.Builder webClientBuilder, @Value("${openrouter.api.url}") String apiUrl) {
        this.webClient = webClientBuilder.baseUrl(apiUrl).build();
        logger.info("OpenRouterService initialized with URL: {}", apiUrl);
    }

    public String getAnswer(List<Message> messages, String modelId) {
        try {
            logger.info("Processing request with model: {}, messages count: {}", modelId, messages.size());
            
            if (messages == null || messages.isEmpty()) {
                logger.error("Messages list is null or empty");
                return "Error: No messages provided";
            }

            if (apiKey == null || apiKey.trim().isEmpty()) {
                logger.error("API key is not configured");
                return "Error: API key not configured";
            }

            ChatCompletionRequest request = new ChatCompletionRequest();
            request.setModel(modelId);
            request.setMessages(messages);

            logger.debug("Sending request to OpenRouter: {}", request);

            Mono<ChatCompletionResponse> responseMono = webClient.post()
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .body(BodyInserters.fromValue(request))
                    .retrieve()
                    .bodyToMono(ChatCompletionResponse.class);

            ChatCompletionResponse response = responseMono.block();

            if (response != null && response.getChoices() != null && !response.getChoices().isEmpty()) {
                String content = response.getChoices().get(0).getMessage().getContent();
                logger.info("Successfully received response from OpenRouter");
                return content;
            } else {
                logger.warn("Empty or invalid response from OpenRouter");
                return "Sorry, I couldn't get a valid answer from the AI service.";
            }
        } catch (Exception e) {
            logger.error("Error calling OpenRouter API", e);
            return "Sorry, there was an error communicating with the AI service: " + e.getMessage();
        }
    }
}
