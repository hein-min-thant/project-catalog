package com.ucsmgy.projectcatalog.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ucsmgy.projectcatalog.entities.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class WebSocketHandler extends TextWebSocketHandler {
    
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("WebSocket connection established: {}", session.getId());
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            String payload = message.getPayload();
            log.info("Received WebSocket message: {}", payload);
            
            // Parse the message to extract user ID and subscription info
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);
            String type = (String) data.get("type");
            
            if ("SUBSCRIBE".equals(type)) {
                String destination = (String) data.get("destination");
                if (destination != null && destination.startsWith("/topic/notifications/")) {
                    String userId = destination.substring("/topic/notifications/".length());
                    userSessions.put(userId, session);
                    log.info("User {} subscribed to notifications", userId);
                    
                    // Send confirmation message
                    session.sendMessage(new TextMessage("{\"type\":\"SUBSCRIBED\",\"message\":\"Successfully subscribed to notifications\"}"));
                }
            }
        } catch (Exception e) {
            log.error("Error handling WebSocket message", e);
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        log.info("WebSocket connection closed: {}", session.getId());
        
        // Remove the session from userSessions
        userSessions.entrySet().removeIf(entry -> entry.getValue().equals(session));
    }
    
    public void sendNotificationToUser(Long userId, Notification notification) {
        WebSocketSession session = userSessions.get(userId.toString());
        if (session != null && session.isOpen()) {
            try {
                String notificationJson = objectMapper.writeValueAsString(Map.of(
                    "type", "NOTIFICATION",
                    "payload", notification
                ));
                session.sendMessage(new TextMessage(notificationJson));
                log.info("Notification sent to user {}: {}", userId, notification.getId());
            } catch (IOException e) {
                log.error("Failed to send notification to user {}", userId, e);
                // Remove the session if it's no longer valid
                userSessions.remove(userId.toString());
            }
        }
    }
}
