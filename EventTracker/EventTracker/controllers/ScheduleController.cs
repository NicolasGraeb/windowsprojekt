using EventTracker.config;
using EventTracker.interfaces;
using EventTracker.models;
using EventTracker.services;
using EventTracker.dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EventTracker.controllers;

[ApiController]
[Route("api/[controller]")]
public class ScheduleController : ControllerBase
{
    private readonly ScheduleService _scheduleService;
    private readonly IEventService _eventService;
    private readonly AppDbContext _context;

    public ScheduleController(ScheduleService scheduleService, IEventService eventService, AppDbContext context)
    {
        _scheduleService = scheduleService;
        _eventService = eventService;
        _context = context;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ScheduleItem>> AddScheduleItem([FromBody] CreateScheduleItemDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .SelectMany(x => x.Value!.Errors.Select(e => new { Field = x.Key, Message = e.ErrorMessage }))
                    .ToList();
                Console.WriteLine($"Model validation errors: {System.Text.Json.JsonSerializer.Serialize(errors)}");
                return BadRequest(new { error = "Błędy walidacji", errors = errors });
            }

            if (dto == null)
            {
                return BadRequest(new { error = "CreateScheduleItemDto nie może być null" });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("UserId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { error = "Nie można zidentyfikować użytkownika" });
            }

            var eventBase = await _eventService.GetEventByIdAsync(dto.EventId);
            if (eventBase == null)
            {
                return NotFound(new { error = $"Wydarzenie o ID {dto.EventId} nie zostało znalezione" });
            }

            if (eventBase.CreatedByUserId != userId)
            {
                return StatusCode(403, new { error = "Możesz dodawać elementy harmonogramu tylko do swoich wydarzeń" });
            }

            Console.WriteLine($"Received CreateScheduleItemDto: EventId={dto.EventId}, Title='{dto.Title}', StartAt={dto.StartAt}, EndAt={dto.EndAt}");

            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                return BadRequest(new { error = "Tytuł jest wymagany" });
            }

            if (dto.EventId <= 0)
            {
                return BadRequest(new { error = $"EventId jest wymagany i musi być większy od 0. Otrzymano: {dto.EventId}" });
            }

            if (dto.StartAt >= dto.EndAt)
            {
                return BadRequest(new { error = "Czas rozpoczęcia musi być wcześniejszy niż czas zakończenia" });
            }

            var scheduleItem = new ScheduleItem
            {
                EventId = dto.EventId,
                Title = dto.Title,
                Description = dto.Description,
                StartAt = dto.StartAt,
                EndAt = dto.EndAt,
                Room = dto.Room,
                CreatedAt = DateTime.UtcNow
            };

            var createdItem = await _scheduleService.AddScheduleItemAsync(scheduleItem);
            return CreatedAtAction(nameof(GetEventSchedule), new { eventId = scheduleItem.EventId }, createdItem);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Błąd w AddScheduleItem: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (dto != null)
            {
                Console.WriteLine($"CreateScheduleItemDto data: EventId={dto.EventId}, Title={dto.Title}, StartAt={dto.StartAt}, EndAt={dto.EndAt}");
            }
            return BadRequest(new { error = ex.Message, details = ex.ToString() });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<ScheduleItem>> UpdateScheduleItem(int id, [FromBody] CreateScheduleItemDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("UserId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { error = "Nie można zidentyfikować użytkownika" });
            }

            var scheduleItem = await _context.ScheduleItems.FindAsync(id);
            if (scheduleItem == null)
            {
                return NotFound(new { error = $"Element harmonogramu o ID {id} nie został znaleziony" });
            }

            var eventBase = await _eventService.GetEventByIdAsync(scheduleItem.EventId);
            if (eventBase == null)
            {
                return NotFound(new { error = $"Wydarzenie o ID {scheduleItem.EventId} nie zostało znalezione" });
            }

            if (eventBase.CreatedByUserId != userId)
            {
                return StatusCode(403, new { error = "Możesz edytować elementy harmonogramu tylko w swoich wydarzeniach" });
            }

            scheduleItem.Title = dto.Title;
            scheduleItem.Description = dto.Description;
            scheduleItem.StartAt = dto.StartAt;
            scheduleItem.EndAt = dto.EndAt;
            scheduleItem.Room = dto.Room;

            await _context.SaveChangesAsync();
            return Ok(scheduleItem);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Błąd w UpdateScheduleItem: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> DeleteScheduleItem(int id)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("UserId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { error = "Nie można zidentyfikować użytkownika" });
            }

            var scheduleItem = await _context.ScheduleItems.FindAsync(id);
            if (scheduleItem == null)
            {
                return NotFound(new { error = $"Element harmonogramu o ID {id} nie został znaleziony" });
            }

            var eventBase = await _eventService.GetEventByIdAsync(scheduleItem.EventId);
            if (eventBase == null)
            {
                return NotFound(new { error = $"Wydarzenie o ID {scheduleItem.EventId} nie zostało znalezione" });
            }

            if (eventBase.CreatedByUserId != userId)
            {
                return StatusCode(403, new { error = "Możesz usuwać elementy harmonogramu tylko w swoich wydarzeniach" });
            }

            _context.ScheduleItems.Remove(scheduleItem);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Błąd w DeleteScheduleItem: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("event/{eventId}")]
    public async Task<ActionResult<IEnumerable<ScheduleItem>>> GetEventSchedule(int eventId)
    {
        try
        {
            var schedule = await _scheduleService.GetEventScheduleAsync(eventId);
            return Ok(schedule);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("rooms/availability")]
    public ActionResult<Dictionary<string, RoomAvailability>> GetRoomAvailability()
    {
        try
        {
            var availability = _scheduleService.GetRoomAvailability();
            return Ok(availability);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
