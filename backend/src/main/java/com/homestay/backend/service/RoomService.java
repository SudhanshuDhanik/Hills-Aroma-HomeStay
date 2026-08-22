package com.homestay.backend.service;

import com.homestay.backend.dto.RoomDto;
import com.homestay.backend.entity.Room;
import com.homestay.backend.exception.ResourceNotFoundException;
import com.homestay.backend.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<RoomDto.RoomResponse> getAllActive() {
        return roomRepository.findByActiveTrue().stream().map(this::toDto).toList();
    }

    public List<RoomDto.RoomResponse> getAllForAdmin() {
        return roomRepository.findAll().stream().map(this::toDto).toList();
    }

    public RoomDto.RoomResponse getById(Long id) {
        return toDto(findRoomOrThrow(id));
    }

    public Room getEntityById(Long id) {
        return findRoomOrThrow(id);
    }

    public RoomDto.RoomResponse create(RoomDto.RoomRequest req) {
        Room room = Room.builder()
                .name(req.getName())
                .active(req.getActive() == null || req.getActive())
                .maxGuests(req.getMaxGuests())
                .baseOccupancy(req.getBaseOccupancy())
                .weekdayPrice(req.getWeekdayPrice())
                .weekendPrice(req.getWeekendPrice())
                .extraGuestPrice(req.getExtraGuestPrice())
                .discountPercent(req.getDiscountPercent())
                .build();
        return toDto(roomRepository.save(room));
    }

    public RoomDto.RoomResponse update(Long id, RoomDto.RoomRequest req) {
        Room room = findRoomOrThrow(id);
        room.setName(req.getName());
        if (req.getActive() != null) {
            room.setActive(req.getActive());
        }
        room.setMaxGuests(req.getMaxGuests());
        room.setBaseOccupancy(req.getBaseOccupancy());
        room.setWeekdayPrice(req.getWeekdayPrice());
        room.setWeekendPrice(req.getWeekendPrice());
        room.setExtraGuestPrice(req.getExtraGuestPrice());
        room.setDiscountPercent(req.getDiscountPercent());
        return toDto(roomRepository.save(room));
    }

    /** Narrow update used by the admin "Pricing" screen — only touches rates. */
    public RoomDto.RoomResponse updatePricing(Long id, RoomDto.PricingRequest req) {
        Room room = findRoomOrThrow(id);
        room.setWeekdayPrice(req.getWeekdayPrice());
        room.setWeekendPrice(req.getWeekendPrice());
        room.setExtraGuestPrice(req.getExtraGuestPrice());
        room.setDiscountPercent(req.getDiscountPercent());
        return toDto(roomRepository.save(room));
    }

    public void delete(Long id) {
        Room room = findRoomOrThrow(id);
        roomRepository.delete(room);
    }

    private Room findRoomOrThrow(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + id));
    }

    private RoomDto.RoomResponse toDto(Room room) {
        RoomDto.RoomResponse dto = new RoomDto.RoomResponse();
        dto.setId(room.getId());
        dto.setName(room.getName());
        dto.setActive(room.getActive());
        dto.setMaxGuests(room.getMaxGuests());
        dto.setBaseOccupancy(room.getBaseOccupancy());
        dto.setWeekdayPrice(room.getWeekdayPrice());
        dto.setWeekendPrice(room.getWeekendPrice());
        dto.setExtraGuestPrice(room.getExtraGuestPrice());
        dto.setDiscountPercent(room.getDiscountPercent());
        return dto;
    }
}
