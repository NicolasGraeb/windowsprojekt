namespace EventTracker.models;


public class ScheduleItemSpeaker
{
    public int ScheduleItemId { get; set; }
    public int SpeakerId { get; set; }

    // NAV
    public ScheduleItem ScheduleItem { get; set; } = default!;
    public Speaker Speaker { get; set; } = default!;
}
