package com.homestay.backend.service;

import com.homestay.backend.dto.BookingDtos;
import com.homestay.backend.entity.Booking;
import com.homestay.backend.entity.BookingStatus;
import com.homestay.backend.entity.PaymentStatus;
import com.homestay.backend.entity.Room;
import com.homestay.backend.exception.BookingConflictException;
import com.homestay.backend.exception.ResourceNotFoundException;
import com.homestay.backend.repository.BlockedDateRepository;
import com.homestay.backend.repository.BookingRepository;
import com.homestay.backend.repository.RoomRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Availability / overlap rules used throughout this class:
 *
 * Convention: a stay occupies the room for [checkIn, checkOut) — the check-out date itself
 * is NOT occupied, so a new booking may legally start on another booking's check-out date.
 *
 * Two ranges [checkIn1, checkOut1) and [checkIn2, checkOut2) overlap when:
 *     checkIn1 < checkOut2  AND  checkIn2 < checkOut1
 *
 * A room is "unavailable" for a requested range if there exists ANY booking with status
 * PENDING or CONFIRMED that overlaps it, OR any BlockedDate range that overlaps it.
 * CANCELLED bookings never block availability.
 *
 * Promoting a booking to CONFIRMED (via updateStatus, manual booking creation, or a verified
 * online payment in PaymentService) is blocked if it would collide with another
 * already-CONFIRMED booking — this is the one hard guarantee: two customers can never both
 * hold a CONFIRMED booking for overlapping dates on the same room.
 */
@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final BlockedDateRepository blockedDateRepository;

    public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository,
                           BlockedDateRepository blockedDateRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.blockedDateRepository = blockedDateRepository;
    }

    public BookingDtos.AvailabilityResponse checkAvailability(Long roomId, LocalDate checkIn, LocalDate checkOut) {
        validateDateRange(checkIn, checkOut);
        boolean available = isAvailable(roomId, checkIn, checkOut, null);

        BookingDtos.AvailabilityResponse response = new BookingDtos.AvailabilityResponse();
        response.setRoomId(roomId);
        response.setCheckIn(checkIn);
        response.setCheckOut(checkOut);
        response.setAvailable(available);
        return response;
    }

    public BookingDtos.BookingResponse submitEnquiry(@Valid BookingDtos.EnquiryRequest req) {
        validateDateRange(req.getCheckIn(), req.getCheckOut());
        Room room = findRoomOrThrow(req.getRoomId());
        validateGuestCount(room, req.getGuests());

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
                .paymentStatus(PaymentStatus.UNPAID)
                .build();

        return toDto(bookingRepository.save(booking));
    }

    public BookingDtos.BookingResponse createManualBooking(BookingDtos.ManualBookingRequest req) {
        validateDateRange(req.getCheckIn(), req.getCheckOut());
        Room room = findRoomOrThrow(req.getRoomId());
        validateGuestCount(room, req.getGuests());

        BookingStatus status = req.getStatus() != null ? req.getStatus() : BookingStatus.PENDING;

        if (status == BookingStatus.CONFIRMED) {
            assertNoConfirmedConflict(req.getRoomId(), req.getCheckIn(), req.getCheckOut(), null);
        }

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
                .status(status)
                .totalAmount(req.getTotalAmount())
                .paymentStatus(PaymentStatus.UNPAID)
                .build();

        return toDto(bookingRepository.save(booking));
    }

    public BookingDtos.BookingResponse updateStatus(Long bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (newStatus == BookingStatus.CONFIRMED) {
            assertNoConfirmedConflict(booking.getRoom().getId(), booking.getCheckIn(), booking.getCheckOut(), bookingId);
        }

        booking.setStatus(newStatus);
        return toDto(bookingRepository.save(booking));
    }

    public List<BookingDtos.BookingResponse> getAll() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    public List<BookingDtos.BookingResponse> getByRoom(Long roomId) {
        return bookingRepository.findByRoomId(roomId).stream().map(this::toDto).toList();
    }

    public BookingDtos.BookingResponse getById(Long id) {
        return toDto(findBookingOrThrow(id));
    }

    // ---- shared helpers, also used by PaymentService ----

    public void validateGuestCount(Room room, int guests) {
        if (guests < 1) {
            throw new IllegalArgumentException("Guest count must be at least 1");
        }
        if (guests > room.getMaxGuests()) {
            throw new IllegalArgumentException(
                    "This room sleeps a maximum of " + room.getMaxGuests() + " guests");
        }
    }

    public boolean isAvailable(Long roomId, LocalDate checkIn, LocalDate checkOut, Long excludeBookingId) {
        List<Booking> overlaps = bookingRepository.findOverlapping(
                roomId, checkIn, checkOut, List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED));

        boolean bookingConflict = overlaps.stream()
                .anyMatch(b -> excludeBookingId == null || !b.getId().equals(excludeBookingId));

        boolean blockedConflict = !blockedDateRepository.findOverlapping(roomId, checkIn, checkOut).isEmpty();

        return !bookingConflict && !blockedConflict;
    }

    public void assertNoConfirmedConflict(Long roomId, LocalDate checkIn, LocalDate checkOut, Long excludeBookingId) {
        List<Booking> overlaps = bookingRepository.findOverlapping(
                roomId, checkIn, checkOut, List.of(BookingStatus.CONFIRMED));

        boolean conflict = overlaps.stream()
                .anyMatch(b -> excludeBookingId == null || !b.getId().equals(excludeBookingId));

        if (conflict) {
            throw new BookingConflictException(
                    "This room already has a CONFIRMED booking overlapping these dates.");
        }
    }

    public void validateDateRange(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            throw new IllegalArgumentException("Check-in and check-out dates are required");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }
        if (checkIn.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Check-in date cannot be in the past");
        }
    }

    public Room findRoomOrThrow(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomId));
    }

    public Booking findBookingOrThrow(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
    }

    public Booking save(Booking booking) {
        return bookingRepository.save(booking);
    }

    public BookingDtos.BookingResponse toDto(Booking b) {
        BookingDtos.BookingResponse dto = new BookingDtos.BookingResponse();
        dto.setId(b.getId());
        dto.setRoomId(b.getRoom().getId());
        dto.setRoomName(b.getRoom().getName());
        dto.setGuestName(b.getGuestName());
        dto.setPhone(b.getPhone());
        dto.setWhatsapp(b.getWhatsapp());
        dto.setEmail(b.getEmail());
        dto.setCheckIn(b.getCheckIn());
        dto.setCheckOut(b.getCheckOut());
        dto.setGuests(b.getGuests());
        dto.setMessage(b.getMessage());
        dto.setStatus(b.getStatus());
        dto.setTotalAmount(b.getTotalAmount());
        dto.setPaymentStatus(b.getPaymentStatus());
        dto.setCreatedAt(b.getCreatedAt());
        dto.setUpdatedAt(b.getUpdatedAt());
        return dto;
    }
}
