
import React, { useMemo } from 'react';
import { FamilyMember } from '../types';
import { Image as ImageIcon, ZoomIn } from 'lucide-react';

interface GalleryProps {
  data: FamilyMember;
  onAddPhoto?: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ data, onAddPhoto }) => {
  // Extract all members who have photos
  const membersWithPhotos = useMemo(() => {
    const list: FamilyMember[] = [];
    const traverse = (node: FamilyMember) => {
      if (node.photoUrl) {
        list.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(data);
    return list;
  }, [data]);
  const hasPhotos = membersWithPhotos.length > 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-white backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl min-h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-900 mb-2 sm:mb-3">Family Album</h2>
            <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-slate-300 to-slate-100 mx-auto rounded-full"></div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600">Moments and faces captured in time.</p>
        </div>

        <div className="mb-6 sm:mb-8 md:mb-10 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 text-left">
            <div className="p-1.5 sm:p-2 rounded-xl bg-teal-100 text-teal-700 border border-teal-200 flex-shrink-0">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm sm:text-base text-slate-900">Add a new gallery photo</p>
              <p className="text-xs sm:text-sm text-slate-600">Use the Admin Panel to attach a photo to a family member.</p>
            </div>
          </div>
          {onAddPhoto && (
            <button
              onClick={onAddPhoto}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-teal-400 to-sky-300 text-slate-900 text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            >
              Go to Admin Panel
            </button>
          )}
        </div>

        {hasPhotos ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {membersWithPhotos.map((member) => (
              <div key={member.id} className="break-inside-avoid relative group overflow-hidden rounded-xl shadow-xl bg-white border border-slate-200 backdrop-blur-sm">
                <div className="aspect-[3/4] overflow-hidden bg-slate-100">
                  <img 
                    src={member.photoUrl} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-heritage-900/0 group-hover:bg-heritage-900/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                       <ZoomIn className="text-white w-8 h-8" />
                  </div>
                </div>
                <div className="p-4 text-center bg-white relative z-10 backdrop-blur">
                  <h3 className="font-serif font-bold text-slate-900 text-lg">{member.name}</h3>
                  {member.birthYear && <p className="text-slate-500 text-sm mt-1">{member.birthYear}</p>}
                  <p className="text-xs text-slate-400 mt-2 uppercase tracking-wide">{member.relationship === 'root' ? 'Patriarch' : member.relationship === 'spouse' ? 'Matriarch' : 'Member'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center gap-4 py-14 border border-dashed border-slate-300 rounded-2xl bg-white">
            <ImageIcon className="w-16 h-16 text-slate-300" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-serif text-slate-900">No photos yet</h3>
              <p className="text-slate-500 max-w-md">Add photos to family members in the Admin Panel to see them appear here in your family album.</p>
            </div>
            {onAddPhoto && (
              <button
                onClick={onAddPhoto}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-400 to-sky-300 text-slate-900 font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Go to Admin Panel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
