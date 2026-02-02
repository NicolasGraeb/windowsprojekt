namespace EventTracker.models;

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;



public class Registration
{
    public int Id { get; set; }

    public int EventId { get; set; }
    public int ParticipantId { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = default!;

    public DateTime RegisteredAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime? CheckedInAt { get; set; }

    public int? WaitingPosition { get; set; }

    [JsonIgnore]
    public EventBase Event { get; set; } = default!;
    [JsonIgnore]
    public Participant Participant { get; set; } = default!;
}
