using EventTracker.config;
using EventTracker.interfaces;
using EventTracker.models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EventTracker.controllers;

[ApiController]
[Route("api/[controller]")]
public class ParticipantsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IRepository<Participant> _repository;

    public ParticipantsController(AppDbContext context, IRepository<Participant> repository)
    {
        _context = context;
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Participant>>> GetAllParticipants()
    {
        try
        {
            var participants = await _repository.GetAllAsync();
            return Ok(participants);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Participant>> GetParticipant(int id)
    {
        try
        {
            var participant = await _repository.GetByIdAsync(id);
            if (participant == null)
                return NotFound(new { error = $"Uczestnik o ID {id} nie został znaleziony" });
            
            return Ok(participant);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<Participant>> CreateParticipant([FromBody] Participant participant)
    {
        try
        {
            participant.CreatedAt = DateTime.UtcNow;
            var created = await _repository.AddAsync(participant);
            return CreatedAtAction(nameof(GetParticipant), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Participant>> UpdateParticipant(int id, [FromBody] Participant participant)
    {
        try
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { error = $"Uczestnik o ID {id} nie został znaleziony" });

            existing.FirstName = participant.FirstName;
            existing.LastName = participant.LastName;
            existing.Email = participant.Email;
            existing.Phone = participant.Phone;

            var updated = await _repository.UpdateAsync(existing);
            return Ok(updated);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteParticipant(int id)
    {
        try
        {
            var result = await _repository.DeleteAsync(id);
            if (!result)
                return NotFound(new { error = $"Uczestnik o ID {id} nie został znaleziony" });
            
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
