namespace EventTracker.dto;

public class RegistrationDto
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public int ParticipantId { get; set; }
    public string Status { get; set; } = default!;
    public DateTime RegisteredAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime? CheckedInAt { get; set; }
    public int? WaitingPosition { get; set; }
    public ParticipantDto? Participant { get; set; }
}

public class ParticipantDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string? Phone { get; set; }
    public DateTime CreatedAt { get; set; }
}
