using EventTracker.config;
using EventTracker.interfaces;
using EventTracker.models;
using Microsoft.EntityFrameworkCore;

namespace EventTracker.repositories;

/// <summary>
/// Specjalne repozytorium dla EventBase obsługujące dziedziczenie.
/// Demonstruje: Dziedziczenie, Polimorfizm
/// </summary>
public class EventRepository : IRepository<EventBase>
{
    private readonly AppDbContext _context;

    public EventRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<EventBase?> GetByIdAsync(int id)
    {
        return await _context.Events.FindAsync(id);
    }

    public async Task<IEnumerable<EventBase>> GetAllAsync()
    {
        return await _context.Events.ToListAsync();
    }

    public async Task<IEnumerable<EventBase>> FindAsync(System.Linq.Expressions.Expression<Func<EventBase, bool>> predicate)
    {
        return await _context.Events.Where(predicate).ToListAsync();
    }

    public async Task<EventBase> AddAsync(EventBase entity)
    {
        await _context.Events.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<EventBase> UpdateAsync(EventBase entity)
    {
        _context.Events.Update(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await GetByIdAsync(id);
        if (entity == null)
            return false;

        _context.Events.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Events.AnyAsync(e => e.Id == id);
    }

    public async Task<int> CountAsync(System.Linq.Expressions.Expression<Func<EventBase, bool>>? predicate = null)
    {
        if (predicate == null)
            return await _context.Events.CountAsync();
        
        return await _context.Events.CountAsync(predicate);
    }

    // Metody specyficzne dla EventBase - polimorfizm
    public async Task<IEnumerable<Conference>> GetConferencesAsync()
    {
        return await _context.Conferences.ToListAsync();
    }

    public async Task<IEnumerable<Seminar>> GetSeminarsAsync()
    {
        return await _context.Seminars.ToListAsync();
    }

    public async Task<IEnumerable<Workshop>> GetWorkshopsAsync()
    {
        return await _context.Workshops.ToListAsync();
    }
}
