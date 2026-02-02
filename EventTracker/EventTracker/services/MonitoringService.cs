using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using EventTracker.config;
using EventTracker.events;
using EventTracker.interfaces;
using EventTracker.models;
using Microsoft.EntityFrameworkCore;

namespace EventTracker.services;

public class MonitoringService : IMonitoringService
{
    private readonly AppDbContext _context;
    private readonly string _logDirectory;
    private readonly JsonSerializerOptions _jsonOptions;

#pragma warning disable CS0067
    public event EventHandler<CheckInEventArgs>? ParticipantCheckedIn;
    public event EventHandler<RegistrationEventArgs>? ParticipantRegistered;
#pragma warning restore CS0067

    public MonitoringService(AppDbContext context, string? logDirectory = null)
    {
        _context = context;
        _logDirectory = logDirectory ?? Path.Combine(Directory.GetCurrentDirectory(), "logs");
        
        if (!Directory.Exists(_logDirectory))
            Directory.CreateDirectory(_logDirectory);

        _jsonOptions = new JsonSerializerOptions
        {
            WriteIndented = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            Converters = { new JsonStringEnumConverter() }
        };
    }

    public async Task<EventMonitoringData> GetEventMonitoringDataAsync(int eventId)
    {
        try
        {
            var eventBase = await _context.Events.FindAsync(eventId);
            if (eventBase == null)
                throw new exceptions.EventNotFoundException(eventId);

            var registrations = await _context.Registrations
                .Where(r => r.EventId == eventId && r.Status != "cancelled")
                .ToListAsync();

            var checkedInCount = registrations.Count(r => r.Status == "checked_in");
            var waitingCount = registrations.Count(r => r.Status == "waiting");

            var activeSessions = await GetActiveSessionsAsync(eventId);

            var monitoringData = new EventMonitoringData
            {
                EventId = eventId,
                EventName = eventBase.Name ?? "Unknown",
                Status = eventBase.Status ?? "Unknown",
                TotalRegistrations = registrations.Count,
                CheckedInCount = checkedInCount,
                WaitingListCount = waitingCount,
                ActiveSessionsCount = activeSessions.Count(),
                LastUpdate = DateTime.UtcNow
            };

            _ = Task.Run(async () =>
            {
                try
                {
                    await LogMonitoringDataAsync(monitoringData);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Błąd podczas logowania monitoringu: {ex.Message}");
                }
            });

            return monitoringData;
        }
        catch (exceptions.EventNotFoundException)
        {
            throw; // Przekaż dalej
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Błąd w GetEventMonitoringDataAsync dla eventId {eventId}: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            throw; // Przekaż błąd dalej
        }
    }

    public async Task<IEnumerable<ActiveSession>> GetActiveSessionsAsync(int eventId)
    {
        var now = DateTime.UtcNow;
        var scheduleItems = await _context.ScheduleItems
            .Where(si => si.EventId == eventId)
            .Include(si => si.ScheduleItemSpeakers)
            .ToListAsync();

        var activeSessions = scheduleItems
            .Where(si => si.StartAt <= now && si.EndAt >= now)
            .Select(si => new ActiveSession
            {
                ScheduleItemId = si.Id,
                Title = si.Title,
                StartAt = si.StartAt,
                EndAt = si.EndAt,
                Room = si.Room,
                SpeakerCount = si.ScheduleItemSpeakers.Count,
                IsActive = true
            })
            .ToList();

        return activeSessions;
    }

    public async Task<int> GetParticipantCountAsync(int eventId)
    {
        return await _context.Registrations
            .CountAsync(r => r.EventId == eventId && (r.Status == "registered" || r.Status == "checked_in"));
    }

    private async Task LogMonitoringDataAsync(EventMonitoringData data)
    {
        try
        {
            var logFileName = $"monitoring_{data.EventId}_{DateTime.UtcNow:yyyyMMdd}.json";
            var logPath = Path.Combine(_logDirectory, logFileName);

            var logEntry = new
            {
                Timestamp = DateTime.UtcNow,
                EventId = data.EventId,
                EventName = data.EventName,
                Status = data.Status,
                TotalRegistrations = data.TotalRegistrations,
                CheckedInCount = data.CheckedInCount,
                WaitingListCount = data.WaitingListCount,
                ActiveSessionsCount = data.ActiveSessionsCount
            };

            var json = JsonSerializer.Serialize(logEntry, _jsonOptions);
            await File.AppendAllTextAsync(logPath, json + Environment.NewLine);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Błąd podczas logowania: {ex.Message}");
        }
    }

    public async Task LogCheckInEventAsync(CheckInEventArgs args)
    {
        try
        {
            var eventData = new Dictionary<string, object?>();
            var properties = typeof(CheckInEventArgs).GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var prop in properties)
            {
                var value = prop.GetValue(args);
                eventData[prop.Name] = value;
            }

            var logEntry = new
            {
                EventType = "CheckIn",
                Timestamp = DateTime.UtcNow,
                Data = eventData
            };

            var logFileName = $"events_{args.EventId}_{DateTime.UtcNow:yyyyMMdd}.json";
            var logPath = Path.Combine(_logDirectory, logFileName);
            var json = JsonSerializer.Serialize(logEntry, _jsonOptions);
            await File.AppendAllTextAsync(logPath, json + Environment.NewLine);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Błąd podczas logowania zdarzenia: {ex.Message}");
        }
    }

    public async Task LogRegistrationEventAsync(RegistrationEventArgs args)
    {
        try
        {
            var eventData = new Dictionary<string, object?>();
            var properties = typeof(RegistrationEventArgs).GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var prop in properties)
            {
                var value = prop.GetValue(args);
                eventData[prop.Name] = value;
            }

            var logEntry = new
            {
                EventType = "Registration",
                Timestamp = DateTime.UtcNow,
                Data = eventData
            };

            var logFileName = $"events_{args.EventId}_{DateTime.UtcNow:yyyyMMdd}.json";
            var logPath = Path.Combine(_logDirectory, logFileName);
            var json = JsonSerializer.Serialize(logEntry, _jsonOptions);
            await File.AppendAllTextAsync(logPath, json + Environment.NewLine);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Błąd podczas logowania zdarzenia: {ex.Message}");
        }
    }
}
