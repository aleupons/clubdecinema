'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useFormStatus } from 'react-dom';

function Synopsis({ movieId, overview, expandedIds, toggleExpanded, clampClass, textClass }) {
  const ref = useRef(null);
  const [canExpand, setCanExpand] = useState(false);
  const expanded = !!expandedIds[movieId];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      if (expanded) return; // no remesurar quan no hi ha clamp actiu
      setCanExpand(el.scrollHeight > el.clientHeight + 1);
    };

    const raf = requestAnimationFrame(measure);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }
    window.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [overview, expanded]);

  return (
    <>
      <p ref={ref} className={`${textClass} ${expanded ? '' : clampClass}`}>
        {overview || "Sense sinopsi disponible per aquesta pel·lícula."}
      </p>
      {canExpand && (
        <span
          type="button"
          onClick={() => toggleExpanded(movieId)}
          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold mt-1 cursor-pointer"
        >
          {expanded ? 'Amagar ▲' : 'Llegir-ne més ▼'}
        </span>
      )}
    </>
  );
}

function VoteButton({ isMyVote, votedMovieId, compact }) {
  const { pending } = useFormStatus();

  const text = isMyVote ? 'Retirar vot' : votedMovieId ? 'Canviar vot' : 'Votar';
  const icon = isMyVote ? '✅' : votedMovieId ? '🔄' : '🗳️';

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full text-white font-bold transition shadow-lg flex items-center justify-center gap-2 ${
        compact ? 'text-xs py-1.5 rounded-lg' : 'py-3 rounded-xl'
      } ${
        pending
          ? 'bg-slate-600 cursor-wait'
          : isMyVote
          ? 'bg-emerald-600 hover:bg-red-500 shadow-emerald-900/20 cursor-pointer'
          : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20 cursor-pointer'
      }`}
    >
      {pending && (
        <span className={`border-2 border-white border-t-transparent rounded-full animate-spin ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
      )}
      {pending ? 'Processant...' : <>{icon} {text}</>}
    </button>
  );
}

export default function ActiveMoviesList({ activeMovies, isVotingReady, votedMovieId, votar, votingClosed = false }) {
  const [viewMode, setViewMode] = useState('detailed'); // 'detailed' o 'compact'
  const [expandedIds, setExpandedIds] = useState({});
  
  const toggleExpanded = (id) => setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  const displayedMovies = useMemo(() => {
    if (!votingClosed) return activeMovies;
    return [...activeMovies].sort((a, b) => b.votes - a.votes);
  }, [activeMovies, votingClosed]);

  return (
    <div className="space-y-6">
      {/* Capçalera amb el títol i els botons alineats a la mateixa línia */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-slate-100">
          🗳️ <span>Vota la pel·lícula del mes</span>
        </h2>

        {displayedMovies.length > 0 && isVotingReady && (
          <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                viewMode === 'detailed' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔍 Detall
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                viewMode === 'compact' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ☷ Graella
            </button>
          </div>
        )}
      </div>

      {/* Avisos */}
      {!isVotingReady ? (
        <div className="bg-amber-950/30 border border-amber-600/40 text-amber-300 p-6 rounded-2xl text-center space-y-2 shadow-lg">
          <p className="font-bold text-base">La votació s'obrirà pròximament</p>
          <p className="text-xs text-amber-200/80 max-w-lg mx-auto leading-relaxed">
            L'administrador està preparant la següent ronda de pel·lícules. Mentrestant, pots proposar-ne de noves a dalt.
          </p>
        </div>
      ) : votingClosed ? (
        <div className="bg-red-950/40 border border-red-500/40 text-red-300 p-4 rounded-xl text-sm text-center shadow flex items-center justify-center gap-2">
          <span>🔒</span> La votació s'ha tancat. Gràcies a tots per participar!
        </div>
      ) : (
        votedMovieId && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 p-4 rounded-xl text-sm text-center shadow">
            ✓ El teu vot està registrat. Pots canviar-lo per una altra pel·lícula o tornar a clicar la mateixa per retirar-lo.
          </div>
        )
      )}

      {/* Llistat de pel·lícules adaptat al viewMode */}
      {displayedMovies.length > 0 && isVotingReady && (
        <div className={
          viewMode === 'detailed' 
            ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
            : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
        }>
          {displayedMovies.map(movie => {
            const anyPeli = movie.release_date ? new Date(movie.release_date).getFullYear() : (movie.year || '');
            const isMyVote = movie._id === votedMovieId; // Comprova si és la que has votat

            // ==============================
            // VISTA COMPACTA
            // ==============================
            if (viewMode === 'compact') {
              return (
                <div 
                  key={movie._id} 
                  // 1. Ressaltem tota la fitxa quan es fa hover al botó de votar
                  className={`${
                    isMyVote ? 'border-emerald-500 ring-1 ring-emerald-500/50 shadow-emerald-900/20' : 
                    movie.guanyadora ? 'border-amber-500/50' : 'border-slate-700/50'
                  } p-3 bg-slate-800 border rounded-xl overflow-hidden shadow flex flex-col transition-all duration-300 has-[button:hover]:border-indigo-400 has-[button:hover]:shadow-lg has-[button:hover]:shadow-indigo-500/20 has-[button:hover]:-translate-y-1`}
                >
                  <div className="flex gap-3 items-start">                    
                    {movie.poster ? (
                      <img src={`https://image.tmdb.org/t/p/w92${movie.poster}`} alt={movie.title} className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-14 bg-slate-700 rounded flex items-center justify-center text-[8px] text-slate-400 flex-shrink-0">Sense Img</div>
                    )}                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-wrap text-xs font-bold text-white truncate" title={movie.title}>{movie.title}</h4>
                        <span className="text-nowrap text-[10px] font-bold text-emerald-400">⭐ {movie.votes}</span>
                      </div>
                      <div className="flex items-start justify-between pt-1">
                        <span className="text-[10px] text-slate-400">{anyPeli}</span>                        
                        <a 
                          href={`https://www.themoviedb.org/movie/${movie.tmdbId}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-slate-300 bg-slate-700/50 hover:bg-slate-600 hover:text-white px-1 rounded-md border border-slate-600 transition-colors flex items-center gap-1 uppercase tracking-wide flex-shrink-0"
                          title="Veure a TMDB"
                        >
                          TMDB ↗
                        </a>
                      </div>
                    </div>
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

                  {!votingClosed && (
                    <div className={`mt-auto pt-2 ${isMyVote ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-slate-700/50 bg-slate-800/80'}`}>
                      <form action={votar}>
                        <input type="hidden" name="id" value={movie._id} />
                        <VoteButton isMyVote={isMyVote} votedMovieId={votedMovieId} compact />
                      </form>
                    </div>
                  )}
                </div>
              );
            }

            // ==============================
            // VISTA DETALLADA (Original millorada)
            // ==============================
            return (
              <div 
                key={movie._id} 
                // 1. Ressaltem tota la fitxa quan es fa hover al botó de votar
                className={`${
                  isMyVote ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-900/30' : 
                  movie.guanyadora ? 'border-amber-500/50' : 'border-slate-700/50'
                } bg-slate-800 border rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all duration-300 has-[button:hover]:border-indigo-500 has-[button:hover]:shadow-2xl has-[button:hover]:shadow-indigo-900/30 has-[button:hover]:-translate-y-1`}
              >
                <div className="flex gap-4 p-5">
                  {movie.poster ? (
                    <img src={`https://image.tmdb.org/t/p/w154${movie.poster}`} alt={movie.title} className="w-24 md:w-32 object-cover rounded-xl shadow-md" />
                  ) : (
                    <div className="w-24 md:w-32 bg-slate-700 rounded-xl flex items-center justify-center text-xs text-slate-400">Sense Imatge</div>
                  )}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        {/* Etiqueta Categoria (es queda igual) */}
                        <span className="text-[10px] md:text-xs font-bold bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md border border-indigo-500/30 uppercase tracking-wide truncate">
                          {movie.tag?.name || 'Sense Categoria'}
                        </span>
                        
                        {/* 3. Botó TMDB amb estil totalment diferenciat (gris fosc / neutre que brilla a l'hover) */}
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
                      <h3 className="text-lg md:text-xl font-bold mt-2 text-white leading-tight">{movie.title}</h3>
                      <span className="text-slate-400 font-normal text-sm">{anyPeli}</span>                      
                    </div>
                    {movie.guanyadora && (
                      <span className="inline-block text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium" style={{width:"fit-content"}}>
                        🏆 Guanyadora
                      </span>
                    )}
                    <div className={`mt-4 rounded-xl p-3 border flex justify-between items-center ${isMyVote ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-900/50 border-slate-700/50'}`}>
                      <span className="text-sm font-medium text-slate-300">Vots actuals:</span>
                      <span className="text-2xl font-black text-emerald-400 flex items-center gap-1">⭐ {movie.votes}</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-5 pb-5 flex-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sinopsi</h4>
                  <Synopsis
                    movieId={movie._id}
                    overview={movie.overview}
                    expandedIds={expandedIds}
                    toggleExpanded={toggleExpanded}
                    clampClass="line-clamp-3 md:line-clamp-none"
                    textClass="text-sm text-slate-300 leading-relaxed text-justify"
                  />
                </div>

                {!votingClosed && (
                  <div className={`p-5 border-t ${isMyVote ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-slate-800/80 border-slate-700'}`}>
                    <form action={votar}>
                      <input type="hidden" name="id" value={movie._id} />                      
                      <VoteButton isMyVote={isMyVote} votedMovieId={votedMovieId} />
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}