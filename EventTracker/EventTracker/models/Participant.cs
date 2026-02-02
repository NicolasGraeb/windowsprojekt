namespace EventTracker.models;

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;


public class Participant
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string FirstName { get; set; } = default!;

    [MaxLength(100)]
    public string LastName { get; set; } = default!;

    [MaxLength(200)]
    public string Email { get; set; } = default!;

    [MaxLength(50)]
    public string? Phone { get; set; }

    public DateTime CreatedAt { get; set; }

    [JsonIgnore]
    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
}
