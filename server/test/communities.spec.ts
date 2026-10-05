import { CommunitiesService } from '../src/modules/communities/communities.service';
import { CommunitiesRepository } from '../src/modules/communities/repositories/communities.repository';
import { FeedRepository } from '../src/modules/feed/repositories/feed.repository';
import { PrismaService } from '../src/database/prisma.service';
import { AppLoggerService } from '../src/logger/logger.service';

describe('Communities & Join Policy Tests', () => {
  it('should validate community slug format', () => {
    const validSlug = 'gdsc-srmist-2026';
    const invalidSlug = 'GDSC SRM!';

    const slugRegex = /^[a-z0-9-]+$/;

    expect(slugRegex.test(validSlug)).toBe(true);
    expect(slugRegex.test(invalidSlug)).toBe(false);
  });

  it('should handle OPEN vs APPROVAL_REQUIRED join policies', () => {
    const openPolicy = 'OPEN';
    const approvalPolicy = 'APPROVAL_REQUIRED';

    const requiresRequest = (policy: string) => policy === 'APPROVAL_REQUIRED';

    expect(requiresRequest(openPolicy)).toBe(false);
    expect(requiresRequest(approvalPolicy)).toBe(true);
  });

  it('should verify local community role hierarchy', () => {
    const roles = ['OWNER', 'MODERATOR', 'MEMBER'];

    const canManageMembers = (role: string) => role === 'OWNER' || role === 'MODERATOR';

    expect(canManageMembers(roles[0])).toBe(true);
    expect(canManageMembers(roles[1])).toBe(true);
    expect(canManageMembers(roles[2])).toBe(false);
  });

  it('persists a club page theme for its owner', async () => {
    const repository = {
      findMemberRole: jest.fn().mockResolvedValue('OWNER'),
      findByIdWithDetails: jest.fn().mockResolvedValue({ id: 'club', primaryColor: '#112233', accentColor: '#aabbcc', themeStyle: 'MINIMAL' }),
    } as unknown as CommunitiesRepository;
    const db = { community: { update: jest.fn().mockResolvedValue({ id: 'club' }) } } as unknown as PrismaService;
    const service = new CommunitiesService(repository, {} as FeedRepository, db, {} as AppLoggerService);
    await service.updateCommunity('owner', 'club', { primaryColor: '#112233', accentColor: '#aabbcc', themeStyle: 'MINIMAL' });
    expect((db as unknown as { community: { update: jest.Mock } }).community.update).toHaveBeenCalledWith({
      where: { id: 'club' },
      data: expect.objectContaining({ primaryColor: '#112233', accentColor: '#aabbcc', themeStyle: 'MINIMAL' }),
    });
  });
});
