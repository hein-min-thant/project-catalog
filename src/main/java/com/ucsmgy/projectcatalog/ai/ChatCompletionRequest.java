package com.ucsmgy.projectcatalog.ai;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class ChatCompletionRequest {
    private String model;
    private List<Message> messages;

}
