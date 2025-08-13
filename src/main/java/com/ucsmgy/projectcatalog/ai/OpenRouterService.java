package com.ucsmgy.projectcatalog.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;

@Service
public class OpenRouterService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    private final WebClient webClient;

    public OpenRouterService(WebClient.Builder webClientBuilder, @Value("${openrouter.api.url}") String apiUrl) {
        this.webClient = webClientBuilder.baseUrl(apiUrl).build();
    }

    // Method to get an answer, now accepts a modelId parameter
    // Method to get an answer, now accepts a list of Message objects
    public String getAnswer(List<Message> messages, String modelId) {
        ChatCompletionRequest request = new ChatCompletionRequest();
        request.setModel(modelId);
        request.setMessages(messages);

        Mono<ChatCompletionResponse> responseMono = webClient.post()
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .body(BodyInserters.fromValue(request))
                .retrieve()
                .bodyToMono(ChatCompletionResponse.class);

        ChatCompletionResponse response = responseMono.block();

        if (response != null && !response.getChoices().isEmpty()) {
            return response.getChoices().get(0).getMessage().getContent();
        }
        return "Sorry, I couldn't get an answer.";
    }
}
