package com.hayding.message.service;

import com.hayding.message.dto.ConversationResponse;
import com.hayding.message.dto.CreateConversationRequest;
import com.hayding.message.dto.MessageResponse;
import com.hayding.message.dto.SendMessageRequest;
import com.hayding.message.model.Conversation;
import com.hayding.message.model.Message;
import com.hayding.message.repository.ConversationRepository;
import com.hayding.message.repository.MessageRepository;
import com.hayding.product.dto.ProductImageResponse;
import com.hayding.product.dto.ProductResponse;
import com.hayding.product.model.Product;
import com.hayding.product.repository.ProductImageRepository;
import com.hayding.product.repository.ProductRepository;
import com.hayding.user.model.User;
import com.hayding.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;

    public MessageService(ConversationRepository conversationRepository,
                          MessageRepository messageRepository,
                          ProductRepository productRepository,
                          ProductImageRepository productImageRepository,
                          UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ConversationResponse createOrGetConversation(CreateConversationRequest request, String buyerEmail) {
        User buyer = getUserByEmail(buyerEmail);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        User seller = product.getSeller();

        if (seller.getId().equals(buyer.getId())) {
            throw new IllegalArgumentException("You cannot create a conversation for your own product");
        }

        Conversation conversation = conversationRepository
                .findByProductIdAndBuyerIdAndSellerId(product.getId(), buyer.getId(), seller.getId())
                .orElseGet(() -> conversationRepository.save(new Conversation(product, buyer, seller)));

        return toConversationResponse(conversation);
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getMyConversations(String userEmail) {
        User user = getUserByEmail(userEmail);

        return conversationRepository
                .findByBuyerIdOrSellerIdOrderByUpdatedAtDesc(user.getId(), user.getId())
                .stream()
                .map(this::toConversationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Long conversationId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Conversation conversation = getConversationById(conversationId);

        validateParticipant(conversation, user);

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(MessageResponse::fromEntity)
                .toList();
    }

    @Transactional
    public MessageResponse sendMessage(Long conversationId, SendMessageRequest request, String senderEmail) {
        User sender = getUserByEmail(senderEmail);
        Conversation conversation = getConversationById(conversationId);

        validateParticipant(conversation, sender);

        Message message = new Message(conversation, sender, request.getContent());
        Message savedMessage = messageRepository.save(message);

        conversationRepository.save(conversation);

        return MessageResponse.fromEntity(savedMessage);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private Conversation getConversationById(Long conversationId) {
        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
    }

    private void validateParticipant(Conversation conversation, User user) {
        boolean isBuyer = conversation.getBuyer().getId().equals(user.getId());
        boolean isSeller = conversation.getSeller().getId().equals(user.getId());

        if (!isBuyer && !isSeller) {
            throw new IllegalArgumentException("You are not allowed to access this conversation");
        }
    }

    private ConversationResponse toConversationResponse(Conversation conversation) {
        return ConversationResponse.fromEntity(
                conversation,
                toProductResponse(conversation.getProduct())
        );
    }

    private ProductResponse toProductResponse(Product product) {
        List<ProductImageResponse> images = productImageRepository
                .findByProductIdOrderBySortOrderAsc(product.getId())
                .stream()
                .map(ProductImageResponse::fromEntity)
                .toList();

        return ProductResponse.fromEntity(product, images);
    }
}