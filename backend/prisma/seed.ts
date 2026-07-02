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

  // Create INSTRUCTOR demo account
  const instructorPassword = await Bun.password.hash('NeuroMeet#Admin2026');
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@neuromeet.com' },
    update: {},
    create: {
      name: 'Demo Instructor',
      email: 'instructor@neuromeet.com',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      isProfileComplete: true,
    },
  });
  console.log(`✅ Instructor created: ${instructor.email}`);

  // Create STUDENT demo account
  const studentDemoPassword = await Bun.password.hash('NeuroMeet#Student26');
  const studentDemo = await prisma.user.upsert({
    where: { email: 'student@neuromeet.com' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'student@neuromeet.com',
      password: studentDemoPassword,
      role: 'STUDENT',
      isProfileComplete: true,
    },
  });
  console.log(`✅ Student created: ${studentDemo.email}`);

  console.log('Generating 100 student users...');
  const studentPassword = await Bun.password.hash('Student1234#');
  
  // Create an array of users to seed
  const studentPromises: Promise<any>[] = [];
  for (let i = 1; i <= 100; i++) {
    studentPromises.push(
      prisma.user.upsert({
        where: { email: `student${i}@neuromeet.com` },
        update: {},
        create: {
          name: `Student ${i}`,
          email: `student${i}@neuromeet.com`,
          password: studentPassword,
          role: 'STUDENT',
          isProfileComplete: true,
        },
      })
    );
  }
  
  // Wait for all to complete
  await Promise.all(studentPromises);
  console.log('✅ 100 Students created.');

  console.log('Creating Scaling Test Group and enrolling students...');
  let testGroup = await prisma.group.findFirst({
    where: { name: 'Scaling Test Group', instructorId: admin.id }
  });

  if (!testGroup) {
    testGroup = await prisma.group.create({
      data: {
        name: 'Scaling Test Group',
        description: 'A group containing 100 students to test dashboard performance',
        instructorId: admin.id
      }
    });
  }

  const students = await prisma.user.findMany({
    where: { email: { startsWith: 'student', endsWith: '@neuromeet.com' } }
  });

  const enrollmentPromises: Promise<any>[] = [];
  for (const student of students) {
    enrollmentPromises.push(
      prisma.enrollment.upsert({
        where: { studentId_groupId: { studentId: student.id, groupId: testGroup.id } },
        update: {},
        create: {
          studentId: student.id,
          groupId: testGroup.id
        }
      })
    );
  }
  
  await Promise.all(enrollmentPromises);
  console.log('✅ 100 Students successfully enrolled in Scaling Test Group.');

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