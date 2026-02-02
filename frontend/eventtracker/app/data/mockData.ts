import { Conference } from '../models/Conference';
import { Seminar } from '../models/Seminar';
import { Workshop } from '../models/Workshop';
import { Speaker } from '../models/Speaker';
import { ScheduleItem } from '../models/ScheduleItem';
import { Participant } from '../models/Participant';
import { Registration, RegistrationStatus } from '../models/Registration';
import { EventStatus } from '../models/EventBase';
import { EventBase } from '../models/EventBase';

const speakers: Speaker[] = [
  new Speaker('s1', 'Anna Kowalska', 'anna.kowalska@example.com', 'Ekspert w dziedzinie AI i machine learning', 'TechCorp'),
  new Speaker('s2', 'Jan Nowak', 'jan.nowak@example.com', 'Specjalista od cloud computing', 'CloudSolutions'),
  new Speaker('s3', 'Maria Wiśniewska', 'maria.wisniewska@example.com', 'Ekspert UX/UI design', 'DesignStudio'),
  new Speaker('s4', 'Piotr Zieliński', 'piotr.zielinski@example.com', 'Architekt systemów', 'SystemArch'),
];

const participants: Participant[] = [
  new Participant('p1', 'Tomasz', 'Kowalczyk', 'tomasz.kowalczyk@example.com', '+48 123 456 789', 'Firma A'),
  new Participant('p2', 'Katarzyna', 'Nowak', 'katarzyna.nowak@example.com', '+48 987 654 321', 'Firma B'),
  new Participant('p3', 'Marcin', 'Lewandowski', 'marcin.lewandowski@example.com', '+48 555 123 456', 'Firma C'),
  new Participant('p4', 'Agnieszka', 'Wójcik', 'agnieszka.wojcik@example.com', '+48 444 789 012', 'Firma D'),
  new Participant('p5', 'Paweł', 'Szymański', 'pawel.szymanski@example.com', '+48 333 456 789', 'Firma E'),
];

export const createMockEvents = (): EventBase[] => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const conf1 = new Conference(
    'e1',
    'Konferencja Tech Summit 2024',
    'Największa konferencja technologiczna w regionie',
    tomorrow,
    new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000),
    'Centrum Kongresowe, Warszawa',
    500,
    3
  );
  conf1.setStatus(EventStatus.ACTIVE);

  const conf2 = new Conference(
    'e2',
    'AI & Machine Learning Forum',
    'Forum poświęcone sztucznej inteligencji',
    nextWeek,
    new Date(nextWeek.getTime() + 1 * 24 * 60 * 60 * 1000),
    'Hotel Marriott, Kraków',
    300,
    2
  );

  const sem1 = new Seminar(
    'e3',
    'Seminarium: Cloud Computing',
    'Praktyczne aspekty wdrażania rozwiązań chmurowych',
    new Date(tomorrow.getTime() + 3 * 24 * 60 * 60 * 1000),
    new Date(tomorrow.getTime() + 3 * 24 * 60 * 60 * 1000),
    'Sala konferencyjna A, Wrocław',
    50,
    'Cloud Computing'
  );

  const work1 = new Workshop(
    'e4',
    'Warsztat: React Advanced',
    'Zaawansowane techniki programowania w React',
    new Date(tomorrow.getTime() + 5 * 24 * 60 * 60 * 1000),
    new Date(tomorrow.getTime() + 5 * 24 * 60 * 60 * 1000),
    'Centrum Szkoleniowe, Gdańsk',
    30,
    true,
    150
  );

  const conf3 = new Conference(
    'e5',
    'Digital Transformation Expo',
    'Wystawa i konferencja o transformacji cyfrowej',
    lastWeek,
    new Date(lastWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
    'Centrum Targowe, Poznań',
    400,
    4
  );
  conf3.setStatus(EventStatus.COMPLETED);

  return [conf1, conf2, sem1, work1, conf3];
};

export const createMockSchedules = (): Map<string, ScheduleItem[]> => {
  const schedules = new Map<string, ScheduleItem[]>();
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  schedules.set('e1', [
    new ScheduleItem('sch1', 'Otwarcie konferencji', 'Powitanie uczestników', tomorrow, new Date(tomorrow.getTime() + 30 * 60 * 1000), 'Sala A', speakers[0]),
    new ScheduleItem('sch2', 'AI w praktyce', 'Wykład o zastosowaniach AI', new Date(tomorrow.getTime() + 60 * 60 * 1000), new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), 'Sala A', speakers[0]),
    new ScheduleItem('sch3', 'Cloud Architecture', 'Najlepsze praktyki', new Date(tomorrow.getTime() + 60 * 60 * 1000), new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), 'Sala B', speakers[1]),
    new ScheduleItem('sch4', 'Design Thinking', 'Warsztat kreatywny', new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000), new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000), 'Sala C', speakers[2]),
  ]);

  return schedules;
};

export const createMockRegistrations = (): Registration[] => {
  const registrations: Registration[] = [];
  
  registrations.push(new Registration('r1', 'e1', participants[0], new Date(), RegistrationStatus.CONFIRMED));
  registrations.push(new Registration('r2', 'e1', participants[1], new Date(), RegistrationStatus.CONFIRMED));
  registrations.push(new Registration('r3', 'e1', participants[2], new Date(), RegistrationStatus.PENDING));
  registrations.push(new Registration('r4', 'e2', participants[3], new Date(), RegistrationStatus.CONFIRMED));
  registrations.push(new Registration('r5', 'e2', participants[4], new Date(), RegistrationStatus.WAITLIST));
  registrations.push(new Registration('r6', 'e3', participants[0], new Date(), RegistrationStatus.CONFIRMED));
  registrations.push(new Registration('r7', 'e4', participants[1], new Date(), RegistrationStatus.PENDING));

  return registrations;
};

export { speakers, participants };


