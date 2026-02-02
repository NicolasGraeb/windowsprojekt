using EventTracker.events;
using EventTracker.models;

namespace EventTracker.interfaces;

/// <summary>
/// Interfejs dla serwisu monitoringu wydarzeń.
/// </summary>
public interface IMonitoringService
{
    Task<EventMonitoringData> GetEventMonitoringDataAsync(int eventId);
    Task<IEnumerable<ActiveSession>> GetActiveSessionsAsync(int eventId);
    Task<int> GetParticipantCountAsync(int eventId);
    Task LogCheckInEventAsync(CheckInEventArgs args);
    Task LogRegistrationEventAsync(RegistrationEventArgs args);
    event EventHandler<CheckInEventArgs>? ParticipantCheckedIn;
    event EventHandler<RegistrationEventArgs>? ParticipantRegistered;
}
