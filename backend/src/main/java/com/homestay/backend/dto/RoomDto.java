package com.homestay.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

public class RoomDto {

    @Data
    public static class RoomResponse {
        private Long id;
        private String name;
        private Boolean active;
        private Integer maxGuests;
        private Integer baseOccupancy;
        private BigDecimal weekdayPrice;
        private BigDecimal weekendPrice;
        private BigDecimal extraGuestPrice;
        private BigDecimal discountPercent;
    }

    @Data
    public static class RoomRequest {
        @NotBlank
        private String name;
        private Boolean active;
        @NotNull @Min(1)
        private Integer maxGuests;
        @NotNull @Min(1)
        private Integer baseOccupancy;
        @NotNull @DecimalMin("0.0")
        private BigDecimal weekdayPrice;
        @NotNull @DecimalMin("0.0")
        private BigDecimal weekendPrice;
        @NotNull @DecimalMin("0.0")
        private BigDecimal extraGuestPrice;
        @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
        private BigDecimal discountPercent;
    }

    /** Used by the small admin "pricing" screen — deliberately narrower than RoomRequest,
     *  since the admin should only touch rates, not the room's identity/capacity. */
    @Data
    public static class PricingRequest {
        @NotNull @DecimalMin("0.0")
        private BigDecimal weekdayPrice;
        @NotNull @DecimalMin("0.0")
        private BigDecimal weekendPrice;
        @NotNull @DecimalMin("0.0")
        private BigDecimal extraGuestPrice;
        @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
        private BigDecimal discountPercent;
    }
}
