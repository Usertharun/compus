import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { EventsService } from '../src/modules/events/events.service';
import { OpportunitiesService } from '../src/modules/opportunities/opportunities.service';
import { CommunityLoginDto, SearchAdminUsersDto } from '../src/modules/admin/dto/admin.dto';
import { PrismaService } from '../src/database/prisma.service';
import { EventsRepository } from '../src/modules/events/repositories/events.repository';
import { OpportunitiesRepository } from '../src/modules/opportunities/repositories/opportunities.repository';
import { AppLoggerService } from '../src/logger/logger.service';
import { CloudinaryStorageService } from '../src/modules/uploads/cloudinary-storage.service';
import { v2 as cloudinary } from 'cloudinary';
import { UploadsController } from '../src/modules/uploads/uploads.module';
import { AdminService } from '../src/modules/admin/admin.service';
import { AdminRepository } from '../src/modules/admin/repositories/admin.repository';

const logger = { log: jest.fn() } as unknown as AppLoggerService;
const asPrisma = (db: unknown) => db as PrismaService;
describe('Public-launch workflows', () => {
  it('cancels atomically with history and notifications for confirmed and waiting students', async () => {
    const tx = { event: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) }, eventStatusHistory: { create: jest.fn() }, eventRsvp: { findMany: jest.fn().mockResolvedValue([{ userId: 'student' }]) }, notification: { createMany: jest.fn() } };
    const db = { event: { findFirst: jest.fn().mockResolvedValue({ organizerId: 'organizer', status: 'REGISTRATION_OPEN', title: 'Meetup' }) }, $transaction: jest.fn(fn => fn(tx)) };
    const service = new EventsService({ findEventById: jest.fn() } as unknown as EventsRepository, asPrisma(db), logger);
    await service.changeEventStatus('organizer', 'event', { status: 'CANCELLED' });
    expect(tx.event.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'event', status: 'REGISTRATION_OPEN', deletedAt: null } }));
    expect(tx.eventStatusHistory.create).toHaveBeenCalled();
    expect(tx.notification.createMany).toHaveBeenCalledWith({ data: [expect.objectContaining({ userId: 'student', type: 'EVENT_CANCELLED' })] });
  });
  it('prevents reopening a cancelled event before writing', async () => {
    const db = { event: { findFirst: jest.fn().mockResolvedValue({ organizerId: 'organizer', status: 'CANCELLED' }) }, $transaction: jest.fn() };
    const service = new EventsService({} as EventsRepository, asPrisma(db), logger);
    await expect(service.changeEventStatus('organizer', 'event', { status: 'REGISTRATION_OPEN' })).rejects.toBeInstanceOf(BadRequestException);
    expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('rejects attendance access by anyone except the event organizer', async () => {
    const db = { event: { findFirst: jest.fn().mockResolvedValue({ organizerId: 'organizer' }) }, eventRsvp: { findMany: jest.fn() } };
    const service = new EventsService({} as EventsRepository, asPrisma(db), logger);
    await expect(service.attendees('other', 'event', {})).rejects.toBeInstanceOf(ForbiddenException);
    expect(db.eventRsvp.findMany).not.toHaveBeenCalled();
  });
  it('pages personal registrations beyond 50, independently of public event visibility', async () => {
    const db = { eventRsvp: { findMany: jest.fn().mockResolvedValue([{ event: { id: 'event-51', visibility: 'COMMUNITY_ONLY' }, status: 'WAITLISTED' }]), count: jest.fn().mockResolvedValue(51) } };
    const service = new EventsService({} as EventsRepository, asPrisma(db), logger);
    const result = await service.registrations('student', { page: 2, limit: 50 });
    expect(db.eventRsvp.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 50, take: 50, where: expect.objectContaining({ userId: 'student' }) }));
    expect(result).toMatchObject({ total: 51, totalPages: 2, items: [{ id: 'event-51', userRsvpStatus: 'WAITLISTED' }] });
  });
  it('prevents waitlisted or cancelled registrations from being checked in', async () => {
    const db = { event: { findFirst: jest.fn().mockResolvedValue({ organizerId: 'organizer', status: 'ONGOING' }) }, eventRsvp: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) } };
    const service = new EventsService({} as EventsRepository, asPrisma(db), logger);
    await expect(service.attendance('organizer', 'event', 'student', true)).rejects.toBeInstanceOf(BadRequestException);
    expect(db.eventRsvp.updateMany).toHaveBeenCalledWith({ where: { eventId: 'event', userId: 'student', status: 'GOING' }, data: { checkedIn: true } });
  });
  it('refuses attendance updates for cancelled events before any write', async () => {
    const db = { event: { findFirst: jest.fn().mockResolvedValue({ organizerId: 'organizer', status: 'CANCELLED' }) }, eventRsvp: { updateMany: jest.fn() } };
    const service = new EventsService({} as EventsRepository, asPrisma(db), logger);
    await expect(service.attendance('organizer', 'event', 'student', true)).rejects.toBeInstanceOf(BadRequestException);
    expect(db.eventRsvp.updateMany).not.toHaveBeenCalled();
  });
  it('includes closed saved opportunities and uses server totals beyond the first page', async () => {
    const db = { bookmark: { findMany: jest.fn().mockResolvedValue([{ opportunity: { id: 'saved-51', status: 'CLOSED' } }]), count: jest.fn().mockResolvedValue(51) } };
    const service = new OpportunitiesService({} as OpportunitiesRepository, asPrisma(db), logger);
    const result = await service.saved('student', { page: 2, limit: 50 });
    expect(db.bookmark.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 50, where: { userId: 'student', targetType: 'OPPORTUNITY', opportunity: { deletedAt: null } } }));
    expect(result).toMatchObject({ total: 51, items: [{ id: 'saved-51', status: 'CLOSED', isBookmarked: true }] });
  });
  it('parses the owner suspended-account filter without treating false as true', () => {
    expect(plainToInstance(SearchAdminUsersDto, { isActive: 'false' }).isActive).toBe(false);
    expect(plainToInstance(SearchAdminUsersDto, { isActive: 'true' }).isActive).toBe(true);
  });
  it('normalizes a copied community email before validation', () => {
    const dto = plainToInstance(
      CommunityLoginDto,
      { email: ' ClubName@Gmail.com ', communityId: ' community-id ' },
    );
    expect(dto).toMatchObject({ email: 'clubname@gmail.com', communityId: 'community-id' });
  });
  it('creates a community automatically when the owner approves a club email', async () => {
    const tx = {
      community: { create: jest.fn().mockResolvedValue({ id: 'community', name: 'Spectrum Club SRM' }) },
      communityMember: { create: jest.fn() },
      communityLogin: { create: jest.fn().mockResolvedValue({ id: 'login', email: 'spectrumclubsrm@gmail.com', communityId: 'community', community: { name: 'Spectrum Club SRM' } }) },
    };
    const db = {
      community: { findUnique: jest.fn().mockResolvedValue(null) },
      communityLogin: { findUnique: jest.fn().mockResolvedValue(null) },
      user: { findUnique: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn((operation: (client: typeof tx) => unknown) => operation(tx)),
    };
    const repository = { recordAdminAuditLog: jest.fn() } as unknown as AdminRepository;
    const service = new AdminService(repository, asPrisma(db), logger);
    await expect(service.provisionCommunity('admin', { email: 'spectrumclubsrm@gmail.com', clubName: 'Spectrum Club SRM' })).resolves.toMatchObject({ email: 'spectrumclubsrm@gmail.com' });
    expect(tx.community.create).toHaveBeenCalledWith({ data: expect.objectContaining({ name: 'Spectrum Club SRM', slug: 'spectrum-club-srm', ownerId: 'admin' }) });
    expect(tx.communityLogin.create).toHaveBeenCalledWith({ data: { email: 'spectrumclubsrm@gmail.com', communityId: 'community' }, include: { community: true } });
  });
  it('keeps Cloudinary disabled without credentials', () => {
    expect(new CloudinaryStorageService(new ConfigService({})).enabled).toBe(false);
  });
  it('rejects partial Cloudinary credentials before making network requests', () => {
    expect(() => new CloudinaryStorageService(new ConfigService({ CLOUDINARY_CLOUD_NAME: 'compus' }))).toThrow('configured together');
  });
  it('stores only the secure URL returned by a signed Cloudinary upload', async () => {
    const upload = jest.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation(((options: unknown, callback: (error?: unknown, result?: unknown) => void) => ({
      end: () => callback(undefined, { secure_url: 'https://res.cloudinary.com/compus/image/upload/v1/compus/images/fixture.png' }),
    })) as never);
    try {
      const service = new CloudinaryStorageService(new ConfigService({ CLOUDINARY_CLOUD_NAME: 'compus', CLOUDINARY_API_KEY: 'key', CLOUDINARY_API_SECRET: 'secret' }));
      await expect(service.upload('fixture', Buffer.from('image'))).resolves.toBe('https://res.cloudinary.com/compus/image/upload/v1/compus/images/fixture.png');
      expect(upload).toHaveBeenCalledWith(expect.objectContaining({ folder: 'compus/images', public_id: 'fixture', resource_type: 'image' }), expect.any(Function));
    } finally { upload.mockRestore(); }
  });
  it('persists a Cloudinary URL without image bytes for new uploads', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'asset' });
    const storage = { upload: jest.fn().mockResolvedValue('https://res.cloudinary.com/compus/image/upload/v1/fixture.png'), destroy: jest.fn() } as unknown as CloudinaryStorageService;
    const controller = new UploadsController(asPrisma({ imageAsset: { create } }), storage);
    const result = await controller.upload('student', { data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=' });
    expect(result.path).toBe('https://res.cloudinary.com/compus/image/upload/v1/fixture.png');
    expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({ ownerId: 'student', content: null, secureUrl: result.path }) });
  });
});
