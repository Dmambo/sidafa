
import React from 'react';
import { FamilyMember } from '../types';
import { X, User, Heart, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';

interface ProfileModalProps {
  member: FamilyMember | null;
  spouses?: FamilyMember[];
  onClose: () => void;
  onSelectMember?: (member: FamilyMember) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ member, spouses = [], onClose, onSelectMember }) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-heritage-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto border border-cream-200">
        
        {/* Header Image/Color */}
        <div className={`h-28 sm:h-32 md:h-36 w-full ${member.relationship === 'root' ? 'bg-heritage-800' : member.relationship === 'spouse' ? 'bg-gold-500' : 'bg-cream-200'} relative`}>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
            <button 
                onClick={onClose}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 bg-white/80 hover:bg-white rounded-full transition-colors z-10 shadow-sm"
            >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-heritage-900" />
            </button>
            <div className="absolute -bottom-10 sm:-bottom-12 md:-bottom-14 left-4 sm:left-6 md:left-8 border-3 sm:border-4 border-white rounded-full overflow-hidden shadow-xl bg-white w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center">
                 {member.photoUrl ? (
                     <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                 ) : (
                     <User className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${member.relationship === 'root' ? 'text-heritage-800' : 'text-gold-400'}`} />
                 )}
            </div>
        </div>

        {/* Content */}
        <div className="pt-12 sm:pt-14 md:pt-16 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 bg-white">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-heritage-900 break-words">{member.name}</h2>
            <p className="text-gold-600 font-medium font-sans uppercase tracking-wider text-xs mt-1">
                {member.relationship === 'spouse' ? 'Matriarch' : member.relationship === 'root' ? 'Family Patriarch' : 'Family Member'}
            </p>

            <div className="mt-8 space-y-5">
                <div className="flex items-center gap-3 text-slate-700 bg-cream-50 p-3 rounded-lg border border-cream-100">
                    <Calendar className="w-5 h-5 text-gold-500" />
                    <span>
                        Born: <strong className="font-serif">{member.birthYear || 'Unknown'}</strong>
                        {member.deathYear && ` — Died: ${member.deathYear}`}
                    </span>
                </div>
                
                {member.metadata?.location && (
                    <div className="flex items-center gap-3 text-slate-700">
                        <MapPin className="w-5 h-5 text-gold-500" />
                        <span>{member.metadata.location}</span>
                    </div>
                )}
                
                {(spouses.length > 0 || member.spouseName) && (
                    <div className="mt-6">
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Heart className="w-3 h-3 text-gold-500" />
                            {spouses.length > 1 ? 'Spouses' : 'Spouse'}
                        </h3>
                        
                        {spouses.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {spouses.map(spouse => (
                                    <div 
                                        key={spouse.id} 
                                        onClick={() => onSelectMember && onSelectMember(spouse)}
                                        className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 hover:border-gold-400 hover:shadow-md cursor-pointer transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-cream-100 overflow-hidden flex-shrink-0">
                                            {spouse.photoUrl ? (
                                                <img src={spouse.photoUrl} alt={spouse.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-gold-400 m-auto mt-2" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-serif font-bold text-heritage-900 group-hover:text-gold-600 transition-colors">{spouse.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-700 bg-cream-50 p-3 rounded-lg border border-cream-200">
                                <LinkIcon className="w-4 h-4 text-slate-400" />
                                <span className="text-sm">Married to <strong className="font-serif">{member.spouseName}</strong></span>
                            </div>
                        )}
                    </div>
                )}
                
                {member.children && member.children.length > 0 && (
                    <div className="mt-6 border-t border-cream-200 pt-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            Legacy ({member.children.length} Children)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {member.children.map(child => (
                                <button 
                                    key={child.id} 
                                    onClick={() => onSelectMember && onSelectMember(child)}
                                    className="text-xs font-medium px-3 py-1.5 bg-slate-50 rounded-full text-slate-700 border border-slate-200 hover:bg-heritage-50 hover:text-heritage-900 hover:border-heritage-200 transition-colors"
                                >
                                    {child.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
