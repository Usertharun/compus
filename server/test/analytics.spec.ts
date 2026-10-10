import { AnalyticsService } from '../src/modules/analytics/analytics.service';
import { PRODUCT_EVENTS } from '../src/modules/analytics/analytics.events';

describe('Product analytics', () => {
  const logger = { warn: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it('records server-confirmed actions without exposing action content', async () => {
    const prisma = {
      activityLog: { create: jest.fn().mockResolvedValue({ id: 'activity-1' }) },
    };
    const service = new AnalyticsService(prisma as never, logger as never);

    await service.record('user-1', PRODUCT_EVENTS.EVENT_REGISTERED, { eventId: 'event-1' });

    expect(prisma.activityLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        eventType: PRODUCT_EVENTS.EVENT_REGISTERED,
        metadata: { eventId: 'event-1' },
      },
    });
  });

  it('records at most one active session per user per UTC day', async () => {
    const prisma = {
      activityLog: {
        findFirst: jest.fn().mockResolvedValue({ id: 'existing-session' }),
        create: jest.fn(),
      },
    };
    const service = new AnalyticsService(prisma as never, logger as never);

    const result = await service.recordDailySession('user-1');

    expect(result.recorded).toBe(false);
    expect(prisma.activityLog.create).not.toHaveBeenCalled();
    expect(prisma.activityLog.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-1',
          eventType: PRODUCT_EVENTS.SESSION_ACTIVE,
        }),
      }),
    );
  });

  it('summarizes audience, activity and activation for the owner dashboard', async () => {
    const now = new Date();
    const createdAt = new Date(now.getTime() - 60 * 60 * 1000);
    const events = [
      { userId: 'user-1', eventType: PRODUCT_EVENTS.ACCOUNT_REGISTERED, createdAt },
      { userId: 'user-1', eventType: PRODUCT_EVENTS.ONBOARDING_COMPLETED, createdAt },
      { userId: 'user-1', eventType: PRODUCT_EVENTS.EVENT_REGISTERED, createdAt },
    ];
    const prisma = {
      user: {
        count: jest.fn()
          .mockResolvedValueOnce(10)
          .mockResolvedValueOnce(8)
          .mockResolvedValueOnce(2)
          .mockResolvedValueOnce(6),
        findMany: jest.fn().mockResolvedValue([{ id: 'user-1', createdAt }]),
      },
      activityLog: {
        findFirst: jest.fn().mockResolvedValue({ createdAt }),
        findMany: jest.fn()
          .mockResolvedValueOnce([{ userId: 'user-1' }])
          .mockResolvedValueOnce([{ userId: 'user-1' }, { userId: 'user-2' }])
          .mockResolvedValueOnce([{ userId: 'user-1' }, { userId: 'user-2' }, { userId: 'user-3' }])
          .mockResolvedValueOnce(events),
        create: jest.fn(),
      },
    };
    const service = new AnalyticsService(prisma as never, logger as never);

    const overview = await service.getProductOverview();

    expect(overview.audience).toMatchObject({
      totalStudents: 10,
      onboardedStudents: 8,
      onboardingRate: 80,
    });
    expect(overview.activity).toMatchObject({
      dailyActiveUsers: 1,
      weeklyActiveUsers: 2,
      monthlyActiveUsers: 3,
    });
    expect(overview.activation).toMatchObject({
      registered: 1,
      onboarded: 1,
      activated: 1,
      activationConversion: 100,
    });
    expect(overview.retention.day7.status).toBe('COLLECTING');
  });

  it('does not fail the user action when analytics storage is unavailable', async () => {
    const prisma = {
      activityLog: { create: jest.fn().mockRejectedValue(new Error('database unavailable')) },
    };
    const service = new AnalyticsService(prisma as never, logger as never);

    await expect(service.record('user-1', PRODUCT_EVENTS.MESSAGE_SENT)).resolves.toBeUndefined();
    expect(logger.warn).toHaveBeenCalled();
  });

  it('does not fail login when the daily-session lookup is unavailable', async () => {
    const prisma = {
      activityLog: { findFirst: jest.fn().mockRejectedValue(new Error('database unavailable')) },
    };
    const service = new AnalyticsService(prisma as never, logger as never);

    await expect(service.recordDailySession('user-1')).resolves.toMatchObject({ recorded: false });
    expect(logger.warn).toHaveBeenCalled();
  });
});
