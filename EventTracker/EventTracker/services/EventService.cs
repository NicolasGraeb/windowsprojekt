using EventTracker.config;
using EventTracker.exceptions;
using EventTracker.interfaces;
using EventTracker.models;
using EventTracker.repositories;
using Microsoft.EntityFrameworkCore;

namespace EventTracker.services;

public class EventService : IEventService
{
    private readonly AppDbContext _context;
    private readonly EventRepository _repository;

    public EventService(AppDbContext context, EventRepository repository)
    {
        _context = context;
        _repository = repository;
    }

    public async Task<EventBase> CreateEventAsync(EventBase eventBase, int userId)
    {
        try
        {
            eventBase.CreatedAt = DateTime.UtcNow;
            eventBase.UpdatedAt = DateTime.UtcNow;
            eventBase.CreatedByUserId = userId;
            return await _repository.AddAsync(eventBase);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Błąd podczas tworzenia wydarzenia: {ex.Message}", ex);
        }
    }

    public async Task<EventBase?> GetEventByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<IEnumerable<EventBase>> GetAllEventsAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<IEnumerable<EventBase>> GetEventsByStatusAsync(string status)
    {
        return await _repository.FindAsync(e => e.Status == status);
    }

    public async Task<EventBase> UpdateEventAsync(int id, EventBase eventBase)
    {
        var existingEvent = await GetEventByIdAsync(id);
        if (existingEvent == null)
            throw new EventNotFoundException(id);

        existingEvent.Name = eventBase.Name;
        existingEvent.Description = eventBase.Description;
        existingEvent.StartAt = eventBase.StartAt;
        existingEvent.EndAt = eventBase.EndAt;
        existingEvent.Location = eventBase.Location;
        existingEvent.MaxParticipants = eventBase.MaxParticipants;
        existingEvent.UpdatedAt = DateTime.UtcNow;

        if (existingEvent is Conference existingConference && eventBase is Conference newConference)
        {
            existingConference.TrackCount = newConference.TrackCount;
            existingConference.HasExhibition = newConference.HasExhibition;
            existingConference.RegistrationFee = newConference.RegistrationFee;
        }
        else if (existingEvent is Seminar existingSeminar && eventBase is Seminar newSeminar)
        {
            existingSeminar.Topic = newSeminar.Topic;
            existingSeminar.IsInteractive = newSeminar.IsInteractive;
        }
        else if (existingEvent is Workshop existingWorkshop && eventBase is Workshop newWorkshop)
        {
            existingWorkshop.MaterialsRequired = newWorkshop.MaterialsRequired;
            existingWorkshop.WorkshopFee = newWorkshop.WorkshopFee;
            existingWorkshop.SkillLevel = newWorkshop.SkillLevel;
        }

        return await _repository.UpdateAsync(existingEvent);
    }

    public async Task<bool> DeleteEventAsync(int id)
    {
        var eventBase = await GetEventByIdAsync(id);
        if (eventBase == null)
            throw new EventNotFoundException(id);

        return await _repository.DeleteAsync(id);
    }

    public async Task<bool> ArchiveEventAsync(int id)
    {
        var eventBase = await GetEventByIdAsync(id);
        if (eventBase == null)
            throw new EventNotFoundException(id);

        eventBase.Archive();
        await _repository.UpdateAsync(eventBase);
        return true;
    }
}
