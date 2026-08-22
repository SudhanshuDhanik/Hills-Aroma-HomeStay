package com.homestay.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Backend-computed price breakdown. Returned to the frontend so the customer can see the
 * total BEFORE paying, but this is never trusted as the final authority — the backend
 * recomputes this exact breakdown again when a Razorpay order is created, and that
 * recomputed amount (not anything from the frontend) is what the customer is actually charged.
 */
@Data
public class PriceQuoteDto {
    private Long roomId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer guests;
    private Integer nights;
    private Integer weekdayNights;
    private Integer weekendNights;
    private BigDecimal roomTotal;       // sum of nightly weekday/weekend rates, before extra-guest charge
    private BigDecimal extraGuestTotal; // extra guests × extraGuestPrice × nights
    private BigDecimal subtotal;        // roomTotal + extraGuestTotal
    private BigDecimal discountAmount;  // subtotal × discountPercent
    private BigDecimal totalAmount;     // subtotal - discountAmount — this is what gets charged
}
