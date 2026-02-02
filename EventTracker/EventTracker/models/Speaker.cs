namespace EventTracker.models;

using System.ComponentModel.DataAnnotations;


public class Speaker
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string FirstName { get; set; } = default!;

    [MaxLength(100)]
    public string LastName { get; set; } = default!;

    [MaxLength(200)]
    public string Email { get; set; } = default!;

    public string? Bio { get; set; }

    // NAV
    public ICollection<ScheduleItemSpeaker> ScheduleItemSpeakers { get; set; } = new List<ScheduleItemSpeaker>();
}
