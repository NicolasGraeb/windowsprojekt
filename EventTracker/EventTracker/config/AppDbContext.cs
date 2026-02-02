namespace EventTracker.config;

using Microsoft.EntityFrameworkCore;
using EventTracker.models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<EventBase> Events => Set<EventBase>();
    public DbSet<Conference> Conferences => Set<Conference>();
    public DbSet<Seminar> Seminars => Set<Seminar>();
    public DbSet<Workshop> Workshops => Set<Workshop>();
    
    public DbSet<User> Users => Set<User>();
    public DbSet<Participant> Participants => Set<Participant>();
    public DbSet<Registration> Registrations => Set<Registration>();
    public DbSet<ScheduleItem> ScheduleItems => Set<ScheduleItem>();
    public DbSet<Speaker> Speakers => Set<Speaker>();
    public DbSet<ScheduleItemSpeaker> ScheduleItemSpeakers => Set<ScheduleItemSpeaker>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<EventBase>()
            .HasDiscriminator<string>("EventType")
            .HasValue<Conference>("Conference")
            .HasValue<Seminar>("Seminar")
            .HasValue<Workshop>("Workshop");

        modelBuilder.Entity<EventBase>()
            .HasOne(e => e.CreatedByUser)
            .WithMany(u => u.CreatedEvents)
            .HasForeignKey(e => e.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Registration>()
            .HasOne(r => r.Event)
            .WithMany(e => e.Registrations)
            .HasForeignKey(r => r.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Registration>()
            .HasOne(r => r.Participant)
            .WithMany(p => p.Registrations)
            .HasForeignKey(r => r.ParticipantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ScheduleItem>()
            .HasOne(si => si.Event)
            .WithMany(e => e.ScheduleItems)
            .HasForeignKey(si => si.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ScheduleItemSpeaker>()
            .HasKey(x => new { x.ScheduleItemId, x.SpeakerId });

        modelBuilder.Entity<ScheduleItemSpeaker>()
            .HasOne(x => x.ScheduleItem)
            .WithMany(si => si.ScheduleItemSpeakers)
            .HasForeignKey(x => x.ScheduleItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ScheduleItemSpeaker>()
            .HasOne(x => x.Speaker)
            .WithMany(s => s.ScheduleItemSpeakers)
            .HasForeignKey(x => x.SpeakerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
