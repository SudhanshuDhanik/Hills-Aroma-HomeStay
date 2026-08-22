package com.homestay.backend.dto;

import com.homestay.backend.entity.BookingStatus;
import com.homestay.backend.entity.PaymentStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingDtos {

    @Data
    public static class EnquiryRequest {
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
    public static class ManualBookingRequest extends EnquiryRequest {
        private BookingStatus status; // admin can create directly as CONFIRMED
        private BigDecimal totalAmount; // optional — admin can leave blank for phone bookings
    }

    @Data
    public static class StatusUpdateRequest {
        @NotNull
        private BookingStatus status;
    }

    @Data
    public static class BookingResponse {
        private Long id;
        private Long roomId;
        private String roomName;
        private String guestName;
        private String phone;
        private String whatsapp;
        private String email;
        private LocalDate checkIn;
        private LocalDate checkOut;
        private Integer guests;
        private String message;
        private BookingStatus status;
        private BigDecimal totalAmount;
        private PaymentStatus paymentStatus;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class AvailabilityResponse {
        private Long roomId;
        private LocalDate checkIn;
        private LocalDate checkOut;
        private boolean available;
    }
}
