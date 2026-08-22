package com.homestay.backend.controller;

import com.homestay.backend.dto.BookingDtos;
import com.homestay.backend.dto.PaymentDtos;
import com.homestay.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /** Step 1 of online payment: backend computes the price, creates a PENDING booking row,
     *  and creates a matching Razorpay order. Nothing is charged yet. */
    @PostMapping("/create-order")
    public PaymentDtos.CreateOrderResponse createOrder(@Valid @RequestBody PaymentDtos.CreateOrderRequest req) {
        return paymentService.createOrder(req);
    }

    /** Step 2: called after Razorpay Checkout succeeds on the frontend. Verifies the payment
     *  signature server-side before confirming the booking — the frontend's word alone is
     *  never trusted. */
    @PostMapping("/verify")
    public BookingDtos.BookingResponse verify(@Valid @RequestBody PaymentDtos.VerifyPaymentRequest req) {
        return paymentService.verifyPayment(req);
    }
}
