package com.homestay.backend.service;

import com.homestay.backend.dto.PaymentDtos;
import com.homestay.backend.dto.BookingDtos;
import com.homestay.backend.dto.PriceQuoteDto;
import com.homestay.backend.entity.Booking;
import com.homestay.backend.entity.BookingStatus;
import com.homestay.backend.entity.PaymentStatus;
import com.homestay.backend.entity.Room;
import com.homestay.backend.exception.BookingConflictException;
import com.homestay.backend.exception.PaymentException;
import com.homestay.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Orchestrates the online-payment booking flow:
 *
 *   createOrder():  validate guests + availability -> compute price (PricingService, the ONLY
 *                    place price is ever calculated) -> create a PENDING/UNPAID Booking row
 *                    -> create a matching Razorpay order for that exact amount -> return the
 *                    order details the frontend needs to open Razorpay Checkout.
 *
 *   verifyPayment(): look up the Booking by ID -> verify the Razorpay signature server-side
 *                    -> re-check for a CONFIRMED conflict (a second booking could have been
 *                    confirmed while this payment was in flight) -> if clear, mark CONFIRMED
 *                    + PAID. If a conflict is found despite the payment succeeding, the booking
 *                    is left PENDING with paymentStatus PAID and flagged for the owner to
 *                    manually resolve (contact the guest, offer another room/refund) — this
 *                    project does not implement automatic refunds.
 */
@Service
public class PaymentService {

    private final BookingService bookingService;
    private final PricingService pricingService;
    private final RazorpayService razorpayService;

    @Value("${app.homestay-name:Our Homestay}")
    private String homestayName;

    public PaymentService(BookingService bookingService, PricingService pricingService,
                           RazorpayService razorpayService) {
        this.bookingService = bookingService;
        this.pricingService = pricingService;
        this.razorpayService = razorpayService;
    }

    public PriceQuoteDto quote(Long roomId, java.time.LocalDate checkIn, java.time.LocalDate checkOut, int guests) {
        bookingService.validateDateRange(checkIn, checkOut);
        Room room = bookingService.findRoomOrThrow(roomId);
        bookingService.validateGuestCount(room, guests);
        return pricingService.calculate(room, checkIn, checkOut, guests);
    }

    public PaymentDtos.CreateOrderResponse createOrder(PaymentDtos.CreateOrderRequest req) {
        bookingService.validateDateRange(req.getCheckIn(), req.getCheckOut());
        Room room = bookingService.findRoomOrThrow(req.getRoomId());
        bookingService.validateGuestCount(room, req.getGuests());

        if (!bookingService.isAvailable(req.getRoomId(), req.getCheckIn(), req.getCheckOut(), null)) {
            throw new BookingConflictException(
                    "This room is no longer available for the selected dates. Please choose different dates.");
        }

        PriceQuoteDto quote = pricingService.calculate(room, req.getCheckIn(), req.getCheckOut(), req.getGuests());

        Booking booking = Booking.builder()
                .room(room)
                .guestName(req.getGuestName())
                .phone(req.getPhone())
                .whatsapp(req.getWhatsapp())
                .email(req.getEmail())
                .checkIn(req.getCheckIn())
                .checkOut(req.getCheckOut())
                .guests(req.getGuests())
                .message(req.getMessage())
                .status(BookingStatus.PENDING)
                .totalAmount(quote.getTotalAmount())
                .paymentStatus(PaymentStatus.UNPAID)
                .build();
        booking = bookingService.save(booking);

        long amountInPaise = quote.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .longValueExact();

        String razorpayOrderId = razorpayService.createOrder(amountInPaise, "booking-" + booking.getId() + "-" + UUID.randomUUID());
        booking.setRazorpayOrderId(razorpayOrderId);
        booking = bookingService.save(booking);

        PaymentDtos.CreateOrderResponse response = new PaymentDtos.CreateOrderResponse();
        response.setBookingId(booking.getId());
        response.setRazorpayOrderId(razorpayOrderId);
        response.setAmountInPaise(amountInPaise);
        response.setCurrency("INR");
        response.setRazorpayKeyId(razorpayService.getKeyId());
        response.setHomestayName(homestayName);
        return response;
    }

    public BookingDtos.BookingResponse verifyPayment(PaymentDtos.VerifyPaymentRequest req) {
        Booking booking = bookingService.findBookingOrThrow(req.getBookingId());

        if (booking.getRazorpayOrderId() == null || !booking.getRazorpayOrderId().equals(req.getRazorpayOrderId())) {
            throw new PaymentException("Order ID does not match this booking.");
        }

        boolean valid = razorpayService.verifySignature(
                req.getRazorpayOrderId(), req.getRazorpayPaymentId(), req.getRazorpaySignature());

        if (!valid) {
            booking.setPaymentStatus(PaymentStatus.FAILED);
            bookingService.save(booking);
            throw new PaymentException("Payment verification failed. If money was deducted, it will be refunded by Razorpay automatically, or please contact us.");
        }

        booking.setRazorpayPaymentId(req.getRazorpayPaymentId());
        booking.setRazorpaySignature(req.getRazorpaySignature());
        booking.setPaymentStatus(PaymentStatus.PAID);

        try {
            bookingService.assertNoConfirmedConflict(
                    booking.getRoom().getId(), booking.getCheckIn(), booking.getCheckOut(), booking.getId());
            booking.setStatus(BookingStatus.CONFIRMED);
        } catch (BookingConflictException e) {
            // Payment succeeded but another booking got confirmed first (rare race condition).
            // Leave status PENDING with paymentStatus PAID — this surfaces clearly in the admin
            // dashboard as "paid but not confirmed" so the owner can manually resolve it.
            // No automatic refund is issued.
        }

        booking = bookingService.save(booking);
        return bookingService.toDto(booking);
    }
}
