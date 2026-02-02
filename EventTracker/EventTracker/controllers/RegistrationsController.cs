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
public class RegistrationsController : ControllerBase
{
    private readonly IRegistrationService _registrationService;
    private readonly AppDbContext _context;
    private readonly IEventService _eventService;

    public RegistrationsController(
        IRegistrationService registrationService,
        AppDbContext context,
        IEventService eventService)
    {
        _registrationService = registrationService;
        _context = context;
        _eventService = eventService;
    }

    [HttpPost("register")]
    [Authorize]
    public async Task<ActionResult<Registration>> RegisterParticipant([FromBody] RegisterParticipantRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("UserId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { error = "Nie można zidentyfikować użytkownika" });
            }

            var eventBase = await _eventService.GetEventByIdAsync(request.EventId);
            if (eventBase == null)
                return NotFound(new { error = $"Wydarzenie o ID {request.EventId} nie zostało znalezione" });

            if (eventBase.CreatedByUserId == userId)
            {
                return BadRequest(new { error = "Nie możesz zapisać się na swoje własne wydarzenie" });
            }

            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized(new { error = "Nie można pobrać adresu email użytkownika" });
            }

            var participant = await _context.Participants
                .FirstOrDefaultAsync(p => p.Email == userEmail);

            int participantId;
            if (participant == null)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return Unauthorized(new { error = "Użytkownik nie został znaleziony" });

                participant = new Participant
                {
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Phone = user.Phone,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Participants.Add(participant);
                await _context.SaveChangesAsync();
            }

            participantId = participant.Id;

            var registration = await _registrationService.RegisterParticipantAsync(
                request.EventId, participantId);
            
            var registrationDto = new RegistrationDto
            {
                Id = registration.Id,
                EventId = registration.EventId,
                ParticipantId = registration.ParticipantId,
                Status = registration.Status,
                RegisteredAt = registration.RegisteredAt,
                CancelledAt = registration.CancelledAt,
                CheckedInAt = registration.CheckedInAt,
                WaitingPosition = registration.WaitingPosition,
                Participant = participant != null ? new ParticipantDto
                {
                    Id = participant.Id,
                    FirstName = participant.FirstName,
                    LastName = participant.LastName,
                    Email = participant.Email,
                    Phone = participant.Phone,
                    CreatedAt = participant.CreatedAt
                } : null
            };
            
            return CreatedAtAction(nameof(GetRegistration), new { id = registration.Id }, registrationDto);
        }
        catch (EventNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ParticipantAlreadyRegisteredException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (EventFullException ex)
        {
            return StatusCode(409, new { error = ex.Message, waitingList = true });
        }
        catch (InvalidRegistrationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Registration>> GetRegistration(int id)
    {
        try
        {
            var registration = await _registrationService.GetRegistrationAsync(id);
            if (registration == null)
                return NotFound(new { error = $"Rejestracja o ID {id} nie została znalezione" });
            
            return Ok(registration);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("event/{eventId}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<Registration>>> GetEventRegistrations(int eventId)
    {
        try
        {
            var eventBase = await _eventService.GetEventByIdAsync(eventId);
            if (eventBase == null)
                return NotFound(new { error = $"Wydarzenie o ID {eventId} nie zostało znalezione" });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("UserId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { error = "Nie można zidentyfikować użytkownika" });
            }

            if (eventBase.CreatedByUserId != userId)
            {
                return StatusCode(403, new { error = "Możesz zobaczyć rejestracje tylko dla swoich wydarzeń" });
            }

            var registrations = await _registrationService.GetEventRegistrationsAsync(eventId);
            
            var registrationsWithParticipants = await _context.Registrations
                .Where(r => r.EventId == eventId)
                .Include(r => r.Participant)
                .ToListAsync();

            var registrationDtos = registrationsWithParticipants.Select(r => new RegistrationDto
            {
                Id = r.Id,
                EventId = r.EventId,
                ParticipantId = r.ParticipantId,
                Status = r.Status,
                RegisteredAt = r.RegisteredAt,
                CancelledAt = r.CancelledAt,
                CheckedInAt = r.CheckedInAt,
                WaitingPosition = r.WaitingPosition,
                Participant = r.Participant != null ? new ParticipantDto
                {
                    Id = r.Participant.Id,
                    FirstName = r.Participant.FirstName,
                    LastName = r.Participant.LastName,
                    Email = r.Participant.Email,
                    Phone = r.Participant.Phone,
                    CreatedAt = r.Participant.CreatedAt
                } : null
            }).ToList();

            return Ok(registrationDtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("{id}/checkin")]
    public async Task<ActionResult> CheckInParticipant(int id)
    {
        try
        {
            var result = await _registrationService.CheckInParticipantAsync(id);
            if (!result)
                return NotFound(new { error = $"Rejestracja o ID {id} nie została znalezione" });
            
            return Ok(new { message = "Uczestnik został zalogowany" });
        }
        catch (InvalidRegistrationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult> CancelRegistration(int id)
    {
        try
        {
            var result = await _registrationService.CancelRegistrationAsync(id);
            if (!result)
                return NotFound(new { error = $"Rejestracja o ID {id} nie została znalezione" });
            
            return Ok(new { message = "Rejestracja została anulowana" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("event/{eventId}/waiting")]
    public async Task<ActionResult<IEnumerable<Registration>>> GetWaitingList(int eventId)
    {
        try
        {
            var waitingList = await _registrationService.GetWaitingListAsync(eventId);
            return Ok(waitingList);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("my-registrations")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<RegistrationDto>>> GetMyRegistrations()
    {
        try
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized(new { error = "Nie można pobrać adresu email użytkownika" });
            }

            var participant = await _context.Participants
                .FirstOrDefaultAsync(p => p.Email == userEmail);

            if (participant == null)
            {
                return Ok(new List<RegistrationDto>());
            }

            var registrations = await _context.Registrations
                .Where(r => r.ParticipantId == participant.Id && r.Status != "cancelled")
                .Include(r => r.Participant)
                .Include(r => r.Event)
                .ToListAsync();

            var registrationDtos = registrations.Select(r => new RegistrationDto
            {
                Id = r.Id,
                EventId = r.EventId,
                ParticipantId = r.ParticipantId,
                Status = r.Status,
                RegisteredAt = r.RegisteredAt,
                CancelledAt = r.CancelledAt,
                CheckedInAt = r.CheckedInAt,
                WaitingPosition = r.WaitingPosition,
                Participant = r.Participant != null ? new ParticipantDto
                {
                    Id = r.Participant.Id,
                    FirstName = r.Participant.FirstName,
                    LastName = r.Participant.LastName,
                    Email = r.Participant.Email,
                    Phone = r.Participant.Phone,
                    CreatedAt = r.Participant.CreatedAt
                } : null
            }).ToList();

            return Ok(registrationDtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("event/{eventId}/check")]
    [Authorize]
    public async Task<ActionResult<object>> CheckRegistration(int eventId)
    {
        try
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized(new { error = "Nie można pobrać adresu email użytkownika" });
            }

            var participant = await _context.Participants
                .FirstOrDefaultAsync(p => p.Email == userEmail);

            if (participant == null)
            {
                return Ok(new { isRegistered = false });
            }

            var registration = await _context.Registrations
                .FirstOrDefaultAsync(r => r.EventId == eventId && 
                                         r.ParticipantId == participant.Id && 
                                         r.Status != "cancelled");

            if (registration == null)
            {
                return Ok(new { isRegistered = false });
            }

            return Ok(new 
            { 
                isRegistered = true,
                registrationId = registration.Id,
                status = registration.Status,
                waitingPosition = registration.WaitingPosition
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public class RegisterParticipantRequest
{
    public int EventId { get; set; }
    public int ParticipantId { get; set; }
}
