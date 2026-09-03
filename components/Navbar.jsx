'use client';
import { useState, useEffect } from 'react';

export default function Navbar({ page }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const isAdmin = page === "admin";
  const isRecurs = page === "recurs";

  useEffect(() => {
    const sections = isAdmin
      ? ['admin-afegir', 'admin-active', 'admin-repo', 'admin-history']
      : !isRecurs
        ? ['search-section', 'active-section', 'repo-section', 'history-section']
        : ['pelicules', 'subtitols', 'informacio', 'llistes'];

    const handleScroll = () => {
      let currentActive = sections[0];

      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            currentActive = id;
          }
        }
      });

      const isAtBottom = window.innerHeight + Math.round(window.scrollY) >= document.body.offsetHeight - 50;
      if (isAtBottom) {
        currentActive = sections[sections.length - 1];
      }

      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdmin, isRecurs]);

  const scrollTo = (id) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getDesktopClass = (id) => `transition-all cursor-pointer px-3 py-1.5 rounded-lg ${
    activeSection === id 
      ? 'text-indigo-300 font-bold bg-indigo-500/10 border border-indigo-500/20' 
      : 'text-slate-300 hover:text-white border border-transparent'
  }`;

  const getMobileClass = (id) => `block w-full text-left py-2.5 px-4 rounded-lg font-medium cursor-pointer transition-all ${
    activeSection === id 
      ? 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/20' 
      : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
  }`;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent cursor-pointer">
            🎬 Club de Cinema
          </a>
          {!isAdmin && (
            <>
              <a href="/admin" className="ml-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer">⚙️</a>
            </>
          )}
        </div>

        {/* --- ESCRIPTORI --- */}
        <div className="hidden md:flex items-center gap-2 text-sm font-medium">
          {isAdmin ? (
            <>
              <button onClick={() => scrollTo('admin-afegir')} className={getDesktopClass('admin-afegir')}>Afegir</button>
              <button onClick={() => scrollTo('admin-active')} className={getDesktopClass('admin-active')}>Votació</button>
              <button onClick={() => scrollTo('admin-repo')} className={getDesktopClass('admin-repo')}>Gestió</button>
              <button onClick={() => scrollTo('admin-history')} className={getDesktopClass('admin-history')}>Històric</button>
            </>
          ) : isRecurs ? (
            <>
              <button onClick={() => scrollTo('pelicules')} className={getDesktopClass('pelicules')}>Pel·lícules</button>
              <button onClick={() => scrollTo('subtitols')} className={getDesktopClass('subtitols')}>Subtítols</button>
              <button onClick={() => scrollTo('informacio')} className={getDesktopClass('informacio')}>Informació</button>
              <button onClick={() => scrollTo('llistes')} className={getDesktopClass('llistes')}>Col·leccions</button>
            </>
          ) : (
            <>
              <button onClick={() => scrollTo('search-section')} className={getDesktopClass('search-section')}>Proposar</button>
              <button onClick={() => scrollTo('active-section')} className={getDesktopClass('active-section')}>Votació</button>
              <button onClick={() => scrollTo('repo-section')} className={getDesktopClass('repo-section')}>Repositori</button>
              <button onClick={() => scrollTo('history-section')} className={getDesktopClass('history-section')}>Històric</button>                    
            </>
          )}
          
          <div className="h-5 w-[1px] bg-slate-700/60 mx-2"></div>

          {/* Botons Fixos / Recursos */}
          <a href="/recursos" className="text-slate-300 hover:text-indigo-300 bg-slate-800/40 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50 transition cursor-pointer">
            📚 Recursos
          </a>
          <a href={process.env.NEXT_PUBLIC_KDRIVE_URI} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-indigo-300 bg-slate-800/40 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50 transition cursor-pointer flex items-center gap-1">
            kDrive ↗
          </a>  
        </div>

        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer">
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* --- MÒBIL --- */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-2 shadow-xl">
          {isAdmin ? (
            <>
              <button onClick={() => scrollTo('admin-afegir')} className={getDesktopClass('admin-afegir')}>Afegir</button>
              <button onClick={() => scrollTo('admin-active')} className={getDesktopClass('admin-active')}>Votació</button>
              <button onClick={() => scrollTo('admin-repo')} className={getDesktopClass('admin-repo')}>Gestió</button>
              <button onClick={() => scrollTo('admin-history')} className={getDesktopClass('admin-history')}>Històric</button>
            </>
          ) : isRecurs ? (
            <>
              <button onClick={() => scrollTo('pelicules')} className={getDesktopClass('pelicules')}>Pel·lícules</button>
              <button onClick={() => scrollTo('subtitols')} className={getDesktopClass('subtitols')}>Subtítols</button>
              <button onClick={() => scrollTo('informacio')} className={getDesktopClass('informacio')}>Informació</button>
              <button onClick={() => scrollTo('llistes')} className={getDesktopClass('llistes')}>Col·leccions</button>
            </>
          ) : (
            <>
              <button onClick={() => scrollTo('search-section')} className={getDesktopClass('search-section')}>Proposar</button>
              <button onClick={() => scrollTo('active-section')} className={getDesktopClass('active-section')}>Votació</button>
              <button onClick={() => scrollTo('repo-section')} className={getDesktopClass('repo-section')}>Repositori</button>
              <button onClick={() => scrollTo('history-section')} className={getDesktopClass('history-section')}>Històric</button>                    
            </>
          )}

          <div className="pt-4 mt-2 border-t border-slate-800 flex flex-col gap-1">
            {/* Botons Fixos / Recursos */}
            <a href="/recursos" className="block text-center bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-lg font-medium transition">
              📚 Recursos
            </a>
            <a href={process.env.NEXT_PUBLIC_KDRIVE_URI} target="_blank" rel="noopener noreferrer" className="block text-center bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-lg font-medium transition">
              kDrive ↗
            </a>  
          </div>
        </div>
      )}
    </nav>
  );
}