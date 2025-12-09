
import React, { useState, useMemo } from 'react';
import { FamilyMember } from '../types';
import { Trash2, Unlink, AlertTriangle, Search, User } from 'lucide-react';

interface ManagePanelProps {
  data: FamilyMember;
  onDeleteMember: (id: string) => void;
  onUnlinkMembers: (id1: string, id2: string) => void;
}

const ManagePanel: React.FC<ManagePanelProps> = ({ data, onDeleteMember, onUnlinkMembers }) => {
  const [activeTab, setActiveTab] = useState<'delete' | 'unlink'>('delete');
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten tree to get all members
  const allMembers = useMemo(() => {
    const list: FamilyMember[] = [];
    const traverse = (node: FamilyMember) => {
      list.push(node);
      if (node.children) node.children.forEach(traverse);
    };
    traverse(data);
    return list;
  }, [data]);

  // Find all linked pairs
  const linkedPairs = useMemo(() => {
    const pairs: { m1: FamilyMember, m2: FamilyMember }[] = [];
    const processed = new Set<string>();

    allMembers.forEach(m1 => {
        if (m1.spouseId) {
            const m2 = allMembers.find(m => m.id === m1.spouseId);
            if (m2) {
                const key = [m1.id, m2.id].sort().join('-');
                if (!processed.has(key)) {
                    pairs.push({ m1, m2 });
                    processed.add(key);
                }
            }
        }
    });
    return pairs;
  }, [allMembers]);

  const filteredMembers = allMembers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) && m.relationship !== 'root'
  );

  const handleDeleteClick = (member: FamilyMember) => {
      if (window.confirm(`Are you sure you want to delete ${member.name}? WARNING: This will also remove ALL children and descendants of this person.`)) {
          onDeleteMember(member.id);
      }
  };

  const handleUnlinkClick = (m1: FamilyMember, m2: FamilyMember) => {
      if (window.confirm(`Are you sure you want to unlink ${m1.name} and ${m2.name}? They will remain in the tree but the connection line will be removed.`)) {
          onUnlinkMembers(m1.id, m2.id);
      }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 md:py-8 px-2 sm:px-4 font-sans h-full">
        <div className="bg-white backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 h-full flex flex-col">
             <div className="flex flex-col sm:flex-row border-b border-slate-200 bg-slate-50 flex-shrink-0">
                <button 
                    onClick={() => setActiveTab('delete')}
                    className={`flex-1 py-3 sm:py-4 md:py-5 text-xs sm:text-sm font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${activeTab === 'delete' ? 'bg-red-50 text-red-600 border-b-2 sm:border-b-2 border-red-500' : 'text-slate-500 hover:bg-cream-100'}`}
                >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Delete </span>Members
                </button>
                <button 
                    onClick={() => setActiveTab('unlink')}
                    className={`flex-1 py-3 sm:py-4 md:py-5 text-xs sm:text-sm font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${activeTab === 'unlink' ? 'bg-heritage-900 text-gold-400 border-b-2 sm:border-b-2 border-gold-400' : 'text-slate-500 hover:bg-cream-100'}`}
                >
                    <Unlink className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Unlink </span>Spouses
                </button>
            </div>

            <div className="p-4 sm:p-5 md:p-6 overflow-y-auto flex-1 bg-white">
                {activeTab === 'delete' && (
                    <div className="space-y-6">
                        <div className="bg-red-50 border border-red-100 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 text-red-800 text-xs sm:text-sm">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                            <p><strong>Warning:</strong> Deleting a family member is permanent and will cascade to remove all their children, grandchildren, and further descendants.</p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-3 sm:top-3.5 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-cream-300 rounded-lg outline-none focus:ring-2 focus:ring-red-200 text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            {filteredMembers.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 sm:p-4 border border-cream-100 rounded-lg hover:shadow-md transition-all bg-white group">
                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cream-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                                            {member.photoUrl ? (
                                                <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-sm sm:text-base text-heritage-900 truncate">{member.name}</h3>
                                            <p className="text-xs text-slate-500 uppercase">{member.relationship || 'Member'}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteClick(member)}
                                        className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                                        title="Delete Member"
                                    >
                                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                </div>
                            ))}
                            {filteredMembers.length === 0 && (
                                <p className="text-center text-slate-400 py-8">No members found.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'unlink' && (
                    <div className="space-y-6">
                         <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3 text-blue-900 text-sm">
                            <Unlink className="w-5 h-5 flex-shrink-0" />
                            <p>Unlinking removes the visual dashed line between two spouses but keeps both individuals in the family tree.</p>
                        </div>

                        <div className="grid gap-4">
                            {linkedPairs.map(({ m1, m2 }) => (
                                <div key={`${m1.id}-${m2.id}`} className="flex items-center justify-between p-4 border border-cream-200 rounded-xl bg-cream-50">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white overflow-hidden border border-cream-200">
                                                {m1.photoUrl ? <img src={m1.photoUrl} className="w-full h-full object-cover"/> : <User className="w-4 h-4 m-auto mt-2 text-slate-300"/>}
                                            </div>
                                            <span className="font-bold text-heritage-900">{m1.name}</span>
                                        </div>
                                        <div className="h-px w-8 bg-gold-400"></div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white overflow-hidden border border-cream-200">
                                                {m2.photoUrl ? <img src={m2.photoUrl} className="w-full h-full object-cover"/> : <User className="w-4 h-4 m-auto mt-2 text-slate-300"/>}
                                            </div>
                                            <span className="font-bold text-heritage-900">{m2.name}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleUnlinkClick(m1, m2)}
                                        className="text-sm text-red-500 hover:text-red-700 font-bold px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        Unlink
                                    </button>
                                </div>
                            ))}
                             {linkedPairs.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-slate-400 mb-2">No custom spouse links found.</p>
                                    <p className="text-xs text-slate-300">Use the Admin Panel to link members.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ManagePanel;
