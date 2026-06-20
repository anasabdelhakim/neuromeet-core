import { PrismaClient } from '../lib/prisma/_generated';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL as string });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Seeding database...');

  // Create ADMIN account
  const adminPassword = await Bun.password.hash('Anas1234#');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@neuromeet.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@neuromeet.com',
      password: adminPassword,
      role: 'ADMIN',
      isProfileComplete: true,
    },
  });
  console.log(`✅ Admin created: ${admin.email} (${admin.role})`);

  // Create INSTRUCTOR account
  const instructorPassword = await Bun.password.hash('Anas1234#');
  const instructor = await prisma.user.upsert({
    where: { email: 'anasabdoali22@gmail.com' },
    update: {},
    create: {
      name: 'Anas Abdelhakim',
      email: 'anasabdoali22@gmail.com',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      isProfileComplete: true,
    },
  });
  console.log(`✅ Instructor created: ${instructor.email} (${instructor.role})`);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });