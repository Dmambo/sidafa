
export interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female';
  relationship?: 'root' | 'spouse' | 'child'; // How they relate to their parent node context
  birthYear?: number;
  deathYear?: number;
  photoUrl?: string; // Placeholder or user uploaded
  spouseName?: string; // For leaf nodes or simplified display (legacy)
  spouseId?: string; // ID of an existing family member who is the spouse (inter-family marriage)
  children?: FamilyMember[];
  isExpanded?: boolean; // For UI state in the tree
  metadata?: {
    motherName?: string; // If they are a child, who is the mother?
    location?: string;
  };
}

export interface TreeData extends FamilyMember {}

export type ViewMode = 'home' | 'tree' | 'gallery' | 'timeline' | 'search' | 'admin' | 'manage';
