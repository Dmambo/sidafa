
import React, { useState, useRef, useEffect } from 'react';
import { FamilyMember } from '../types';
import { Plus, Save, Upload, Image as ImageIcon, X, Link as LinkIcon, Baby, Heart, ChevronDown, Check, User, Edit } from 'lucide-react';

interface AdminPanelProps {
  data: FamilyMember;
  onAddMember: (parentId: string, newMember: FamilyMember, linkSpouse?: boolean) => void;
  onLinkMembers?: (id1: string, id2: string) => void;
  onUpdateMember?: (memberId: string, updates: Partial<FamilyMember>) => void;
}

interface MemberOption {
    id: string;
    name: string;
    photoUrl?: string;
}

const MemberSelect = ({ 
    label, 
    value, 
    options, 
    onChange 
  }: { 
    label: string; 
    value: string; 
    options: MemberOption[]; 
    onChange: (val: string) => void 
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selected = options.find(o => o.id === value);
    const containerRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
  
    return (
      <div className="relative" ref={containerRef}>
        <label className="block text-sm font-semibold text-heritage-900 mb-2">{label}</label>
        
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-cream-300 rounded-lg p-3 text-left flex items-center gap-3 focus:ring-2 focus:ring-gold-400 outline-none shadow-sm transition-all hover:bg-cream-50"
        >
          {selected ? (
            <>
              <div className="w-8 h-8 rounded-full bg-cream-200 flex-shrink-0 overflow-hidden border border-cream-300 flex items-center justify-center">
                 {selected.photoUrl ? (
                   <img src={selected.photoUrl} alt="" className="w-full h-full object-cover" />
                 ) : (
                   <User className="w-5 h-5 text-gold-400" />
                 )}
              </div>
              <span className="block truncate font-serif font-medium text-heritage-900">{selected.name}</span>
            </>
          ) : (
             <span className="text-slate-400 pl-1">Select a member...</span>
          )}
          <ChevronDown className={`w-4 h-4 ml-auto text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
  
        {isOpen && (
          <div className="absolute z-[100] mt-2 w-full bg-white shadow-xl rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm custom-scrollbar border border-cream-200">
              {options.map((option) => (
                  <div
                  key={option.id}
                  className={`cursor-pointer select-none relative py-3 pl-3 pr-9 flex items-center gap-3 hover:bg-cream-50 ${option.id === value ? 'bg-gold-50' : ''}`}
                  onClick={() => {
                      onChange(option.id);
                      setIsOpen(false);
                  }}
                  >
                      <div className="w-8 h-8 rounded-full bg-cream-100 flex-shrink-0 overflow-hidden border border-cream-200 flex items-center justify-center">
                          {option.photoUrl ? (
                              <img src={option.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                              <User className="w-4 h-4 text-gold-400" />
                          )}
                      </div>
                      <span className={`block truncate font-serif ${option.id === value ? 'font-bold text-heritage-900' : 'font-normal text-slate-600'}`}>
                          {option.name}
                      </span>
                      {option.id === value && (
                           <Check className="w-4 h-4 text-gold-600 absolute right-3" />
                      )}
                  </div>
              ))}
          </div>
        )}
      </div>
    )
  }

const AdminPanel: React.FC<AdminPanelProps> = ({ data, onAddMember, onLinkMembers, onUpdateMember }) => {
  const [activeTab, setActiveTab] = useState<'add' | 'link' | 'edit'>('add');
  const [additionMode, setAdditionMode] = useState<'child' | 'spouse'>('child');
  const [parentId, setParentId] = useState<string>('root');
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [rawPhoto, setRawPhoto] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropZoom, setCropZoom] = useState(1.2);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropSaving, setCropSaving] = useState(false);
  const [shouldLinkSpouse, setShouldLinkSpouse] = useState(true);
  const [linkMember1, setLinkMember1] = useState('');
  const [linkMember2, setLinkMember2] = useState('');
  
  // Edit state
  const [editMemberId, setEditMemberId] = useState<string>('');
  const [editName, setEditName] = useState('');
  const [editBirthYear, setEditBirthYear] = useState('');
  const [editDeathYear, setEditDeathYear] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female'>('male');
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [editRawPhoto, setEditRawPhoto] = useState<string | null>(null);
  const [editIsCropping, setEditIsCropping] = useState(false);
  const [editCropZoom, setEditCropZoom] = useState(1.2);
  const [editCropX, setEditCropX] = useState(0);
  const [editCropY, setEditCropY] = useState(0);
  const [editCropSaving, setEditCropSaving] = useState(false);
  const [editLocation, setEditLocation] = useState('');

  const getAllMembers = (node: FamilyMember): MemberOption[] => {
    let list: MemberOption[] = [{ id: node.id, name: node.name, photoUrl: node.photoUrl }];
    if (node.children) {
      node.children.forEach(child => {
        list = [...list, ...getAllMembers(child)];
      });
    }
    return list;
  };

  const allMembers = getAllMembers(data);
  
  const selectedEditMember = editMemberId ? allMembers.find(m => m.id === editMemberId) : null;
  
  useEffect(() => {
    if (selectedEditMember && editMemberId) {
      const member = findMemberById(editMemberId, data);
      if (member) {
        setEditName(member.name);
        setEditBirthYear(member.birthYear?.toString() || '');
        setEditDeathYear(member.deathYear?.toString() || '');
        setEditGender(member.gender);
        setEditPhotoPreview(member.photoUrl || null);
        setEditLocation(member.metadata?.location || '');
      }
    }
  }, [editMemberId, data]);
  
  const findMemberById = (id: string, node: FamilyMember): FamilyMember | null => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findMemberById(id, child);
        if (found) return found;
      }
    }
    return null;
  };
  
  const handleEditPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setEditRawPhoto(base64);
        setEditIsCropping(true);
        setEditCropZoom(1.2);
        setEditCropX(0);
        setEditCropY(0);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const commitEditCrop = async () => {
    if (!editRawPhoto) return;
    setEditCropSaving(true);
    const img = new Image();
    img.src = editRawPhoto;
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
    });

    const size = 600;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setEditCropSaving(false);
      return;
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);

    const baseScale = Math.max(size / img.width, size / img.height) * editCropZoom;
    const drawW = img.width * baseScale;
    const drawH = img.height * baseScale;
    const translateX = (editCropX / 100) * (size / 2);
    const translateY = (editCropY / 100) * (size / 2);
    const dx = size / 2 - drawW / 2 + translateX;
    const dy = size / 2 - drawH / 2 + translateY;

    ctx.drawImage(img, dx, dy, drawW, drawH);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setEditPhotoPreview(dataUrl);
    setEditIsCropping(false);
    setEditRawPhoto(null);
    setEditCropSaving(false);
  };
  
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMemberId || !onUpdateMember) return;
    
    const updates: Partial<FamilyMember> = {
      name: editName,
      gender: editGender,
      birthYear: editBirthYear ? parseInt(editBirthYear) : undefined,
      deathYear: editDeathYear ? parseInt(editDeathYear) : undefined,
      photoUrl: editPhotoPreview || undefined,
      metadata: {
        location: editLocation || undefined,
      },
    };
    
    onUpdateMember(editMemberId, updates);
    alert('Member updated successfully!');
    
    // Reset form
    setEditMemberId('');
    setEditName('');
    setEditBirthYear('');
    setEditDeathYear('');
    setEditPhotoPreview(null);
    setEditLocation('');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setRawPhoto(base64);
        setIsCropping(true);
        setCropZoom(1.2);
        setCropX(0);
        setCropY(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const commitCrop = async () => {
    if (!rawPhoto) return;
    setCropSaving(true);
    const img = new Image();
    img.src = rawPhoto;
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
    });

    const size = 600;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCropSaving(false);
      return;
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);

    const baseScale = Math.max(size / img.width, size / img.height) * cropZoom;
    const drawW = img.width * baseScale;
    const drawH = img.height * baseScale;
    const translateX = (cropX / 100) * (size / 2);
    const translateY = (cropY / 100) * (size / 2);
    const dx = size / 2 - drawW / 2 + translateX;
    const dy = size / 2 - drawH / 2 + translateY;

    ctx.drawImage(img, dx, dy, drawW, drawH);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPhotoPreview(dataUrl);
    setIsCropping(false);
    setRawPhoto(null);
    setCropSaving(false);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: FamilyMember = {
      id: `new-${Date.now()}`,
      name,
      gender,
      birthYear: parseInt(birthYear) || undefined,
      relationship: additionMode === 'spouse' ? 'spouse' : 'child',
      photoUrl: photoPreview || undefined,
      children: []
    };
    onAddMember(parentId, newMember, additionMode === 'spouse' ? shouldLinkSpouse : false);
    setName('');
    setBirthYear('');
    setPhotoPreview(null);
    alert('Member added successfully!');
  };

  const handleSubmitLink = (e: React.FormEvent) => {
      e.preventDefault();
      if (!linkMember1 || !linkMember2) return;
      if (onLinkMembers) {
          onLinkMembers(linkMember1, linkMember2);
          alert('Members linked successfully!');
          setLinkMember1('');
          setLinkMember2('');
      }
  };

  return (
    <>
    <div className="max-w-3xl mx-auto py-4 sm:py-6 md:py-8 px-2 sm:px-4 font-sans relative z-0">
      <div className="bg-white backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-visible">
        
        <div className="flex flex-col sm:flex-row border-b border-cream-200 bg-cream-50 overflow-hidden rounded-t-xl sm:rounded-t-2xl">
            <button 
                onClick={() => setActiveTab('add')}
                className={`flex-1 py-3 sm:py-4 md:py-5 text-xs sm:text-sm font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${activeTab === 'add' ? 'bg-heritage-900 text-gold-400' : 'text-slate-500 hover:bg-cream-100'}`}
            >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Add</span> Member
            </button>
            <button 
                onClick={() => setActiveTab('edit')}
                className={`flex-1 py-3 sm:py-4 md:py-5 text-xs sm:text-sm font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${activeTab === 'edit' ? 'bg-heritage-900 text-gold-400' : 'text-slate-500 hover:bg-cream-100'}`}
            >
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Edit</span> Member
            </button>
            <button 
                onClick={() => setActiveTab('link')}
                className={`flex-1 py-3 sm:py-4 md:py-5 text-xs sm:text-sm font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${activeTab === 'link' ? 'bg-heritage-900 text-gold-400' : 'text-slate-500 hover:bg-cream-100'}`}
            >
                <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Link <span className="hidden xs:inline">Spouses</span>
            </button>
        </div>

        <div className="p-4 sm:p-6 md:p-8 bg-white relative overflow-visible">
          {activeTab === 'edit' ? (
            <form onSubmit={handleSubmitEdit} className="space-y-8">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 sm:p-4 rounded-r-lg text-xs sm:text-sm text-blue-900 leading-relaxed">
                Select a member to edit their information. You can update their name, birth year, death year, photo, and location.
              </div>
              
              <div className="relative z-50">
                <MemberSelect 
                  label="Select Member to Edit"
                  options={allMembers}
                  value={editMemberId}
                  onChange={setEditMemberId}
                />
              </div>
              
              {selectedEditMember && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-heritage-900 mb-3">Profile Photo</label>
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="relative group">
                        <div className={`w-24 h-24 rounded-full border-4 ${editPhotoPreview ? 'border-teal-400' : 'border-dashed border-slate-300'} flex items-center justify-center overflow-hidden bg-cream-50`}>
                          {editPhotoPreview ? (
                            <img src={editPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-slate-300" />
                          )}
                        </div>
                        {(editPhotoPreview || editRawPhoto) && (
                          <button 
                            type="button"
                            onClick={() => { setEditPhotoPreview(null); setEditRawPhoto(null); }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 bg-heritage-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-heritage-800 transition-colors shadow-lg shadow-heritage-900/20">
                          <Upload className="w-4 h-4" />
                          Upload & Crop
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleEditPhotoChange}
                          />
                        </label>
                        <p className="text-xs text-slate-500">Images will be cropped to a square for the gallery.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-heritage-900 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        required
                        className="w-full p-2.5 sm:p-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-gold-400 outline-none bg-cream-50 text-sm"
                        placeholder="e.g. Omar Sano"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-heritage-900 mb-2">Birth Year</label>
                      <input 
                        type="number" 
                        value={editBirthYear}
                        onChange={e => setEditBirthYear(e.target.value)}
                        className="w-full p-2.5 sm:p-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-gold-400 outline-none bg-cream-50 text-sm"
                        placeholder="e.g. 1990"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-heritage-900 mb-2">Death Year (optional)</label>
                      <input 
                        type="number" 
                        value={editDeathYear}
                        onChange={e => setEditDeathYear(e.target.value)}
                        className="w-full p-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-gold-400 outline-none bg-cream-50"
                        placeholder="e.g. 2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-heritage-900 mb-2">Gender</label>
                      <select 
                        value={editGender}
                        onChange={e => setEditGender(e.target.value as any)}
                        className="w-full p-3 border border-cream-300 rounded-lg outline-none bg-cream-50"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-heritage-900 mb-2">Location (optional)</label>
                    <input 
                      type="text" 
                      value={editLocation}
                      onChange={e => setEditLocation(e.target.value)}
                      className="w-full p-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-gold-400 outline-none bg-cream-50"
                      placeholder="e.g. Conakry, Guinea"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-500 to-sky-400 text-white py-4 rounded-lg font-bold hover:from-teal-600 hover:to-sky-500 transition flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                  >
                    <Save className="w-5 h-5" />
                    Update Member
                  </button>
                </>
              )}
            </form>
          ) : activeTab === 'add' ? (
            <form onSubmit={handleSubmitAdd} className="space-y-8">
                
                <div className="flex p-1 bg-cream-100 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setAdditionMode('child')}
                        className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm ${additionMode === 'child' ? 'bg-white text-heritage-900' : 'text-slate-400 hover:text-slate-600 shadow-none'}`}
                    >
                        <Baby className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Add </span>Child
                    </button>
                    <button
                        type="button"
                        onClick={() => setAdditionMode('spouse')}
                        className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm ${additionMode === 'spouse' ? 'bg-white text-gold-600' : 'text-slate-400 hover:text-slate-600 shadow-none'}`}
                    >
                        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Add </span>Spouse
                    </button>
                </div>

                <div className={`p-4 rounded-lg text-sm border flex gap-3 items-start ${additionMode === 'spouse' ? 'bg-gold-50 border-gold-100 text-heritage-900' : 'bg-green-50 border-green-100 text-heritage-900'}`}>
                    <div className="mt-0.5">
                       {additionMode === 'spouse' ? <Heart className="w-4 h-4 text-gold-500"/> : <Baby className="w-4 h-4 text-green-600"/>}
                    </div>
                    {additionMode === 'spouse' 
                    ? "Adding a spouse starts a new branch. They will be visually connected to their partner." 
                    : "Adding a child extends the lineage downwards from the selected parent."}
                </div>

                <div className="relative z-50">
                  <MemberSelect 
                      label={additionMode === 'spouse' ? 'Select Partner' : 'Select Parent'}
                      options={allMembers}
                      value={parentId}
                      onChange={setParentId}
                  />
                </div>

                {additionMode === 'spouse' && (
                    <div className="flex items-center gap-2 pl-1 bg-cream-50 p-3 rounded-lg border border-cream-200">
                    <input 
                        type="checkbox" 
                        id="linkSpouse"
                        checked={shouldLinkSpouse}
                        onChange={e => setShouldLinkSpouse(e.target.checked)}
                        className="w-4 h-4 text-gold-600 rounded border-slate-300 focus:ring-gold-500"
                    />
                    <label htmlFor="linkSpouse" className="text-sm text-heritage-800 cursor-pointer font-medium">
                        Draw dashed connection line in tree
                    </label>
                </div>
                )}

                <div>
                    <label className="block text-sm font-semibold text-heritage-900 mb-3">Profile Photo</label>
                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="relative group">
                            <div className={`w-24 h-24 rounded-full border-4 ${photoPreview ? 'border-teal-400' : 'border-dashed border-slate-300'} flex items-center justify-center overflow-hidden bg-cream-50`}>
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-slate-300" />
                                )}
                            </div>
                            {(photoPreview || rawPhoto) && (
                                <button 
                                    type="button"
                                    onClick={() => { setPhotoPreview(null); setRawPhoto(null); }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="cursor-pointer inline-flex items-center gap-2 bg-heritage-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-heritage-800 transition-colors shadow-lg shadow-heritage-900/20">
                                <Upload className="w-4 h-4" />
                                Upload & Crop
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handlePhotoChange}
                                />
                            </label>
                            <p className="text-xs text-slate-500">Images will be cropped to a square for the gallery.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-heritage-900 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            className="w-full p-2.5 sm:p-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-gold-400 outline-none bg-cream-50 text-sm"
                            placeholder="e.g. Omar Sano"
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-semibold text-heritage-900 mb-2">Birth Year</label>
                        <input 
                            type="number" 
                            value={birthYear}
                            onChange={e => setBirthYear(e.target.value)}
                            className="w-full p-2.5 sm:p-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-gold-400 outline-none bg-cream-50 text-sm"
                            placeholder="e.g. 1990"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-heritage-900 mb-2">Gender</label>
                    <select 
                        value={gender}
                        onChange={e => setGender(e.target.value as any)}
                        className="w-full p-3 border border-cream-300 rounded-lg outline-none bg-cream-50"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-gold-500 text-heritage-900 py-4 rounded-lg font-bold hover:bg-gold-400 transition flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
                >
                    <Save className="w-5 h-5" />
                    Save to Family Tree
                </button>
            </form>
            ) : (
                <form onSubmit={handleSubmitLink} className="space-y-8">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg text-sm text-blue-900 leading-relaxed">
                        Link two existing members who are cousins or relatives by marriage. This creates a visual connection in the chart without altering parentage.
                    </div>

                    <div className="space-y-6">
                        <div className="relative z-50">
                          <MemberSelect 
                              label="First Spouse"
                              options={allMembers}
                              value={linkMember1}
                              onChange={setLinkMember1}
                          />
                        </div>
                        <div className="flex justify-center -my-2 relative z-10">
                            <div className="bg-cream-100 p-2 rounded-full border border-cream-200 text-gold-500">
                                <LinkIcon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="relative z-50">
                          <MemberSelect 
                              label="Second Spouse"
                              options={allMembers}
                              value={linkMember2}
                              onChange={setLinkMember2}
                          />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-heritage-900 text-gold-400 py-4 rounded-lg font-bold hover:bg-heritage-800 transition flex items-center justify-center gap-2 shadow-lg"
                    >
                        <LinkIcon className="w-5 h-5" />
                        Create Link
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>

    {/* Edit Cropper Modal */}
    {editIsCropping && editRawPhoto && (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 max-h-[95vh] overflow-y-auto">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Crop Photo</h3>
              <p className="text-xs sm:text-sm text-slate-500">Adjust zoom and position, then save.</p>
            </div>
            <button
              type="button"
              onClick={() => { setEditIsCropping(false); setEditRawPhoto(null); }}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-4 sm:gap-6 items-center">
            <div className="w-full">
              <div className="relative w-full aspect-square max-w-xl mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img
                  src={editRawPhoto}
                  alt="Crop preview"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    transform: `translate(${editCropX}%, ${editCropY}%) scale(${editCropZoom})`,
                    transition: 'transform 120ms ease-out',
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-800">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={editCropZoom}
                  onChange={(e) => setEditCropZoom(parseFloat(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Position X</label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={2}
                  value={editCropX}
                  onChange={(e) => setEditCropX(parseInt(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Position Y</label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={2}
                  value={editCropY}
                  onChange={(e) => setEditCropY(parseInt(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setEditIsCropping(false); setEditRawPhoto(null); setEditCropSaving(false); }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={editCropSaving}
                  onClick={commitEditCrop}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-sky-400 text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-60"
                >
                  {editCropSaving ? 'Saving...' : 'Save Crop'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Cropper Modal */}
    {isCropping && rawPhoto && (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 max-h-[95vh] overflow-y-auto">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Crop Photo</h3>
              <p className="text-xs sm:text-sm text-slate-500">Adjust zoom and position, then save.</p>
            </div>
            <button
              type="button"
              onClick={() => { setIsCropping(false); setRawPhoto(null); }}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-4 sm:gap-6 items-center">
            <div className="w-full">
              <div className="relative w-full aspect-square max-w-xl mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img
                  src={rawPhoto}
                  alt="Crop preview"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    transform: `translate(${cropX}%, ${cropY}%) scale(${cropZoom})`,
                    transition: 'transform 120ms ease-out',
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-800">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Position X</label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={2}
                  value={cropX}
                  onChange={(e) => setCropX(parseInt(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Position Y</label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={2}
                  value={cropY}
                  onChange={(e) => setCropY(parseInt(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsCropping(false); setRawPhoto(null); setCropSaving(false); }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={cropSaving}
                  onClick={commitCrop}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-sky-400 text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-60"
                >
                  {cropSaving ? 'Saving...' : 'Save Crop'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AdminPanel;
