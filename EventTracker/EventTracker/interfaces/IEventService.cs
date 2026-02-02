using EventTracker.models;

namespace EventTracker.interfaces;

public interface IEventService
{
    Task<EventBase> CreateEventAsync(EventBase eventBase, int userId);
    Task<EventBase?> GetEventByIdAsync(int id);
    Task<IEnumerable<EventBase>> GetAllEventsAsync();
    Task<IEnumerable<EventBase>> GetEventsByStatusAsync(string status);
    Task<EventBase> UpdateEventAsync(int id, EventBase eventBase);
    Task<bool> DeleteEventAsync(int id);
    Task<bool> ArchiveEventAsync(int id);
}
