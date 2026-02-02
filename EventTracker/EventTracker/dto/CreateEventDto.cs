using EventTracker.attributes;
using EventTracker.models;

namespace EventTracker.dto;

public class CreateEventDto
{
    [Validate(Required = true, MinLength = 3, MaxLength = 200)]
    [Loggable(IncludeInLog = true, LogName = "EventName")]
    public string Name { get; set; } = string.Empty;

    [Loggable(IncludeInLog = true)]
    public string? Description { get; set; }

    [Validate(Required = true)]
    [Loggable(IncludeInLog = true)]
    public DateTime StartAt { get; set; }

    [Validate(Required = true)]
    [Loggable(IncludeInLog = true)]
    public DateTime EndAt { get; set; }

    [Loggable(IncludeInLog = true)]
    public string? Location { get; set; }

    [Validate(Required = true, MinLength = 1)]
    [Loggable(IncludeInLog = true)]
    public int MaxParticipants { get; set; }

    [Validate(Required = true)]
    [Loggable(IncludeInLog = true)]
    public string EventType { get; set; } = string.Empty;

    public int? TrackCount { get; set; }
    public bool HasExhibition { get; set; }
    public decimal? RegistrationFee { get; set; }

    public string? Topic { get; set; }
    public bool IsInteractive { get; set; }

    public string? MaterialsRequired { get; set; }
    public decimal WorkshopFee { get; set; }
    public int? SkillLevel { get; set; }

    public EventBase ToEventBase()
    {
        utils.ReflectionMapper.ValidateObject(this);

        EventBase eventBase = EventType.ToLower() switch
        {
            "conference" => new Conference
            {
                TrackCount = TrackCount,
                HasExhibition = HasExhibition,
                RegistrationFee = RegistrationFee
            },
            "seminar" => new Seminar
            {
                Topic = Topic,
                IsInteractive = IsInteractive
            },
            "workshop" => new Workshop
            {
                MaterialsRequired = MaterialsRequired,
                WorkshopFee = WorkshopFee,
                SkillLevel = SkillLevel
            },
            _ => throw new ArgumentException($"Nieprawidłowy typ wydarzenia: {EventType}")
        };

        eventBase.Name = Name;
        eventBase.Description = Description;
        eventBase.StartAt = StartAt;
        eventBase.EndAt = EndAt;
        eventBase.Location = Location;
        eventBase.MaxParticipants = MaxParticipants;

        return eventBase;
    }
}
