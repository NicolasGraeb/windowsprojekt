using System.Collections;
using EventTracker.config;
using EventTracker.events;
using EventTracker.exceptions;
using EventTracker.interfaces;
using EventTracker.models;
using EventTracker.repositories;
using Microsoft.EntityFrameworkCore;

namespace EventTracker.services;

public class RegistrationService : IRegistrationService
{
    private readonly AppDbContext _context;
    private readonly IRepository<Registration> _registrationRepository;
    private readonly EventRepository _eventRepository;
    private readonly IRepository<Participant> _participantRepository;
    private readonly IServiceScopeFactory _scopeFactory;

    private readonly Dictionary<int, Queue<Registration>> _waitingQueues = new();

    public event EventHandler<RegistrationEventArgs>? ParticipantRegistered;
    public event EventHandler<CheckInEventArgs>? ParticipantCheckedIn;

    public RegistrationService(
        AppDbContext context,
        IRepository<Registration> registrationRepository,
        EventRepository eventRepository,
        IRepository<Participant> participantRepository,
        IServiceScopeFactory scopeFactory)
    {
        _context = context;
        _registrationRepository = registrationRepository;
        _eventRepository = eventRepository;
        _participantRepository = participantRepository;
        _scopeFactory = scopeFactory;
    }

    public async Task<Registration> RegisterParticipantAsync(int eventId, int participantId)
    {
        var eventBase = await _eventRepository.GetByIdAsync(eventId);
        if (eventBase == null)
            throw new EventNotFoundException(eventId);

        var participant = await _participantRepository.GetByIdAsync(participantId);
        if (participant == null)
            throw new InvalidRegistrationException($"Uczestnik o ID {participantId} nie istnieje");

        var existingRegistration = await _context.Registrations
            .FirstOrDefaultAsync(r => r.EventId == eventId && r.ParticipantId == participantId);

        if (existingRegistration != null && existingRegistration.Status != "cancelled")
            throw new ParticipantAlreadyRegisteredException(eventId, participantId);

        var currentRegistrations = await _context.Registrations
            .CountAsync(r => r.EventId == eventId && r.Status != "cancelled" && r.Status != "waiting");

        if (eventBase.MaxParticipants > 0 && currentRegistrations >= eventBase.MaxParticipants)
        {
            var waitingRegistration = new Registration
            {
                EventId = eventId,
                ParticipantId = participantId,
                Status = "waiting",
                RegisteredAt = DateTime.UtcNow
            };

            await _registrationRepository.AddAsync(waitingRegistration);

            if (!_waitingQueues.ContainsKey(eventId))
                _waitingQueues[eventId] = new Queue<Registration>();

            _waitingQueues[eventId].Enqueue(waitingRegistration);

            waitingRegistration.WaitingPosition = _waitingQueues[eventId].Count;
            await _registrationRepository.UpdateAsync(waitingRegistration);

            OnParticipantRegistered(new RegistrationEventArgs(
                waitingRegistration.Id, eventId, participantId, "waiting"));

            return waitingRegistration;
        }

        var registration = new Registration
        {
            EventId = eventId,
            ParticipantId = participantId,
            Status = "registered",
            RegisteredAt = DateTime.UtcNow
        };

        await _registrationRepository.AddAsync(registration);

        OnParticipantRegistered(new RegistrationEventArgs(
            registration.Id, eventId, participantId, "registered"));

        return registration;
    }

    public async Task<bool> CancelRegistrationAsync(int registrationId)
    {
        var registration = await _registrationRepository.GetByIdAsync(registrationId);
        if (registration == null)
            return false;

        registration.Status = "cancelled";
        registration.CancelledAt = DateTime.UtcNow;
        await _registrationRepository.UpdateAsync(registration);

        if (registration.Status == "waiting" && _waitingQueues.ContainsKey(registration.EventId))
        {
            var queue = _waitingQueues[registration.EventId];
            var tempQueue = new Queue<Registration>();
            while (queue.Count > 0)
            {
                var reg = queue.Dequeue();
                if (reg.Id != registrationId)
                    tempQueue.Enqueue(reg);
            }
            _waitingQueues[registration.EventId] = tempQueue;
        }

        if (_waitingQueues.ContainsKey(registration.EventId) && _waitingQueues[registration.EventId].Count > 0)
        {
            var nextInQueue = _waitingQueues[registration.EventId].Dequeue();
            nextInQueue.Status = "registered";
            nextInQueue.WaitingPosition = null;
            await _registrationRepository.UpdateAsync(nextInQueue);
        }

        return true;
    }

    public async Task<Registration?> GetRegistrationAsync(int registrationId)
    {
        return await _registrationRepository.GetByIdAsync(registrationId);
    }

    public async Task<IEnumerable<Registration>> GetEventRegistrationsAsync(int eventId)
    {
        return await _registrationRepository.FindAsync(r => r.EventId == eventId);
    }

    public async Task<bool> CheckInParticipantAsync(int registrationId)
    {
        var registration = await _registrationRepository.GetByIdAsync(registrationId);
        if (registration == null)
            return false;

        if (registration.Status != "registered")
            throw new InvalidRegistrationException("Tylko zarejestrowani uczestnicy mogą się zalogować");

        registration.Status = "checked_in";
        registration.CheckedInAt = DateTime.UtcNow;
        await _registrationRepository.UpdateAsync(registration);

        var participant = await _participantRepository.GetByIdAsync(registration.ParticipantId);
        var participantName = participant != null ? $"{participant.FirstName} {participant.LastName}" : "Unknown";

        OnParticipantCheckedIn(new CheckInEventArgs(
            registration.Id, registration.EventId, registration.ParticipantId, participantName));

        return true;
    }

    public async Task<IEnumerable<Registration>> GetWaitingListAsync(int eventId)
    {
        return await _registrationRepository.FindAsync(r => r.EventId == eventId && r.Status == "waiting");
    }

    protected virtual void OnParticipantRegistered(RegistrationEventArgs e)
    {
        ParticipantRegistered?.Invoke(this, e);
        
        Task.Run(async () =>
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var monitoringService = scope.ServiceProvider.GetRequiredService<IMonitoringService>();
                await monitoringService.LogRegistrationEventAsync(e);
            }
        });
    }

    protected virtual void OnParticipantCheckedIn(CheckInEventArgs e)
    {
        ParticipantCheckedIn?.Invoke(this, e);
        
        Task.Run(async () =>
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var monitoringService = scope.ServiceProvider.GetRequiredService<IMonitoringService>();
                await monitoringService.LogCheckInEventAsync(e);
            }
        });
    }
}
