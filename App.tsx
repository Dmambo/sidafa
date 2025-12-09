
import React, { useState, useCallback, useEffect } from 'react';
import { FamilyMember, ViewMode } from './types';
import { familyApi } from './services/api';
import TreeChart from './components/TreeChart';
import ProfileModal from './components/ProfileModal';
import TimelineView from './components/TimelineView';
import AdminPanel from './components/AdminPanel';
import ManagePanel from './components/ManagePanel';
import HomePage from './components/HomePage';
import Gallery from './components/Gallery';
import { TreeDeciduous, Users, Calendar, Search, PlusCircle, Menu, X, Home, Image as ImageIcon, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [view, setView] = useState<ViewMode>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [showLanguageModal, setShowLanguageModal] = useState(true);

  // Load family tree from database on mount
  useEffect(() => {
    const loadFamilyTree = async () => {
      try {
        const tree = await familyApi.getFamilyTree();
        setData(tree);
      } catch (error) {
        console.error('Failed to load family tree:', error);
        // Fallback to empty root if API fails
        setData({
          id: 'root',
          name: 'Family Root',
          gender: 'male',
          relationship: 'root',
          children: [],
        });
      } finally {
        setLoading(false);
      }
    };
    loadFamilyTree();
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const tree = await familyApi.getFamilyTree();
      setData(tree);
    } catch (error) {
      console.error('Failed to refresh family tree:', error);
    }
  }, []);

  const findMember = useCallback((id: string, node: FamilyMember | null = data): FamilyMember | null => {
    if (!node) return null;
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findMember(id, child);
        if (found) return found;
      }
    }
    return null;
  }, [data]);

  const findParent = useCallback((childId: string, node: FamilyMember | null = data): FamilyMember | null => {
    if (!node) return null;
    if (node.children) {
      for (const child of node.children) {
        if (child.id === childId) return node;
        const found = findParent(childId, child);
        if (found) return found;
      }
    }
    return null;
  }, [data]);

  const handleAddMember = useCallback(async (parentId: string, newMember: FamilyMember, shouldLinkSpouse: boolean = false) => {
    try {
      await familyApi.addMember(parentId, newMember, shouldLinkSpouse);
      await refreshData();
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member. Please try again.');
    }
  }, [refreshData]);

  const handleLinkMembers = useCallback(async (memberId1: string, memberId2: string) => {
    try {
      await familyApi.linkMembers(memberId1, memberId2);
      await refreshData();
    } catch (error) {
      console.error('Failed to link members:', error);
      alert('Failed to link members. Please try again.');
    }
  }, [refreshData]);

  const handleDeleteMember = useCallback(async (memberId: string) => {
    try {
      await familyApi.deleteMember(memberId);
      await refreshData();
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert('Failed to delete member. Please try again.');
    }
  }, [refreshData]);

  const handleUnlinkMembers = useCallback(async (id1: string, id2: string) => {
    try {
      await familyApi.unlinkMembers(id1, id2);
      await refreshData();
    } catch (error) {
      console.error('Failed to unlink members:', error);
      alert('Failed to unlink members. Please try again.');
    }
  }, [refreshData]);

  const handleUpdateMember = useCallback(async (memberId: string, updates: Partial<FamilyMember>) => {
    try {
      await familyApi.updateMember(memberId, updates);
      await refreshData();
    } catch (error) {
      console.error('Failed to update member:', error);
      alert('Failed to update member. Please try again.');
    }
  }, [refreshData]);

  const searchResults = useCallback(() => {
     if (!searchQuery || !data) return [];
     const results: FamilyMember[] = [];
     const traverse = (node: FamilyMember) => {
         if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
             results.push(node);
         }
         if (node.children) node.children.forEach(traverse);
     };
     traverse(data);
     return results;
  }, [data, searchQuery]);

  const getSpouses = (member: FamilyMember | null): FamilyMember[] => {
      if (!member) return [];
      const foundSpouses: FamilyMember[] = [];
      if (member.spouseId) {
          const s = findMember(member.spouseId);
          if (s) foundSpouses.push(s);
      }
      if (member.relationship === 'root' && member.children) {
          const wives = member.children.filter(c => c.relationship === 'spouse');
          foundSpouses.push(...wives);
      }
      if (member.relationship === 'spouse') {
          const parent = findParent(member.id);
          if (parent && !foundSpouses.find(s => s.id === parent.id)) {
              foundSpouses.push(parent);
          }
      }
      return foundSpouses;
  };

  const selectedMemberSpouses = getSpouses(selectedMember);

  const navItems = [
    { key: 'home', label: language === 'en' ? 'Home' : 'Accueil', icon: <Home className="w-4 h-4" /> },
    { key: 'tree', label: language === 'en' ? 'Family Tree' : 'Arbre familial', icon: <Users className="w-4 h-4" /> },
    { key: 'gallery', label: language === 'en' ? 'Gallery' : 'Galerie', icon: <ImageIcon className="w-4 h-4" /> },
    { key: 'timeline', label: language === 'en' ? 'Timeline' : 'Chronologie', icon: <Calendar className="w-4 h-4" /> },
    { key: 'admin', label: language === 'en' ? 'Admin' : 'Admin', icon: <PlusCircle className="w-4 h-4" /> },
    { key: 'manage', label: language === 'en' ? 'Manage' : 'Gérer', icon: <Settings className="w-4 h-4" /> },
  ];

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#f5f6f8] to-[#e5e7eb]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading family tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-[#f5f6f8] to-[#e5e7eb] text-slate-900 overflow-hidden relative">
      <div className="absolute inset-0 pattern-grid opacity-60 pointer-events-none"></div>
      <div className="floating-orb -left-24 -top-24 w-72 h-72 bg-slate-300/50 rounded-full"></div>
      <div className="floating-orb right-10 bottom-0 w-96 h-96 bg-teal-200/50 rounded-full"></div>
      <div className="floating-orb left-1/2 top-1/3 w-72 h-72 bg-white/60 rounded-full"></div>

      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-200/70 border border-slate-300">
                <TreeDeciduous className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
              </div>
              <div className="hidden xs:block">
                <p className="font-serif text-base sm:text-lg font-bold text-slate-900 leading-none">Sidafa Sano</p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.24em] text-slate-500">Family Legacy</p>
              </div>
            </div>

            <button
              className="md:hidden ml-auto p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 ml-4 lg:ml-6 flex-1 flex-wrap">
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => setView(item.key as ViewMode)}
                  className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-semibold flex items-center gap-1.5 lg:gap-2 transition-all border ${
                    view === item.key
                      ? 'bg-gradient-to-r from-teal-400 to-sky-300 text-slate-900 border-transparent shadow-lg shadow-teal-200/60'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                  className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-full border border-slate-200 text-xs lg:text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {language === 'en' ? 'EN' : 'FR'}
                </button>
              </div>
            </nav>

            <div className="hidden lg:flex items-center w-48 xl:w-64">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search family..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setView('search'); }}
                  className="w-full bg-white border border-slate-200 text-sm text-slate-800 rounded-full pl-10 pr-3 py-2 outline-none placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-3 sm:px-4 pb-4 shadow-md">
            <div className="flex flex-col gap-2 pt-4">
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => { setView(item.key as ViewMode); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border ${
                    view === item.key
                      ? 'bg-gradient-to-r from-slate-200 to-slate-100 text-slate-900 border-slate-200'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              <div className="relative w-full">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search family..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setView('search'); }}
                  className="w-full bg-white border border-slate-200 text-sm text-slate-800 rounded-lg pl-10 pr-3 py-2.5 outline-none placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => { setLanguage(language === 'en' ? 'fr' : 'en'); setMobileMenuOpen(false); }}
                  className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 flex-1 text-center"
                >
                  {language === 'en' ? 'EN' : 'FR'}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_30%,rgba(82,196,183,0.2),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(148,163,184,0.16),transparent_50%)]"></div>
        <div className="h-full overflow-y-auto custom-scrollbar relative z-10 p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            
      {view === 'home' && <HomePage onNavigate={setView} language={language} />}

            {view === 'tree' && (
                <div className="h-full flex flex-col gap-3 sm:gap-4">
                    <div className="frost-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border-0 shadow-2xl">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">Family Tree</h2>
                        <p className="text-sm sm:text-base text-slate-600 font-sans">Explore the branches of the Sidafa Sano lineage.</p>
                    </div>
                    <div className="flex-1 bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200/70 p-1 sm:p-2 overflow-hidden">
                        <TreeChart data={data} onNodeClick={setSelectedMember} />
                    </div>
                </div>
            )}
            
            {view === 'gallery' && <Gallery data={data} onAddPhoto={() => setView('admin')} />}

            {view === 'timeline' && <TimelineView data={data} />}

            {view === 'admin' && (
                <div className="p-0 sm:p-4 md:p-6 lg:p-8">
                     <h2 className="text-2xl sm:text-3xl font-serif font-bold text-heritage-900 mb-4 sm:mb-6 text-center px-4 sm:px-0">Admin Panel</h2>
                    <AdminPanel 
                        data={data} 
                        onAddMember={handleAddMember} 
                        onLinkMembers={handleLinkMembers}
                        onUpdateMember={handleUpdateMember}
                    />
                </div>
            )}
            
            {view === 'manage' && (
                <div className="p-0 sm:p-4 md:p-6 lg:p-8 h-full flex flex-col">
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-heritage-900 mb-4 sm:mb-6 text-center px-4 sm:px-0">Manage Records</h2>
                    <div className="flex-1 overflow-hidden">
                        <ManagePanel 
                            data={data}
                            onDeleteMember={handleDeleteMember}
                            onUnlinkMembers={handleUnlinkMembers}
                        />
                    </div>
                </div>
            )}

            {view === 'search' && (
                 <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-heritage-900 mb-4 sm:mb-6">Search Results</h2>
                    {searchResults().length === 0 ? (
                        <div className="text-center py-8 sm:py-12 bg-white rounded-xl border border-cream-200 px-4">
                             <p className="text-sm sm:text-base text-slate-500">No members found matching "{searchQuery}".</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:gap-4">
                            {searchResults().map(member => (
                                <button 
                                    key={member.id} 
                                    onClick={() => setSelectedMember(member)}
                                    className="w-full text-left bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-cream-200 hover:border-gold-400 hover:shadow-md transition-all flex items-center gap-3 sm:gap-4 group"
                                >
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cream-100 flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-heritage-900 transition-colors flex-shrink-0">
                                        <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="block font-serif font-bold text-base sm:text-lg text-heritage-900 truncate">{member.name}</span>
                                        <span className="text-xs sm:text-sm text-gold-600 font-medium uppercase tracking-wider">{member.birthYear}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                 </div>
            )}
        </div>
      </main>

      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 text-center">
            <h3 className="text-xl sm:text-2xl font-serif text-slate-900">Choose your language</h3>
            <p className="text-slate-600 text-xs sm:text-sm">Select a language to continue / Choisissez une langue pour continuer.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => { setLanguage('en'); setShowLanguageModal(false); }}
                className="flex-1 px-4 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-teal-500 to-sky-400 text-white text-sm sm:text-base font-semibold shadow-md hover:shadow-lg"
              >
                Continue in English
              </button>
              <button
                onClick={() => { setLanguage('fr'); setShowLanguageModal(false); }}
                className="flex-1 px-4 py-2.5 sm:py-3 rounded-lg border border-slate-200 text-slate-800 text-sm sm:text-base font-semibold hover:bg-slate-50"
              >
                Continuer en français
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal 
        member={selectedMember} 
        spouses={selectedMemberSpouses}
        onClose={() => setSelectedMember(null)}
        onSelectMember={setSelectedMember}
      />

    </div>
  );
};

export default App;
