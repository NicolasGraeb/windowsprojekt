using EventTracker.exceptions;
using EventTracker.interfaces;
using EventTracker.models;
using Microsoft.AspNetCore.Mvc;

namespace EventTracker.controllers;

[ApiController]
[Route("api/[controller]")]
public class MonitoringController : ControllerBase
{
    private readonly IMonitoringService _monitoringService;

    public MonitoringController(IMonitoringService monitoringService)
    {
        _monitoringService = monitoringService;
    }

    [HttpGet("event/{eventId}")]
    public async Task<ActionResult<EventMonitoringData>> GetEventMonitoring(int eventId)
    {
        try
        {
            var data = await _monitoringService.GetEventMonitoringDataAsync(eventId);
            return Ok(data);
        }
        catch (EventNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Błąd w GetEventMonitoring dla eventId {eventId}: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { error = "Wystąpił błąd podczas pobierania danych monitoringu", details = ex.Message });
        }
    }

    [HttpGet("event/{eventId}/sessions")]
    public async Task<ActionResult<IEnumerable<ActiveSession>>> GetActiveSessions(int eventId)
    {
        try
        {
            var sessions = await _monitoringService.GetActiveSessionsAsync(eventId);
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("event/{eventId}/participants/count")]
    public async Task<ActionResult<int>> GetParticipantCount(int eventId)
    {
        try
        {
            var count = await _monitoringService.GetParticipantCountAsync(eventId);
            return Ok(new { count });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
