namespace EventTracker.exceptions;

/// <summary>
/// Wyjątek rzucany gdy wydarzenie nie zostanie znalezione.
/// </summary>
public class EventNotFoundException : Exception
{
    public int EventId { get; }

    public EventNotFoundException(int eventId)
        : base($"Wydarzenie o ID {eventId} nie zostało znalezione")
    {
        EventId = eventId;
    }
}
