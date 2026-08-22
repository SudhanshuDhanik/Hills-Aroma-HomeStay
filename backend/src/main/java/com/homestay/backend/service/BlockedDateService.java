package com.homestay.backend.service;

import com.homestay.backend.dto.BlockedDateDto;
import com.homestay.backend.entity.BlockedDate;
import com.homestay.backend.entity.Room;
import com.homestay.backend.exception.ResourceNotFoundException;
import com.homestay.backend.repository.BlockedDateRepository;
import com.homestay.backend.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BlockedDateService {

    private final BlockedDateRepository blockedDateRepository;
    private final RoomRepository roomRepository;

    public BlockedDateService(BlockedDateRepository blockedDateRepository, RoomRepository roomRepository) {
        this.blockedDateRepository = blockedDateRepository;
        this.roomRepository = roomRepository;
    }

    public List<BlockedDateDto.Response> getByRoom(Long roomId) {
        return blockedDateRepository.findByRoomId(roomId).stream().map(this::toDto).toList();
    }

    public BlockedDateDto.Response create(BlockedDateDto.Request req) {
        Room room = roomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + req.getRoomId()));

        if (!req.getEndDate().isAfter(req.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        BlockedDate blocked = BlockedDate.builder()
                .room(room)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .reason(req.getReason())
                .build();

        return toDto(blockedDateRepository.save(blocked));
    }

    public void delete(Long id) {
        if (!blockedDateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Blocked date entry not found: " + id);
        }
        blockedDateRepository.deleteById(id);
    }

    private BlockedDateDto.Response toDto(BlockedDate b) {
        BlockedDateDto.Response dto = new BlockedDateDto.Response();
        dto.setId(b.getId());
        dto.setRoomId(b.getRoom().getId());
        dto.setStartDate(b.getStartDate());
        dto.setEndDate(b.getEndDate());
        dto.setReason(b.getReason());
        return dto;
    }
}
