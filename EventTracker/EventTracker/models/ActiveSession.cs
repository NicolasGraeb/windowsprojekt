namespace EventTracker.models;

/// <summary>
/// Klasa reprezentująca aktywną sesję w harmonogramie.
/// </summary>
public class ActiveSession
{
    public int ScheduleItemId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
    public string? Room { get; set; }
    public int SpeakerCount { get; set; }
    public bool IsActive { get; set; }
}
