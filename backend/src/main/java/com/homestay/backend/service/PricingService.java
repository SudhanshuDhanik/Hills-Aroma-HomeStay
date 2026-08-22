package com.homestay.backend.service;

import com.homestay.backend.dto.PriceQuoteDto;
import com.homestay.backend.entity.Room;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;

/**
 * Single source of truth for turning (room, checkIn, checkOut, guests) into a price.
 * Called both by the public "show me the price" quote endpoint AND by PaymentService when
 * actually creating a Razorpay order — the same method, so the quote the customer sees and
 * the amount they're charged can never drift apart.
 *
 * WEEKEND NIGHT ASSUMPTION: a night is treated as a "weekend night" if it falls on Friday or
 * Saturday (i.e. the night itself starts on Fri/Sat) — the common convention for weekend-getaway
 * pricing in Indian hospitality. If your actual business treats Sat/Sun as the weekend instead,
 * change the one line marked below — nothing else needs to change.
 */
@Service
public class PricingService {

    public PriceQuoteDto calculate(Room room, LocalDate checkIn, LocalDate checkOut, int guests) {
        int nights = (int) java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);

        int weekendNights = 0;
        BigDecimal roomTotal = BigDecimal.ZERO;

        for (LocalDate date = checkIn; date.isBefore(checkOut); date = date.plusDays(1)) {
            boolean isWeekendNight = isWeekendNight(date); // <-- change this line to adjust the convention
            if (isWeekendNight) {
                weekendNights++;
                roomTotal = roomTotal.add(room.getWeekendPrice());
            } else {
                roomTotal = roomTotal.add(room.getWeekdayPrice());
            }
        }
        int weekdayNights = nights - weekendNights;

        int extraGuests = Math.max(0, guests - room.getBaseOccupancy());
        BigDecimal extraGuestTotal = room.getExtraGuestPrice()
                .multiply(BigDecimal.valueOf(extraGuests))
                .multiply(BigDecimal.valueOf(nights));

        BigDecimal subtotal = roomTotal.add(extraGuestTotal);

        BigDecimal discountAmount = subtotal
                .multiply(room.getDiscountPercent())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = subtotal.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);

        PriceQuoteDto dto = new PriceQuoteDto();
        dto.setRoomId(room.getId());
        dto.setCheckIn(checkIn);
        dto.setCheckOut(checkOut);
        dto.setGuests(guests);
        dto.setNights(nights);
        dto.setWeekdayNights(weekdayNights);
        dto.setWeekendNights(weekendNights);
        dto.setRoomTotal(roomTotal.setScale(2, RoundingMode.HALF_UP));
        dto.setExtraGuestTotal(extraGuestTotal.setScale(2, RoundingMode.HALF_UP));
        dto.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        dto.setDiscountAmount(discountAmount);
        dto.setTotalAmount(totalAmount);
        return dto;
    }

    private boolean isWeekendNight(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        return day == DayOfWeek.FRIDAY || day == DayOfWeek.SATURDAY;
    }
}
