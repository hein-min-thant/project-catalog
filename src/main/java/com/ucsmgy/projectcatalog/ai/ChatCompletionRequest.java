package com.ucsmgy.projectcatalog.ai;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class ChatCompletionRequest {
    // Getters and setters
    private String model;
    private List<Message> messages;

}
