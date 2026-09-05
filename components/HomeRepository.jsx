'use client';
import { useState, useRef } from 'react';

export default function HomeRepository({ movies = [], tags = [], historyRecords = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('title'); // 'title', 'votes-desc', 'votes-asc'
  const [viewMode, setViewMode] = useState('normal'); // 'normal' o 'compact'

  const [expandedIds, setExpandedIds] = useState({});
  const toggleExpanded = (id) => setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));

  const sectionRef = useRef(null);
  const scrollToSectionTop = () => {
    if (!sectionRef.current) return;
    
    const element = sectionRef.current;
    const rect = element.getBoundingClientRect();
    
    const computedStyles = getComputedStyle(element);
    const scrollMarginPx = parseFloat(computedStyles.scrollMarginTop) || 0;
    
    if (rect.top < scrollMarginPx) {
      element.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  };

  // 1. Creuament segur per ID per calcular vots acumulats i guanyadores de l'històric
  const winningTmdbIds = new Set();
  const voteMap = {};

  historyRecords.forEach(record => {
    record.movies.forEach(m => {
      voteMap[m.tmdbId] = (voteMap[m.tmdbId] || 0) + (m.votes || 0);
      if (m.guanyadora) winningTmdbIds.add(m.tmdbId);
    });
  });

  // Filtrar pel·lícules
  const filteredMovies = movies.filter(movie => {
    const matchSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTag = filterTag ? (movie.tag?._id === filterTag || movie.tag === filterTag) : true;
    return matchSearch && matchTag;
  });

  // 2. Funció d'ordenació (inclou vots acumulats)
  const sortMoviesList = (list) => {
    return [...list].sort((a, b) => {
      const votesA = voteMap[a.tmdbId] || 0;
      const votesB = voteMap[b.tmdbId] || 0;

      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'votes-desc') {
        if (votesB !== votesA) return votesB - votesA;
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'votes-asc') {
        if (votesA !== votesB) return votesA - votesB;
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  };

  const sortedAndFilteredMovies = sortMoviesList(filteredMovies);

  return (
    <div ref={sectionRef} className="space-y-6 scroll-mt-[calc(var(--navbar-height)+0.5rem)]">
      <h2 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-3">
        🎞️ <span>Pel·lícules proposades</span>
      </h2>

      {/* Buscador i filtres en bloc propi */}
      <div className="sticky z-40 top-[var(--navbar-height)] flex flex-col gap-4 bg-slate-800/90 backdrop-blur-md p-4 border border-slate-700 rounded-b-xl shadow-lg shadow-black/60">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex flex-wrap items-center justify-center gap-1 w-full sm:gap-2 sm:flex-auto sm:w-auto sm:flex-shrink-0">
            <div className="relative flex-auto">
              <input 
                type="text" 
                placeholder="Cercar al repositori..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); scrollToSectionTop(); }}
                className="h-8 px-3 w-full text-[10px] sm:text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 pr-8"
              />
              {searchTerm && (
                <button 
                  type="button" 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer transition text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <select 
              value={filterTag} 
              onChange={(e) => { setFilterTag(e.target.value); scrollToSectionTop(); }}
              className="block sm:hidden h-8 px-3 bg-slate-900 border border-slate-700 rounded-xl text-[10px] sm:text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">Totes les categories</option>
              {tags.map(tag => <option key={tag._id} value={tag._id}>{tag.name}</option>)}
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1 w-full sm:w-auto sm:flex-shrink-0">
            {/* Canvi de vista (Normal vs Compacta) */}
            <div className="flex h-8 bg-slate-900 border border-slate-700 rounded-xl p-1">
              <button
                onClick={() => { setViewMode('normal'); scrollToSectionTop(); }}
                className={`px-3 text-[10px] sm:text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'normal' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                ☷ Graella
              </button>
              <button
                onClick={() => { setViewMode('compact'); scrollToSectionTop(); }}
                className={`px-3 text-[10px] sm:text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'compact' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                ☰ Llista
              </button>
            </div>

            {/* Selector d'ordenació */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-slate-400 font-medium">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); scrollToSectionTop(); }}
                className="h-8 px-3 bg-slate-900 border border-slate-700 rounded-xl text-[10px] sm:text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="title">Alfabètic (A-Z)</option>
                <option value="votes-desc">Més vots totals</option>
                <option value="votes-asc">Menys vots totals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botons per a cada categoria / tag */}
        <div className="hidden sm:flex flex-wrap justify-center gap-1.5 pt-4 border-t border-slate-700/60">
          <button
            type="button"
            onClick={() => { setFilterTag(''); scrollToSectionTop(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterTag === '' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            Totes les categories
          </button>
          {tags.map(tag => (
            <button
              key={tag._id}
              type="button"
              onClick={() => { setFilterTag(tag._id); scrollToSectionTop(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filterTag === tag._id 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>        
      </div>

      {/* Llistat de pel·lícules que canvia segons el viewMode */}
      <div className={
        viewMode === 'normal'
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1"
      }>
        {sortedAndFilteredMovies.map(movie => renderMovieCard(movie, winningTmdbIds, voteMap, tags, viewMode, expandedIds, toggleExpanded))}
        {sortedAndFilteredMovies.length === 0 && (
          <p className="col-span-full text-center text-slate-400 py-8">No s'ha trobat cap pel·lícula.</p>
        )}
      </div>
    </div>
  );
}

function getTagName(movie, tags) {
  if (!movie.tag) return null;
  if (typeof movie.tag === 'object' && movie.tag.name) return movie.tag.name;
  const found = tags.find(t => t._id === movie.tag || t._id === movie.tag?._id);
  return found ? found.name : null;
}

function renderMovieCard(movie, winningTmdbIds, voteMap, tags, viewMode, expandedIds, toggleExpanded) {
  const totalVotes = voteMap[movie.tmdbId] || 0;
  const guanyadora = winningTmdbIds.has(movie.tmdbId);
  const anyPeli = movie.release_date ? new Date(movie.release_date).getFullYear() : (movie.year || '');
  const tagName = getTagName(movie, tags);

  // VISTA COMPACTA (Llista petita)
  if (viewMode === 'compact') {
    return (
      <a 
        key={movie._id} 
        href={`https://www.themoviedb.org/movie/${movie.tmdbId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-slate-800 border border-slate-700 rounded-lg p-2 flex items-start justify-between gap-3 shadow-sm hover:border-indigo-500 hover:bg-slate-750 transition cursor-pointer group"
      >
        {movie.poster ? (
          <img src={`https://image.tmdb.org/t/p/w92${movie.poster}`} alt={movie.title} className="w-8 h-8 object-cover rounded-lg shadow-md flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-[9px] text-slate-400 flex-shrink-0 shadow-md">Sense imatge</div>
        )}
        <div className="flex flex-col min-w-0 flex-1">          
          <div className="flex items-center gap-2 overflow-hidden">
            <h4 className="font-bold text-[11px] text-slate-100 truncate group-hover:text-indigo-300 transition" title={movie.title}>{movie.title}</h4>
            {anyPeli && <span className="text-[10px] text-slate-400 flex-shrink-0">{anyPeli}</span>}
            <span className="ms-auto text-[10px]">↗</span>
          </div>
          <div className="flex items-end gap-2 mt-0.5">
             {tagName && <span className="text-[9px] text-slate-500 truncate">{tagName}</span>}
             <div className="flex items-center ms-auto gap-1">
              {movie.en_votacio && (
                <span title="En votació" className="inline-block text-[9px] bg-emerald-500/10 text-emerald-300 px-0.5 py-0 rounded font-medium">
                  🗳️
                </span>
              )}
              {guanyadora && (
                <span title="Guanyadora" className="inline-block text-[9px] bg-amber-500/10 text-amber-300 px-0.5 py-0 rounded font-medium">
                  🏆
                </span>
              )}   
              {totalVotes > 0 && <span title="Total de vots acumulats" className="text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-indigo-400 px-0.5 py-0 rounded font-medium ml-auto">⭐ {totalVotes}</span>}
             </div>
          </div>
        </div>
      </a>
    );
  }

  // VISTA NORMAL (Pòster i fitxa completa)
  return (
    <div 
      key={movie._id}
      className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex gap-3 items-start shadow-sm "
    >
      {movie.poster ? (
        <img src={`https://image.tmdb.org/t/p/w92${movie.poster}`} alt={movie.title} className="w-16 h-24 object-cover rounded-lg shadow-md flex-shrink-0" />
      ) : (
        <div className="w-16 h-24 bg-slate-700 rounded-lg flex items-center justify-center text-[9px] text-slate-400 flex-shrink-0 shadow-md">Sense imatge</div>
      )}
      
      <div className="min-w-0 flex-1 flex flex-col h-full">
        <div className="flex justify-between items-start gap-1">
          <h4 className="font-bold text-wrap text-xs text-slate-100 truncate group-hover:text-indigo-300 transition" title={movie.title}>{movie.title}</h4>
          <a 
            href={`https://www.themoviedb.org/movie/${movie.tmdbId}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[10px] font-bold text-slate-300 bg-slate-700/50 hover:bg-slate-600 hover:text-white px-2 py-1 rounded-md border border-slate-600 transition-colors flex items-center gap-1 uppercase tracking-wide flex-shrink-0"
            title="Veure a TMDB"
          >
            TMDB ↗
          </a>
        </div>
        {anyPeli && <p className="text-[10px] text-slate-400 mt-0.5">{anyPeli}</p>}
        
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {tagName && (
            <span className="inline-block text-[9px] bg-slate-900/50 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-medium">
              {tagName}
            </span>
          )}
          {totalVotes > 0 && (
            <span title="Total de vots acumulats" className="inline-block text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-medium">
              ⭐ {totalVotes} vots
            </span>
          )}
          {movie.en_votacio && (
            <span title="En votació" className="inline-block text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-medium">
              🗳️
            </span>
          )}
          {guanyadora && (
            <span title="Guanyadora" className="inline-block text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">
              🏆
            </span>
          )}          
        </div>

        <span
          type="button"
          onClick={() => toggleExpanded(movie._id)}
          className="w-full text-[10px] text-indigo-300 hover:text-indigo-400 cursor-pointer pt-1"
        >
          {expandedIds[movie._id] ? '▲ Amagar sinopsi' : '▼ Veure sinopsi'}
        </span>
        {expandedIds[movie._id] && (
          <p className="text-[10px] text-slate-300 leading-relaxed pt-2 text-justify">
            {movie.overview || "Sense sinopsi disponible per aquesta pel·lícula."}
          </p>
        )}   
      </div>
    </div>
  );
}