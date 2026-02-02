namespace EventTracker.models;

using System.ComponentModel.DataAnnotations;


public class Event
{
    public int Id { get; set; }

    [MaxLength(200)]
    public string Name { get; set; } = default!;

    public string? Description { get; set; }

    [MaxLength(50)]
    public string EventType { get; set; } = default!; // np. "conference", "workshop"

    [MaxLength(50)]
    public string Status { get; set; } = default!; // np. "draft", "published", "cancelled"

    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // NAV
    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
    public ICollection<ScheduleItem> ScheduleItems { get; set; } = new List<ScheduleItem>();
}
