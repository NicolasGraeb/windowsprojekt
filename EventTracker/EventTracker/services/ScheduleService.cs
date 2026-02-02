using EventTracker.config;
using EventTracker.models;
using Microsoft.EntityFrameworkCore;

namespace EventTracker.services;

public class ScheduleService
{
    private readonly AppDbContext _context;
    
    private readonly Dictionary<string, RoomAvailability> _roomAvailability = new();

    public ScheduleService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ScheduleItem> AddScheduleItemAsync(ScheduleItem scheduleItem)
    {
        if (!string.IsNullOrEmpty(scheduleItem.Room))
        {
            if (!_roomAvailability.ContainsKey(scheduleItem.Room))
            {
                _roomAvailability[scheduleItem.Room] = new RoomAvailability
                {
                    RoomName = scheduleItem.Room,
                    IsAvailable = true
                };
            }

            var room = _roomAvailability[scheduleItem.Room];
            if (!room.IsAvailable)
            {
                throw new InvalidOperationException($"Sala {scheduleItem.Room} jest już zajęta");
            }

            var conflictingItems = await _context.ScheduleItems
                .Where(si => si.Room == scheduleItem.Room &&
                            si.EventId == scheduleItem.EventId &&
                            ((si.StartAt <= scheduleItem.StartAt && si.EndAt > scheduleItem.StartAt) ||
                             (si.StartAt < scheduleItem.EndAt && si.EndAt >= scheduleItem.EndAt) ||
                             (si.StartAt >= scheduleItem.StartAt && si.EndAt <= scheduleItem.EndAt)))
                .ToListAsync();

            if (conflictingItems.Any())
            {
                throw new InvalidOperationException(
                    $"Sala {scheduleItem.Room} jest już zajęta w tym czasie");
            }
        }

        if (scheduleItem.CreatedAt == default(DateTime))
        {
            scheduleItem.CreatedAt = DateTime.UtcNow;
        }

        _context.ScheduleItems.Add(scheduleItem);
        await _context.SaveChangesAsync();

        return scheduleItem;
    }

    public async Task<IEnumerable<ScheduleItem>> GetEventScheduleAsync(int eventId)
    {
        return await _context.ScheduleItems
            .Where(si => si.EventId == eventId)
            .Include(si => si.ScheduleItemSpeakers)
            .ThenInclude(sis => sis.Speaker)
            .OrderBy(si => si.StartAt)
            .ToListAsync();
    }

    public Dictionary<string, RoomAvailability> GetRoomAvailability()
    {
        return _roomAvailability;
    }

    public void UpdateRoomAvailability(string roomName, bool isAvailable)
    {
        if (!_roomAvailability.ContainsKey(roomName))
        {
            _roomAvailability[roomName] = new RoomAvailability
            {
                RoomName = roomName,
                IsAvailable = isAvailable
            };
        }
        else
        {
            _roomAvailability[roomName].IsAvailable = isAvailable;
        }
    }
}

public class RoomAvailability
{
    public string RoomName { get; set; } = string.Empty;
    public bool IsAvailable { get; set; } = true;
    public DateTime? ReservedUntil { get; set; }
}
