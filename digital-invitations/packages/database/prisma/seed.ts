import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { loadTemplateDefinitions } from './templateDefinitions';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@invitations.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@invitations.com',
      mobile: '9999999999',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true
    }
  });
  console.log('Admin user created:', admin.email);

  // Create demo customer
  const customerPasswordHash = await bcrypt.hash('Customer@123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'demo@invitations.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@invitations.com',
      mobile: '9876543210',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      isActive: true
    }
  });
  console.log('Demo customer created:', customer.email);

  // Create categories
  const categories = [
    { name: 'Wedding', slug: 'wedding', icon: '💒', displayOrder: 1 },
    { name: 'Engagement', slug: 'engagement', icon: '💍', displayOrder: 2 },
    { name: 'Baby Shower', slug: 'baby-shower', icon: '👶', displayOrder: 3 },
    { name: 'Birthday', slug: 'birthday', icon: '🎂', displayOrder: 4 },
    { name: 'Anniversary', slug: 'anniversary', icon: '💑', displayOrder: 5 },
    { name: 'Jain Events', slug: 'jain-events', icon: '🙏', displayOrder: 6 },
    { name: 'Religious Events', slug: 'religious-events', icon: '🕉️', displayOrder: 7 },
    { name: 'Housewarming', slug: 'housewarming', icon: '🏠', displayOrder: 8 },
    { name: 'Family Functions', slug: 'family-functions', icon: '👨‍👩‍👧‍👦', displayOrder: 9 },
    { name: 'Other Events', slug: 'other-events', icon: '🎉', displayOrder: 10 }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }
  console.log('Categories created:', categories.length);

  // Create / refresh templates from the data-driven template definitions
  const definitions = loadTemplateDefinitions();

  for (const def of definitions) {
    const categorySlug = def.slug.split('-')[0];
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });

    if (!category) {
      console.warn(`Skipping template "${def.slug}" - category "${categorySlug}" not found`);
      continue;
    }

    const data = {
      name: def.name,
      description: def.description ?? null,
      version: def.version ?? '1.0.0',
      isPremium: def.isPremium ?? false,
      features: (def.features ?? {}) as Prisma.InputJsonValue,
      variables: (def.variables ?? {}) as Prisma.InputJsonValue,
      editableFields: (def.editableFields ?? {}) as Prisma.InputJsonValue,
      config: (def.config ?? {}) as Prisma.InputJsonValue,
      status: 'PUBLISHED' as const
    };

    await prisma.template.upsert({
      where: { slug: def.slug },
      update: data,
      create: { ...data, slug: def.slug, categoryId: category.id }
    });
  }
  console.log('Templates synced from definitions:', definitions.length);

  // Create sample invitation for demo user
  const demoTemplate = await prisma.template.findUnique({
    where: { slug: 'wedding-classic-gold' }
  });

  if (demoTemplate) {
    const invitation = await prisma.invitation.upsert({
      where: { 
        userId_slug: {
          userId: customer.id,
          slug: 'akshat-wedding'
        }
      },
      update: {},
      create: {
        userId: customer.id,
        templateId: demoTemplate.id,
        name: 'Akshat & Priya Wedding',
        slug: 'akshat-wedding',
        description: 'Wedding celebration of Akshat and Priya',
        content: {
          bride_name: 'Priya',
          groom_name: 'Akshat',
          family_name: 'Shah Family'
        },
        status: 'PUBLISHED',
        isPersonalized: true,
        personalizationEnabled: true,
        publishedAt: new Date()
      }
    });
    console.log('Demo invitation created:', invitation.name);

    // Create sample events (clear existing for re-seed)
    await prisma.event.deleteMany({ where: { invitationId: invitation.id } });
    const events = [
      {
        invitationId: invitation.id,
        name: 'Haldi',
        date: new Date('2026-12-12T00:00:00.000Z'),
        startTime: new Date('1970-01-01T10:00:00.000Z'),
        endTime: new Date('1970-01-01T12:00:00.000Z'),
        venueName: 'Shah Residence',
        venueAddress: '123 Marine Drive, Mumbai',
        displayOrder: 1
      },
      {
        invitationId: invitation.id,
        name: 'Mehendi',
        date: new Date('2026-12-13T00:00:00.000Z'),
        startTime: new Date('1970-01-01T14:00:00.000Z'),
        endTime: new Date('1970-01-01T18:00:00.000Z'),
        venueName: 'Shah Residence',
        venueAddress: '123 Marine Drive, Mumbai',
        displayOrder: 2
      },
      {
        invitationId: invitation.id,
        name: 'Sangeet',
        date: new Date('2026-12-14T00:00:00.000Z'),
        startTime: new Date('1970-01-01T18:00:00.000Z'),
        endTime: new Date('1970-01-01T23:00:00.000Z'),
        venueName: 'Grand Hyatt',
        venueAddress: '456 Bandra West, Mumbai',
        displayOrder: 3
      },
      {
        invitationId: invitation.id,
        name: 'Wedding',
        date: new Date('2026-12-15T00:00:00.000Z'),
        startTime: new Date('1970-01-01T19:00:00.000Z'),
        endTime: new Date('1970-01-01T23:59:00.000Z'),
        venueName: 'Taj Palace',
        venueAddress: '789 Colaba, Mumbai',
        displayOrder: 4
      },
      {
        invitationId: invitation.id,
        name: 'Reception',
        date: new Date('2026-12-16T00:00:00.000Z'),
        startTime: new Date('1970-01-01T19:00:00.000Z'),
        endTime: new Date('1970-01-01T23:59:00.000Z'),
        venueName: 'JW Marriott',
        venueAddress: '321 Juhu, Mumbai',
        displayOrder: 5
      }
    ];

    for (const event of events) {
      await prisma.event.create({
        data: event
      });
    }
    console.log('Sample events created:', events.length);

    // Create sample guests
    await prisma.guest.deleteMany({ where: { invitationId: invitation.id } });
    const guests = [
      {
        invitationId: invitation.id,
        name: 'Rahul Shah',
        mobile: '9876543210',
        email: 'rahul@email.com',
        personalToken: 'a8K92LmX7z',
        personalizedLink: `http://localhost:3000/i/${invitation.slug}/a8K92LmX7z`,
        groupName: 'Family',
        status: 'LINK_GENERATED'
      },
      {
        invitationId: invitation.id,
        name: 'Priya Patel',
        mobile: '9876543211',
        email: 'priya@email.com',
        personalToken: 'b9L34MnY8a',
        personalizedLink: `http://localhost:3000/i/${invitation.slug}/b9L34MnY8a`,
        groupName: 'Friends',
        status: 'SENT'
      },
      {
        invitationId: invitation.id,
        name: 'Amit Mehta',
        mobile: '9876543212',
        email: 'amit@email.com',
        personalToken: 'c0M45NoZ9b',
        personalizedLink: `http://localhost:3000/i/${invitation.slug}/c0M45NoZ9b`,
        groupName: 'Colleagues',
        status: 'OPENED'
      }
    ];

    for (const guest of guests) {
      await prisma.guest.create({
        data: {
          ...guest,
          status: guest.status as any
        }
      });
    }
    console.log('Sample guests created:', guests.length);
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
