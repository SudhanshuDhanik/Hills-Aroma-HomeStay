package com.homestay.backend.controller;

import com.homestay.backend.dto.PriceQuoteDto;
import com.homestay.backend.dto.RoomDto;
import com.homestay.backend.service.PaymentService;
import com.homestay.backend.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
public class RoomController {

    private final RoomService roomService;
    private final PaymentService paymentService;

    public RoomController(RoomService roomService, PaymentService paymentService) {
        this.roomService = roomService;
        this.paymentService = paymentService;
    }

    // ---- Public ----

    @GetMapping("/api/rooms")
    public List<RoomDto.RoomResponse> getAllActive() {
        return roomService.getAllActive();
    }

    @GetMapping("/api/rooms/{id}")
    public RoomDto.RoomResponse getById(@PathVariable Long id) {
        return roomService.getById(id);
    }

    /** Public price quote — shown to the customer before payment. The real charge is always
     *  recomputed backend-side again in PaymentService.createOrder(), so this can never be
     *  the final authority even though it uses the exact same calculation. */
    @GetMapping("/api/rooms/{id}/price")
    public PriceQuoteDto getPriceQuote(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam Integer guests) {
        return paymentService.quote(id, checkIn, checkOut, guests);
    }

    // ---- Admin ----

    @GetMapping("/api/admin/rooms")
    public List<RoomDto.RoomResponse> getAllForAdmin() {
        return roomService.getAllForAdmin();
    }

    @PostMapping("/api/admin/rooms")
    public RoomDto.RoomResponse create(@Valid @RequestBody RoomDto.RoomRequest req) {
        return roomService.create(req);
    }

    @PutMapping("/api/admin/rooms/{id}")
    public RoomDto.RoomResponse update(@PathVariable Long id, @Valid @RequestBody RoomDto.RoomRequest req) {
        return roomService.update(id, req);
    }

    @PatchMapping("/api/admin/rooms/{id}/pricing")
    public RoomDto.RoomResponse updatePricing(@PathVariable Long id, @Valid @RequestBody RoomDto.PricingRequest req) {
        return roomService.updatePricing(id, req);
    }

    @DeleteMapping("/api/admin/rooms/{id}")
    public void delete(@PathVariable Long id) {
        roomService.delete(id);
    }
}
