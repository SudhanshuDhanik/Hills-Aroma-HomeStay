package com.homestay.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

public class BlockedDateDto {

    @Data
    public static class Request {
        @NotNull
        private Long roomId;
        @NotNull
        private LocalDate startDate;
        @NotNull
        private LocalDate endDate;
        private String reason;
    }

    @Data
    public static class Response {
        private Long id;
        private Long roomId;
        private LocalDate startDate;
        private LocalDate endDate;
        private String reason;
    }
}
