
import React, { useMemo } from 'react';
import { FamilyMember } from '../types';

interface TimelineViewProps {
  data: FamilyMember;
}

const TimelineView: React.FC<TimelineViewProps> = ({ data }) => {
  const flattenedMembers = useMemo(() => {
    const list: FamilyMember[] = [];
    const traverse = (node: FamilyMember) => {
      list.push(node);
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(data);
    return list.sort((a, b) => (a.birthYear || 9999) - (b.birthYear || 9999));
  }, [data]);

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 md:py-12 px-3 sm:px-4 bg-white backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl min-h-full">
      <div className="text-center mb-8 sm:mb-10 md:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-900">Chronicle of Generations</h2>
        <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-teal-400 to-sky-300 mx-auto mt-3 sm:mt-4 rounded-full"></div>
      </div>
      
      <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 md:ml-12 space-y-8 sm:space-y-10 md:space-y-12 pb-8 sm:pb-10 md:pb-12">
        {flattenedMembers.map((member, idx) => (
          <div key={member.id} className="relative pl-6 sm:pl-8 md:pl-16 group">
            {/* Timeline Dot */}
            <div className={`absolute -left-[7px] sm:-left-[9px] top-4 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-3 sm:border-4 border-white ${member.relationship === 'root' ? 'bg-teal-600' : 'bg-sky-300'} transition-all group-hover:scale-125 shadow-lg z-10`}></div>
            
            <div className="frost-card p-4 sm:p-5 md:p-6 rounded-xl border border-slate-200 shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
               {/* Decorative Background Icon */}
               <div className="absolute -right-4 sm:-right-6 -bottom-4 sm:-bottom-6 opacity-5">
                  <span className="text-6xl sm:text-7xl md:text-9xl font-serif text-slate-800">{member.birthYear?.toString().slice(0,2) || '19'}</span>
               </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
                <div className="flex items-center gap-3 sm:gap-4">
                   {member.photoUrl && (
                       <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-gold-100 shadow-inner flex-shrink-0">
                           <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
                       </div>
                   )}
                   <div className="min-w-0 flex-1">
                        <span className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-800 mb-1.5 sm:mb-2 border border-slate-200 shadow-inner">
                            {member.birthYear || 'Unknown Year'}
                        </span>
                        <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 break-words">{member.name}</h3>
                        <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wide font-medium mt-1">
                            {member.relationship === 'spouse' ? 'Matriarch' : member.relationship === 'root' ? 'Founder' : 'Descendant'}
                        </p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;
