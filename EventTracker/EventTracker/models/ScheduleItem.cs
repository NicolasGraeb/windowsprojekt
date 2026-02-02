namespace EventTracker.models;

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class ScheduleItem
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("eventId")]
    public int EventId { get; set; }

    [Required]
    [MaxLength(200)]
    [JsonPropertyName("title")]
    public string Title { get; set; } = default!;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("startAt")]
    public DateTime StartAt { get; set; }
    
    [JsonPropertyName("endAt")]
    public DateTime EndAt { get; set; }

    [MaxLength(100)]
    [JsonPropertyName("room")]
    public string? Room { get; set; }

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.Always)]
    public EventBase Event { get; set; } = default!;
    [JsonIgnore(Condition = JsonIgnoreCondition.Always)]
    public ICollection<ScheduleItemSpeaker> ScheduleItemSpeakers { get; set; } = new List<ScheduleItemSpeaker>();
}
