using System.ComponentModel.DataAnnotations;

namespace EventTracker.dto;

public class CreateScheduleItemDto
{
    [Required]
    public int EventId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public DateTime StartAt { get; set; }

    [Required]
    public DateTime EndAt { get; set; }

    [MaxLength(100)]
    public string? Room { get; set; }
}
