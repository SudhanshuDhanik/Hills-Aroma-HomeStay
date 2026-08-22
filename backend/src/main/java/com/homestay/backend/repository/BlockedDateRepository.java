package com.homestay.backend.repository;

import com.homestay.backend.entity.BlockedDate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BlockedDateRepository extends JpaRepository<BlockedDate, Long> {

    List<BlockedDate> findByRoomId(Long roomId);

    // Overlap: existing.startDate < newCheckOut AND existing.endDate > newCheckIn
    @org.springframework.data.jpa.repository.Query(
        "SELECT b FROM BlockedDate b WHERE b.room.id = :roomId " +
        "AND b.startDate < :checkOut AND b.endDate > :checkIn"
    )
    List<BlockedDate> findOverlapping(Long roomId, LocalDate checkIn, LocalDate checkOut);
}
