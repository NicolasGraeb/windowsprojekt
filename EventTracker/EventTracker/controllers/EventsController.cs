using EventTracker.config;
using EventTracker.dto;
using EventTracker.exceptions;
using EventTracker.interfaces;
using EventTracker.models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EventTracker.controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;
    private readonly AppDbContext _context;

    public EventsController(IEventService eventService, AppDbContext context)
    {
        _eventService = eventService;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EventBase>>> GetAllEvents()
    {
        try
        {
            var events = await _eventService.GetAllEventsAsync();
            return Ok(events);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EventBase>> GetEvent(int id)
    {
        try
        {
            var eventBase = await _eventService.GetEventByIdAsync(id);
            if (eventBase == null)
                return NotFound(new { error = $"Wydarzenie o ID {id} nie zostało znalezione" });
            
            return Ok(eventBase);
        }
        catch (EventNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<EventBase>>> GetEventsByStatus(string status)
    {
        try
        {
            var events = await _eventService.GetEventsByStatusAsync(status);
            return Ok(events);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<EventBase>> CreateEvent([FromBody] CreateEventDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("UserId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                Console.WriteLine($"Nie można zidentyfikować użytkownika. Claims: {string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}"))}");
                return Unauthorized(new { error = "Nie można zidentyfikować użytkownika" });
            }

            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                Console.WriteLine($"Użytkownik o ID {userId} nie istnieje w bazie danych");
                return Unauthorized(new { error = $"Użytkownik o ID {userId} nie istnieje w bazie danych" });
            }

            Console.WriteLine($"Tworzenie wydarzenia dla użytkownika ID: {userId}");

            var eventBase = dto.ToEventBase();
            var createdEvent = await _eventService.CreateEventAsync(eventBase, userId);
            return CreatedAtAction(nameof(GetEvent), new { id = createdEvent.Id }, createdEvent);
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"ArgumentException: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception podczas tworzenia wydarzenia: {ex.Message}");
            Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return BadRequest(new { error = $"Błąd podczas tworzenia wydarzenia: {ex.Message}" });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<EventBase>> UpdateEvent(int id, [FromBody] CreateEventDto dto)
    {
        try
        {
            // Sprawdź czy użytkownik jest twórcą wydarzenia
            var existingEvent = await _eventService.GetEventByIdAsync(id);
            if (existingEvent == null)
                return NotFound(new { error = $"Wydarzenie o ID {id} nie zostało znalezione" });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("UserId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { error = "Nie można zidentyfikować użytkownika" });
            }

            if (existingEvent.CreatedByUserId != userId)
            {
                return StatusCode(403, new { error = "Możesz edytować tylko swoje wydarzenia" });
            }

            var eventBase = dto.ToEventBase();
            var updatedEvent = await _eventService.UpdateEventAsync(id, eventBase);
            return Ok(updatedEvent);
        }
        catch (EventNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> DeleteEvent(int id)
    {
        try
        {
            // Sprawdź czy użytkownik jest twórcą wydarzenia
            var existingEvent = await _eventService.GetEventByIdAsync(id);
            if (existingEvent == null)
                return NotFound(new { error = $"Wydarzenie o ID {id} nie zostało znalezione" });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("UserId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { error = "Nie można zidentyfikować użytkownika" });
            }

            if (existingEvent.CreatedByUserId != userId)
            {
                return StatusCode(403, new { error = "Możesz usuwać tylko swoje wydarzenia" });
            }

            var result = await _eventService.DeleteEventAsync(id);
            if (!result)
                return NotFound(new { error = $"Wydarzenie o ID {id} nie zostało znalezione" });
            
            return NoContent();
        }
        catch (EventNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("{id}/archive")]
    [Authorize]
    public async Task<ActionResult> ArchiveEvent(int id)
    {
        try
        {
            // Sprawdź czy użytkownik jest twórcą wydarzenia
            var existingEvent = await _eventService.GetEventByIdAsync(id);
            if (existingEvent == null)
                return NotFound(new { error = $"Wydarzenie o ID {id} nie zostało znalezione" });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("UserId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { error = "Nie można zidentyfikować użytkownika" });
            }

            if (existingEvent.CreatedByUserId != userId)
            {
                return StatusCode(403, new { error = "Możesz archiwizować tylko swoje wydarzenia" });
            }

            var result = await _eventService.ArchiveEventAsync(id);
            if (!result)
                return NotFound(new { error = $"Wydarzenie o ID {id} nie zostało znalezione" });
            
            return Ok(new { message = "Wydarzenie zostało zarchiwizowane" });
        }
        catch (EventNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
