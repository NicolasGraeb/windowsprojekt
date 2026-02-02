namespace EventTracker.models;

/// <summary>
/// Klasa reprezentująca dane monitoringu wydarzenia.
/// </summary>
public class EventMonitoringData
{
    public int EventId { get; set; }
    public string EventName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int TotalRegistrations { get; set; }
    public int CheckedInCount { get; set; }
    public int WaitingListCount { get; set; }
    public int ActiveSessionsCount { get; set; }
    public DateTime LastUpdate { get; set; } = DateTime.UtcNow;
}
