using System.ComponentModel.DataAnnotations;

namespace EventTracker.models;

public abstract class EventBase
{
    private int _maxParticipants;
    private string _name = string.Empty;

    public int Id { get; set; }

    [MaxLength(200)]
    [Required]
    public string Name
    {
        get => _name;
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Nazwa wydarzenia nie może być pusta", nameof(value));
            _name = value;
        }
    }

    public string? Description { get; set; }

    [MaxLength(50)]
    public string Status { get; private set; } = "Planowane";

    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; }

    public int MaxParticipants
    {
        get => _maxParticipants;
        set
        {
            if (value < 0)
                throw new ArgumentException("Maksymalna liczba uczestników nie może być ujemna", nameof(value));
            _maxParticipants = value;
        }
    }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
    public ICollection<ScheduleItem> ScheduleItems { get; set; } = new List<ScheduleItem>();

    public abstract string GetEventType();
    public abstract decimal CalculatePrice();
    public abstract string GetEventDetails();

    public virtual void ChangeStatus(string newStatus)
    {
        var validStatuses = new[] { "Planowane", "Aktywne", "Zakończone", "Archiwizowane" };
        if (!validStatuses.Contains(newStatus))
            throw new ArgumentException($"Nieprawidłowy status: {newStatus}", nameof(newStatus));
        
        Status = newStatus;
        UpdatedAt = DateTime.UtcNow;
    }

    protected virtual void ValidateEventDates()
    {
        if (StartAt >= EndAt)
            throw new ArgumentException("Data rozpoczęcia musi być wcześniejsza niż data zakończenia");
        
        if (StartAt < DateTime.UtcNow.AddDays(-1))
            throw new ArgumentException("Nie można tworzyć wydarzeń w przeszłości");
    }

    public void Archive()
    {
        ChangeStatus("Archiwizowane");
    }
}
