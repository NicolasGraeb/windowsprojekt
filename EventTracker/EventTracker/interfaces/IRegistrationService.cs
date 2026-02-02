using EventTracker.events;
using EventTracker.models;

namespace EventTracker.interfaces;

/// <summary>
/// Interfejs dla serwisu zarządzającego rejestracjami.
/// </summary>
public interface IRegistrationService
{
    Task<Registration> RegisterParticipantAsync(int eventId, int participantId);
    Task<bool> CancelRegistrationAsync(int registrationId);
    Task<Registration?> GetRegistrationAsync(int registrationId);
    Task<IEnumerable<Registration>> GetEventRegistrationsAsync(int eventId);
    Task<bool> CheckInParticipantAsync(int registrationId);
    Task<IEnumerable<Registration>> GetWaitingListAsync(int eventId);
    event EventHandler<RegistrationEventArgs>? ParticipantRegistered;
    event EventHandler<CheckInEventArgs>? ParticipantCheckedIn;
}
