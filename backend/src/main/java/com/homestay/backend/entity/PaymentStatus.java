package com.homestay.backend.entity;

public enum PaymentStatus {
    UNPAID,   // enquiry, or manual admin booking with no online payment
    PAID,     // Razorpay signature verified successfully
    FAILED    // signature verification failed, or payment gateway reported failure
}
