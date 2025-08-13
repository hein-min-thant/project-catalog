package com.ucsmgy.projectcatalog.ai;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class ChatCompletionResponse {
    // Getters and setters
    private List<Choice> choices;

}