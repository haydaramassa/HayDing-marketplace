package com.hayding.message.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SendMessageRequest {

    @NotBlank
    @Size(max = 2000)
    private String content;

    public SendMessageRequest() {
    }

    public String getContent() {
        return content;
    }
}