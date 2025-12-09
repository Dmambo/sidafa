
import React from 'react';
import { ChevronRight, TreeDeciduous, Image as ImageIcon } from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: any) => void;
  language?: 'en' | 'fr';
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, language = 'en' }) => {
  const isEn = language === 'en';
  return (
    <div className="w-full h-full overflow-y-auto">
      
      {/* Hero Section */}
      <section 
        className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(120deg, rgba(255,255,255,0.8), rgba(255,255,255,0.35)), url('/house.jpeg')" }}
      >
        <div className="absolute inset-0 pattern-grid opacity-30"></div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-teal-200/50 blur-3xl"></div>
        <div className="absolute right-4 top-10 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-sky-100/70 blur-3xl"></div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <div className="pill-accent inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm uppercase tracking-[0.2em] text-slate-700">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-teal-500 animate-pulse"></span>
            Est. 1930 — The Sano Lineage
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-slate-900 leading-tight drop-shadow px-2">
            {isEn ? 'The Legacy of ' : "L'héritage de "}
            <span className="text-teal-600 font-serif-italic">Sidafa Sano</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
            {isEn
              ? 'A visual journey through generations. From humble beginnings to a flourishing family tree, explore the roots that connect us all.'
              : 'Un voyage visuel à travers les générations. Des débuts modestes à une lignée florissante, découvrez les racines qui nous unissent.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
            <button 
              onClick={() => onNavigate('tree')}
              className="glow-button px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-teal-400 to-sky-300 hover:to-sky-200 text-slate-900 text-sm sm:text-base font-semibold rounded-xl transition-all transform hover:scale-[1.02] shadow-xl shadow-teal-200/60 flex items-center justify-center gap-2"
            >
              <TreeDeciduous className="w-4 h-4 sm:w-5 sm:h-5" />
              {isEn ? 'Explore the Tree' : "Explorer l'arbre"}
            </button>
            <button 
              onClick={() => onNavigate('gallery')}
              className="px-6 sm:px-8 py-3 sm:py-4 border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm sm:text-base font-semibold rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              {isEn ? 'View Gallery' : 'Voir la galerie'}
            </button>
          </div>
        </div>
      </section>

      {/* Narrative Section 1 */}
      <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-8 sm:space-y-10">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-center">
          <div className="relative order-2 md:order-1">
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-br from-slate-200/60 via-transparent to-white rounded-2xl sm:rounded-3xl blur-lg"></div>
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl">
              <img 
                src="/sidafa-sano.jpeg" 
                alt="Family gathering" 
                className="relative w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
          <div className="frost-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 sm:space-y-6 order-1 md:order-2">
            <div className="pill-accent w-fit px-3 sm:px-4 py-1.5 sm:py-2 text-xs uppercase tracking-[0.2em] text-slate-800">
              {isEn ? 'Legacy' : 'Héritage'}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-900">
              {isEn ? 'His lineage' : 'Sa lignée'}
            </h2>
            <div className="soft-divider"></div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {isEn
                ? "Every great story begins with a foundation. Sidafa Sano laid the groundwork for a lineage defined by strength, unity, and tradition. Through the decades, the branches have spread, but the roots remain intertwined."
                : "Chaque grande histoire commence par des fondations solides. Sidafa Sano a posé les bases d'une lignée faite de force, d'unité et de tradition. Au fil des décennies, les branches se sont étendues, mais les racines restent enlacées."}
            </p>
            <button 
              onClick={() => onNavigate('tree')}
              className="text-sm sm:text-base text-slate-700 font-semibold hover:text-slate-900 flex items-center gap-2 group"
            >
              {isEn ? 'View his lineage' : 'Voir sa lignée'} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl sm:rounded-3xl mx-2 sm:mx-4 md:mx-10 my-6 sm:my-8 md:my-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-3xl mx-auto relative z-10 py-10 sm:py-12 md:py-16 px-4 sm:px-6">
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-serif-italic text-slate-700 mb-6 sm:mb-8 leading-snug">
            {isEn
              ? '“A family is like a forest, expanding in different directions but growing from the same soil.”'
              : '« Une famille est comme une forêt : elle s’étend dans différentes directions, mais pousse dans le même sol. »'}
          </p>
            <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-widest">
              {isEn ? '— The Sano Legacy' : "— L'héritage Sano"}
            </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-slate-600 py-8 sm:py-10 md:py-12 text-center border-t border-slate-200 rounded-2xl sm:rounded-3xl mx-2 sm:mx-4 md:mx-10 mb-4 sm:mb-6 shadow-2xl px-4">
        <p className="font-serif italic text-base sm:text-lg opacity-90">Preserving our history for future generations.</p>
        <p className="text-xs mt-3 sm:mt-4 opacity-60">© {new Date().getFullYear()} Sidafa Sano Family Tree</p>
      </footer>
    </div>
  );
};

export default HomePage;
