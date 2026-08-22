package com.homestay.backend.repository;

import com.homestay.backend.entity.Booking;
import com.homestay.backend.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByRoomId(Long roomId);

    List<Booking> findAllByOrderByCreatedAtDesc();

    /**
     * Overlap rule (checkout-day-is-free convention):
     * Two ranges [checkIn1, checkOut1) and [checkIn2, checkOut2) overlap when
     * checkIn1 < checkOut2 AND checkIn2 < checkOut1.
     * Only PENDING and CONFIRMED bookings block a room; CANCELLED never blocks.
     */
    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId " +
           "AND b.status IN :statuses " +
           "AND b.checkIn < :checkOut AND :checkIn < b.checkOut")
    List<Booking> findOverlapping(Long roomId, LocalDate checkIn, LocalDate checkOut, List<BookingStatus> statuses);
}
