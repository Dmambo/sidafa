// Load environment variables first, before any other imports
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv with explicit .env file path
config({ path: path.resolve(__dirname, '..', '.env') });

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is required but was not found in environment variables. ' +
    'Please ensure your .env file exists and contains DATABASE_URL.'
  );
}

// Now import other modules after environment is configured
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client after environment validation
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || process.env.NODE_ENV === 'production' 
    ? false 
    : 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Helper function to convert Prisma Member to FamilyMember tree structure
const memberToFamilyMember = (member: any, allMembers: any[]): any => {
  const children = allMembers
    .filter(m => m.parentId === member.id)
    .map(child => memberToFamilyMember(child, allMembers));
  
  return {
    id: member.id,
    name: member.name,
    gender: member.gender,
    relationship: member.relationship || null,
    birthYear: member.birthYear || null,
    deathYear: member.deathYear || null,
    photoUrl: member.photoUrl || null,
    spouseName: member.spouseName || null,
    spouseId: member.spouseId || null,
    children: children.length > 0 ? children : undefined,
    metadata: {
      motherName: member.motherName || null,
      location: member.location || null,
    },
  };
};

// Get entire family tree
app.get('/api/family', async (req, res) => {
  try {
    const allMembers = await prisma.member.findMany({
      orderBy: { createdAt: 'asc' },
    });
    
    // Find root member (no parentId)
    const root = allMembers.find(m => !m.parentId || m.relationship === 'root');
    
    if (!root) {
      return res.json({
        id: 'root',
        name: 'Family Root',
        gender: 'male',
        relationship: 'root',
        children: [],
      });
    }
    
    const tree = memberToFamilyMember(root, allMembers);
    res.json(tree);
  } catch (error: any) {
    console.error('Error fetching family:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch family tree',
      details: error.message 
    });
  }
});

// Add a new member
app.post('/api/family/members', async (req, res) => {
  try {
    const { parentId, member, shouldLinkSpouse } = req.body;
    
    // If linking spouse, check if parent already has a spouse and unlink it first
    if (shouldLinkSpouse && member.relationship === 'spouse' && parentId !== 'root') {
      const parent = await prisma.member.findUnique({
        where: { id: parentId },
        select: { spouseId: true },
      });
      
      // If parent has an existing spouse, unlink it first
      if (parent?.spouseId) {
        await prisma.member.update({
          where: { id: parent.spouseId },
          data: { spouseId: null },
        });
      }
    }
    
    // Create the new member without spouseId initially if linking spouse
    // (we'll set it after creation to avoid unique constraint issues)
    const newMember = await prisma.member.create({
      data: {
        name: member.name,
        gender: member.gender,
        relationship: member.relationship || 'child',
        birthYear: member.birthYear,
        deathYear: member.deathYear,
        photoUrl: member.photoUrl,
        spouseName: member.spouseName,
        parentId: parentId === 'root' ? null : parentId,
        motherName: member.metadata?.motherName,
        location: member.metadata?.location,
        spouseId: shouldLinkSpouse && member.relationship === 'spouse' ? null : member.spouseId,
      },
    });
    
    // If linking spouse, update both members' spouseId fields
    if (shouldLinkSpouse && member.relationship === 'spouse' && parentId !== 'root') {
      // Update parent to point to new member
      await prisma.member.update({
        where: { id: parentId },
        data: { spouseId: newMember.id },
      });
      
      // Update new member to point to parent
      const updatedMember = await prisma.member.update({
        where: { id: newMember.id },
        data: { spouseId: parentId },
      });
      
      return res.json(updatedMember);
    }
    
    res.json(newMember);
  } catch (error: any) {
    console.error('Error adding member:', error);
    res.status(500).json({ 
      error: 'Failed to add member',
      details: error.message 
    });
  }
});

// Update a member
app.put('/api/family/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Handle "root" ID - find the actual root member
    let memberId = id;
    if (id === 'root') {
      const rootMember = await prisma.member.findFirst({
        where: { relationship: 'root' },
      });
      if (!rootMember) {
        return res.status(404).json({ error: 'Root member not found' });
      }
      memberId = rootMember.id;
    }
    
    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id: memberId },
    });
    
    if (!existingMember) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Build update data object, only including defined fields
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.gender !== undefined) updateData.gender = updates.gender;
    if (updates.birthYear !== undefined && updates.birthYear !== null && updates.birthYear !== '') {
      updateData.birthYear = parseInt(updates.birthYear);
    } else if (updates.birthYear === null || updates.birthYear === '') {
      updateData.birthYear = null;
    }
    if (updates.deathYear !== undefined && updates.deathYear !== null && updates.deathYear !== '') {
      updateData.deathYear = parseInt(updates.deathYear);
    } else if (updates.deathYear === null || updates.deathYear === '') {
      updateData.deathYear = null;
    }
    if (updates.photoUrl !== undefined) updateData.photoUrl = updates.photoUrl || null;
    if (updates.metadata?.location !== undefined) updateData.location = updates.metadata.location || null;
    if (updates.metadata?.motherName !== undefined) updateData.motherName = updates.metadata.motherName || null;
    
    const updated = await prisma.member.update({
      where: { id: memberId },
      data: updateData,
    });
    
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating member:', error);
    res.status(500).json({ 
      error: 'Failed to update member',
      details: error.message 
    });
  }
});

// Delete a member (and all descendants)
app.delete('/api/family/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, unlink spouse if exists
    const member = await prisma.member.findUnique({ where: { id } });
    if (member?.spouseId) {
      await prisma.member.update({
        where: { id: member.spouseId },
        data: { spouseId: null },
      });
    }
    
    // Delete member and all descendants recursively
    const deleteWithChildren = async (memberId: string) => {
      const children = await prisma.member.findMany({ where: { parentId: memberId } });
      for (const child of children) {
        await deleteWithChildren(child.id);
      }
      await prisma.member.delete({ where: { id: memberId } });
    };
    
    await deleteWithChildren(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// Link two members as spouses
app.post('/api/family/link', async (req, res) => {
  try {
    const { memberId1, memberId2 } = req.body;
    
    // Fetch both members to check for existing spouses
    const member1 = await prisma.member.findUnique({
      where: { id: memberId1 },
      select: { spouseId: true },
    });
    
    const member2 = await prisma.member.findUnique({
      where: { id: memberId2 },
      select: { spouseId: true },
    });
    
    if (!member1 || !member2) {
      return res.status(404).json({ error: 'One or both members not found' });
    }
    
    // Unlink existing spouses first to avoid unique constraint violations
    if (member1.spouseId) {
      await prisma.member.update({
        where: { id: member1.spouseId },
        data: { spouseId: null },
      });
    }
    
    if (member2.spouseId) {
      await prisma.member.update({
        where: { id: member2.spouseId },
        data: { spouseId: null },
      });
    }
    
    // Now link the two members together
    await prisma.member.update({
      where: { id: memberId1 },
      data: { spouseId: memberId2 },
    });
    
    await prisma.member.update({
      where: { id: memberId2 },
      data: { spouseId: memberId1 },
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error linking members:', error);
    res.status(500).json({ 
      error: 'Failed to link members',
      details: error.message 
    });
  }
});

// Unlink two members
app.post('/api/family/unlink', async (req, res) => {
  try {
    const { memberId1, memberId2 } = req.body;
    
    await prisma.member.updateMany({
      where: {
        id: { in: [memberId1, memberId2] },
        spouseId: { in: [memberId1, memberId2] },
      },
      data: { spouseId: null },
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error unlinking members:', error);
    res.status(500).json({ error: 'Failed to unlink members' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

