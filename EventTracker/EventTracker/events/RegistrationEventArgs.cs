namespace EventTracker.events;

/// <summary>
/// Argumenty zdarzenia rejestracji uczestnika.
/// Demonstruje: Zdarzenia, Delegacje
/// </summary>
public class RegistrationEventArgs : EventArgs
{
    public int RegistrationId { get; }
    public int EventId { get; }
    public int ParticipantId { get; }
    public string Status { get; }
    public DateTime RegistrationTime { get; }

    public RegistrationEventArgs(int registrationId, int eventId, int participantId, string status)
    {
        RegistrationId = registrationId;
        EventId = eventId;
        ParticipantId = participantId;
        Status = status;
        RegistrationTime = DateTime.UtcNow;
    }
}
