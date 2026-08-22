package com.homestay.backend.controller;

import com.homestay.backend.dto.BlockedDateDto;
import com.homestay.backend.service.BlockedDateService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BlockedDateController {

    private final BlockedDateService blockedDateService;

    public BlockedDateController(BlockedDateService blockedDateService) {
        this.blockedDateService = blockedDateService;
    }

    @GetMapping("/rooms/{roomId}/blocked-dates")
    public List<BlockedDateDto.Response> getByRoom(@PathVariable Long roomId) {
        return blockedDateService.getByRoom(roomId);
    }

    @PostMapping("/admin/blocked-dates")
    public BlockedDateDto.Response create(@Valid @RequestBody BlockedDateDto.Request req) {
        return blockedDateService.create(req);
    }

    @DeleteMapping("/admin/blocked-dates/{id}")
    public void delete(@PathVariable Long id) {
        blockedDateService.delete(id);
    }
}
