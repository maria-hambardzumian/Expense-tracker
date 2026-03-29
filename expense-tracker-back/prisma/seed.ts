import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  { name: 'Housing', color: '#10b981' },
  { name: 'Transport', color: '#3b82f6' },
  { name: 'Health', color: '#ef4444' },
  { name: 'Entertainment', color: '#8b5cf6' },
  { name: 'Education', color: '#6366f1' },
  { name: 'Work', color: '#64748b' },
  { name: 'Other', color: '#9ca3af' },
];

async function main() {
  const existing = await prisma.category.findMany({
    where: { isDefault: true },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((c) => c.name));

  for (const cat of DEFAULT_CATEGORIES) {
    if (existingNames.has(cat.name)) continue;
    await prisma.category.create({
      data: { ...cat, isDefault: true },
    });
  }
  console.log('Seeded default categories');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
