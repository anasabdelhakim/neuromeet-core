import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './_generated/prisma/client';
import { Pool } from 'pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Start seeding...');

  // بنستخدم upsert بدل create عشان لو شغلنا الـ seed أكتر من مرة ميديناش Error إن الإيميل موجود
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {}, // لو موجود متعملش حاجة
    create: {
      email: 'alice@example.com',
      name: 'Alice',
      // Prisma بتسمحلك تكريت اليوزر والبوستات بتاعته في نفس اللحظة (Nested Writes)
      posts: {
        create: [
          { title: 'My First Post', content: 'Hello World!', published: true },
          { title: 'Learning Prisma', content: 'It is amazing.' },
        ],
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob',
      posts: {
        create: [
          {
            title: 'Backend Development',
            content: 'NestJS is very fast.',
            published: true,
          },
        ],
      },
    },
  });

  console.log('Created Users:', { user1, user2 });
  console.log('✅ Seeding finished.');
}

// تشغيل الفانكشن وقفل الاتصال بالداتابيز في النهاية
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
