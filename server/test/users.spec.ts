import { UsersService } from '../src/modules/users/users.service';

describe('UsersService campus hub', () => {
  it('combines the current user actions into one bounded response', async () => {
    const prisma = {
      profile: { findUnique: jest.fn().mockResolvedValue({ name: 'Tharun R' }) },
      notification: {
        findMany: jest.fn().mockResolvedValue([{ id: 'notice-1', title: 'Reply received' }]),
        count: jest.fn().mockResolvedValue(3),
      },
      eventRsvp: {
        findMany: jest.fn().mockResolvedValue([{ status: 'GOING', event: { id: 'event-1', title: 'Workshop' } }]),
      },
      opportunityApplication: {
        findMany: jest.fn().mockResolvedValue([{ id: 'application-1', status: 'PENDING', opportunity: { id: 'opportunity-1' } }]),
      },
      bookmark: {
        findMany: jest.fn().mockResolvedValue([{ id: 'bookmark-1', opportunity: { id: 'opportunity-2' } }]),
      },
    };
    const service = new UsersService({} as never, {} as never, prisma as never);

    const hub = await service.getCampusHub('user-1');

    expect(hub.firstName).toBe('Tharun');
    expect(hub.unreadCount).toBe(3);
    expect(hub.upcomingEvents[0]).toMatchObject({ id: 'event-1', registrationStatus: 'GOING' });
    expect(hub.applications[0]).toMatchObject({ id: 'application-1', opportunity: { id: 'opportunity-1' } });
    expect(hub.savedOpportunities[0]).toMatchObject({ id: 'bookmark-1', opportunity: { id: 'opportunity-2' } });
    expect(prisma.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 5 }));
    expect(prisma.eventRsvp.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 5 }));
  });
});
