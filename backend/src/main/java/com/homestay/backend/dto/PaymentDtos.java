package com.homestay.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

public class PaymentDtos {

    @Data
    public static class CreateOrderRequest {
        @NotNull
        private Long roomId;
        @NotBlank
        private String guestName;
        @NotBlank
        private String phone;
        private String whatsapp;
        @Email
        private String email;
        @NotNull
        private LocalDate checkIn;
        @NotNull
        private LocalDate checkOut;
        @NotNull @Min(1)
        private Integer guests;
        private String message;
    }

    @Data
    public static class CreateOrderResponse {
        private Long bookingId;
        private String razorpayOrderId;
        private long amountInPaise;
        private String currency;
        private String razorpayKeyId; // public key — safe to send to frontend
        private String homestayName;
    }

    @Data
    public static class VerifyPaymentRequest {
        @NotNull
        private Long bookingId;
        @NotBlank
        private String razorpayOrderId;
        @NotBlank
        private String razorpayPaymentId;
        @NotBlank
        private String razorpaySignature;
    }
}
