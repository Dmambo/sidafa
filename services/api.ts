import { FamilyMember } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api';

export const familyApi = {
  async getFamilyTree(): Promise<FamilyMember> {
    const response = await fetch(`${API_BASE}/family`);
    if (!response.ok) throw new Error('Failed to fetch family tree');
    return response.json();
  },

  async addMember(parentId: string, member: FamilyMember, shouldLinkSpouse?: boolean): Promise<void> {
    const response = await fetch(`${API_BASE}/family/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentId, member, shouldLinkSpouse }),
    });
    if (!response.ok) throw new Error('Failed to add member');
  },

  async updateMember(memberId: string, updates: Partial<FamilyMember>): Promise<void> {
    const response = await fetch(`${API_BASE}/family/members/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update member');
  },

  async deleteMember(memberId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/family/members/${memberId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete member');
  },

  async linkMembers(memberId1: string, memberId2: string): Promise<void> {
    const response = await fetch(`${API_BASE}/family/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId1, memberId2 }),
    });
    if (!response.ok) throw new Error('Failed to link members');
  },

  async unlinkMembers(memberId1: string, memberId2: string): Promise<void> {
    const response = await fetch(`${API_BASE}/family/unlink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId1, memberId2 }),
    });
    if (!response.ok) throw new Error('Failed to unlink members');
  },
};

