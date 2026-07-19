import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Mulai seeding data...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventhub.com' },
    update: {},
    create: {
      full_name: 'Super Admin',
      email: 'admin@eventhub.com',
      password_hash: '$2b$10$dummyHashBcryptContoh123', 
      role: 'SUPERADMIN',
    },
  });

  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@eventhub.com' },
    update: {},
    create: {
      full_name: 'BEM Universitas ABC',
      email: 'organizer@eventhub.com',
      password_hash: '$2b$10$dummyHashBcryptContoh123',
      role: 'ORGANIZER',
    },
  });

  const existingEvent = await prisma.event.findFirst({
    where: { organizer_id: organizer.id }
  });

  if (!existingEvent) {
    await prisma.event.create({
      data: {
        title: 'Hackathon Nasional 2026',
        description: 'Kompetisi coding 48 jam nonstop untuk mahasiswa seluruh Indonesia.',
        organizer_id: organizer.id,
        quota: 100,
        price: 50000,
        registration_deadline: new Date('2026-08-17T23:59:59Z'),
        event_type: 'COMPETITION',
      },
    });
  }

  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });