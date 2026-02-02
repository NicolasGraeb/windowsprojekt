namespace EventTracker.exceptions;

/// <summary>
/// Wyjątek rzucany gdy uczestnik próbuje zarejestrować się ponownie na wydarzenie.
/// Demonstruje: Własne wyjątki
/// </summary>
public class ParticipantAlreadyRegisteredException : Exception
{
    public int EventId { get; }
    public int ParticipantId { get; }

    public ParticipantAlreadyRegisteredException(int eventId, int participantId)
        : base($"Uczestnik o ID {participantId} jest już zarejestrowany na wydarzenie o ID {eventId}")
    {
        EventId = eventId;
        ParticipantId = participantId;
    }

    public ParticipantAlreadyRegisteredException(int eventId, int participantId, Exception innerException)
        : base($"Uczestnik o ID {participantId} jest już zarejestrowany na wydarzenie o ID {eventId}", innerException)
    {
        EventId = eventId;
        ParticipantId = participantId;
    }
}
