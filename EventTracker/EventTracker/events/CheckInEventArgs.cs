namespace EventTracker.events;

/// <summary>
/// Argumenty zdarzenia check-in uczestnika.
/// Demonstruje: Zdarzenia, Delegacje
/// </summary>
public class CheckInEventArgs : EventArgs
{
    public int RegistrationId { get; }
    public int EventId { get; }
    public int ParticipantId { get; }
    public string ParticipantName { get; }
    public DateTime CheckInTime { get; }

    public CheckInEventArgs(int registrationId, int eventId, int participantId, string participantName)
    {
        RegistrationId = registrationId;
        EventId = eventId;
        ParticipantId = participantId;
        ParticipantName = participantName;
        CheckInTime = DateTime.UtcNow;
    }
}
