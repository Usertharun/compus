import { PrismaClient, UserRole, PostCategory, OpportunityType, EventStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const SYSTEM_PERMISSIONS = [
  { key: 'canCreateAnnouncement', name: 'Create Announcements', category: 'ANNOUNCEMENTS', description: 'Pin and broadcast official announcements' },
  { key: 'canCreateEvent', name: 'Create Campus Events', category: 'EVENTS', description: 'Schedule and host campus events' },
  { key: 'canManageClub', name: 'Manage Clubs', category: 'CLUBS', description: 'Manage club operations, members, and details' },
  { key: 'canModerateCommunity', name: 'Moderate Community', category: 'COMMUNITY', description: 'Moderate community chats and channels' },
  { key: 'canDeletePosts', name: 'Delete Posts', category: 'MODERATION', description: 'Remove non-compliant user posts' },
  { key: 'canPinAnnouncements', name: 'Pin Announcements', category: 'ANNOUNCEMENTS', description: 'Pin high priority notices' },
  { key: 'canUploadNotes', name: 'Upload Study Notes', category: 'ACADEMIC', description: 'Upload and share academic study materials' },
  { key: 'canVerifyOrganizations', name: 'Verify Organizations', category: 'ADMIN', description: 'Verify student clubs and student organizations' },
  { key: 'canAccessAnalytics', name: 'Access Platform Analytics', category: 'ANALYTICS', description: 'View system-wide usage and engagement metrics' },
  { key: 'canManagePermissions', name: 'Manage Permissions', category: 'ADMIN', description: 'Assign and revoke user permissions' },
  { key: 'canManageUsers', name: 'Manage Users', category: 'ADMIN', description: 'Manage user accounts and statuses' },
  { key: 'canManageCommunities', name: 'Manage Communities', category: 'COMMUNITY', description: 'Create and configure communities' },
];

async function main() {
  console.log('🌱 Starting Compus Database PBAC Seed Process...');

  // 1. Seed System Permissions
  console.log('🔐 Seeding System Permissions...');
  for (const perm of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { name: perm.name, category: perm.category, description: perm.description },
      create: perm,
    });
  }
  console.log(`✅ Seeded ${SYSTEM_PERMISSIONS.length} PBAC permissions`);

  // 2. Seed Super Admin User
  const adminEmail = 'admin@compus.edu.in';
  let superAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!superAdmin) {
    const passwordHash = await argon2.hash('SuperAdminArgon2Pass123!');
    superAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: UserRole.SUPER_ADMIN,
        isVerified: true,
        onboardingCompleted: true,
        profile: {
          create: {
            name: 'Compus Platform Owner',
            bio: 'Managing and maintaining the Compus campus network.',
            campusLocation: 'Central Innovation Center',
          },
        },
      },
    });
    console.log(`✅ Super Admin created: ${superAdmin.email}`);
  } else {
    console.log(`ℹ️ Super Admin already exists: ${superAdmin.email}`);
  }

  // 3. Seed Verified Student User
  const studentEmail = 'alex.chen@srmist.edu.in';
  let studentUser = await prisma.user.findUnique({
    where: { email: studentEmail },
  });

  if (!studentUser) {
    const studentPasswordHash = await argon2.hash('StudentArgon2Pass123!');
    studentUser = await prisma.user.create({
      data: {
        email: studentEmail,
        passwordHash: studentPasswordHash,
        role: UserRole.VERIFIED_USER,
        isVerified: true,
        onboardingCompleted: true,
        profile: {
          create: {
            name: 'Alex Chen',
            registerNumber: 'RA2111003010001',
            department: 'Computer Science and Engineering',
            year: '4th Year',
            section: 'CSE-A',
            bio: 'Full stack developer interested in web architecture and real-time systems.',
          },
        },
      },
    });
    console.log(`✅ Verified Student user created: ${studentUser.email}`);

    const studentId = studentUser.id;
    const adminId = superAdmin ? superAdmin.id : undefined;

    const studentPermKeys = ['canCreateEvent', 'canUploadNotes', 'canModerateCommunity'];
    const perms = await prisma.permission.findMany({
      where: { key: { in: studentPermKeys } },
    });

    await prisma.userPermission.createMany({
      data: perms.map((p) => ({
        userId: studentId,
        permissionId: p.id,
        assignedById: adminId,
      })),
      skipDuplicates: true,
    });
    console.log(`✅ Assigned ${perms.length} student permissions to Alex Chen`);
  }

  // 4. Seed Default Community
  const communitySlug = 'cs-society';
  let community = await prisma.community.findUnique({
    where: { slug: communitySlug },
  });

  if (!community) {
    community = await prisma.community.create({
      data: {
        name: 'Computer Science Society',
        slug: communitySlug,
        description: 'Official student community for CS majors and technology enthusiasts.',
        ownerId: superAdmin.id,
        members: {
          create: [
            { userId: superAdmin.id, role: 'OWNER' },
            { userId: studentUser.id, role: 'MEMBER' },
          ],
        },
      },
    });
    console.log(`✅ Default community created: ${community.name}`);

    // Seed Sample Post
    await prisma.post.create({
      data: {
        authorId: studentUser.id,
        communityId: community.id,
        title: 'Welcome to Compus CS Society!',
        content: 'Excited to launch our platform for announcements, events, and notes.',
        category: PostCategory.ANNOUNCEMENT,
        tags: ['CS', 'Compus', 'Welcome'],
      },
    });
  }

  // 5. Seed Sample Opportunity
  const opportunityCount = await prisma.opportunity.count();
  if (opportunityCount === 0) {
    await prisma.opportunity.create({
      data: {
        title: 'Full Stack Engineering Intern',
        companyName: 'Compus Innovation Labs',
        location: 'Campus Tech Center',
        mode: 'ONLINE',
        category: 'INTERNSHIP',
        salaryRange: '$35 - $45 / hr',
        description: 'Build enterprise campus applications using React and NestJS.',
        requiredSkills: ['TypeScript', 'React', 'NestJS', 'PostgreSQL'],
        creatorId: superAdmin.id,
      },
    });
    console.log('✅ Sample opportunity created');
  }

  // 6. Seed Sample Event
  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 7);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2);

    await prisma.event.create({
      data: {
        title: 'Compus Hackathon 2026',
        description: '24-hour campus hackathon with prizes and tech mentors.',
        venue: 'Student Auditorium',
        startTime,
        endTime,
        category: 'Hackathon',
        organizerId: superAdmin.id,
        status: EventStatus.PUBLISHED,
      },
    });
    console.log('✅ Sample event created');
  }

  console.log('🎉 PBAC Database Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
