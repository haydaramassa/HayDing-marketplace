package com.hayding.message.controller;

import com.hayding.common.dto.ApiResponse;
import com.hayding.message.dto.ConversationResponse;
import com.hayding.message.dto.CreateConversationRequest;
import com.hayding.message.dto.MessageResponse;
import com.hayding.message.dto.SendMessageRequest;
import com.hayding.message.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping
    public ApiResponse<ConversationResponse> createOrGetConversation(
            @Valid @RequestBody CreateConversationRequest request,
            Authentication authentication
    ) {
        ConversationResponse conversation =
                messageService.createOrGetConversation(request, authentication.getName());

        return ApiResponse.success("Conversation created or fetched successfully", conversation);
    }

    @GetMapping
    public ApiResponse<List<ConversationResponse>> getMyConversations(Authentication authentication) {
        List<ConversationResponse> conversations =
                messageService.getMyConversations(authentication.getName());

        return ApiResponse.success("Conversations fetched successfully", conversations);
    }

    @GetMapping("/{id}/messages")
    public ApiResponse<List<MessageResponse>> getMessages(@PathVariable Long id,
                                                          Authentication authentication) {
        List<MessageResponse> messages =
                messageService.getMessages(id, authentication.getName());

        return ApiResponse.success("Messages fetched successfully", messages);
    }

    @PostMapping("/{id}/messages")
    public ApiResponse<MessageResponse> sendMessage(@PathVariable Long id,
                                                    @Valid @RequestBody SendMessageRequest request,
                                                    Authentication authentication) {
        MessageResponse message =
                messageService.sendMessage(id, request, authentication.getName());

        return ApiResponse.success("Message sent successfully", message);
    }
}