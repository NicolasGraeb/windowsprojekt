namespace EventTracker.exceptions;

/// <summary>
/// Wyjątek rzucany gdy wydarzenie osiągnęło maksymalną liczbę uczestników.
/// </summary>
public class EventFullException : Exception
{
    public int EventId { get; }
    public int MaxParticipants { get; }
    public int CurrentParticipants { get; }

    public EventFullException(int eventId, int maxParticipants, int currentParticipants)
        : base($"Wydarzenie o ID {eventId} jest pełne. Maksymalna liczba: {maxParticipants}, Obecna: {currentParticipants}")
    {
        EventId = eventId;
        MaxParticipants = maxParticipants;
        CurrentParticipants = currentParticipants;
    }
}
