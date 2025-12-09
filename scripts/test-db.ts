import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config();
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing database connection...');
    const count = await prisma.member.count();
    console.log(`✓ Connected! Found ${count} members in database`);
    
    const members = await prisma.member.findMany();
    console.log('Members:', members.map(m => ({ id: m.id, name: m.name, parentId: m.parentId })));
  } catch (error: any) {
    console.error('✗ Database connection failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

test();



