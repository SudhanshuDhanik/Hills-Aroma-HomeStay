package com.homestay.backend.controller;

import com.homestay.backend.dto.BookingDtos;
import com.homestay.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // ---- Public ----

    @GetMapping("/api/rooms/{roomId}/availability")
    public BookingDtos.AvailabilityResponse checkAvailability(
            @PathVariable Long roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        return bookingService.checkAvailability(roomId, checkIn, checkOut);
    }

    @PostMapping("/api/enquiries")
    public BookingDtos.BookingResponse submitEnquiry(@Valid @RequestBody BookingDtos.EnquiryRequest req) {
        return bookingService.submitEnquiry(req);
    }

    // ---- Admin ----

    @GetMapping("/api/admin/bookings")
    public List<BookingDtos.BookingResponse> getAll() {
        return bookingService.getAll();
    }

    @GetMapping("/api/admin/rooms/{roomId}/bookings")
    public List<BookingDtos.BookingResponse> getByRoom(@PathVariable Long roomId) {
        return bookingService.getByRoom(roomId);
    }

    @PostMapping("/api/admin/bookings")
    public BookingDtos.BookingResponse createManual(@Valid @RequestBody BookingDtos.ManualBookingRequest req) {
        return bookingService.createManualBooking(req);
    }

    @PatchMapping("/api/admin/bookings/{id}/status")
    public BookingDtos.BookingResponse updateStatus(@PathVariable Long id,
                                                      @Valid @RequestBody BookingDtos.StatusUpdateRequest req) {
        return bookingService.updateStatus(id, req.getStatus());
    }
}
