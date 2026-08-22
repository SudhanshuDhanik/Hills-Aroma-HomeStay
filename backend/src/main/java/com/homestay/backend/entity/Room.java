package com.homestay.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Room is intentionally minimal: only what the booking/pricing/payment system actually needs.
 * Display content (photos, long description, bed-type copy, facility list) lives in the
 * frontend's src/content/rooms.js — that file's `id` field MUST match this table's `id` column
 * for a given physical room. See docs/CONTENT_VS_DATA.md.
 */
@Entity
@Table(name = "room")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Short identifying name, used in the admin dashboard/booking list and the room-picker dropdown. */
    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /** Hard ceiling — the room physically cannot hold more than this many guests. */
    @Column(name = "max_guests", nullable = false)
    private Integer maxGuests;

    /** How many guests are included in the base weekday/weekend rate before extra-guest charges apply. */
    @Column(name = "base_occupancy", nullable = false)
    @Builder.Default
    private Integer baseOccupancy = 2;

    @Column(name = "weekday_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal weekdayPrice;

    @Column(name = "weekend_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal weekendPrice;

    /** Charged per extra guest, per night, once guests exceed baseOccupancy. */
    @Column(name = "extra_guest_price", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal extraGuestPrice = BigDecimal.ZERO;

    /** Percentage discount (0-100) applied to the whole stay total. 0 = no discount. */
    @Column(name = "discount_percent", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercent = BigDecimal.ZERO;
}
