'use client';
import { useState, useTransition } from 'react';

export default function AdminRepository({ movies, tags, activeMoviesCount, toggleVotacio, eliminarPeli, canviarTag, historyRecords = [], numPelisVotacio = 10 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterWinner, setFilterWinner] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [isPending, startTransition] = useTransition();

  const movieVotesMap = {};
  const winningTmdbIds = new Set();
  historyRecords.forEach(record => {
    record.movies.forEach(m => {
      movieVotesMap[m.tmdbId] = (movieVotesMap[m.tmdbId] || 0) + (m.votes || 0);
      if (m.guanyadora) winningTmdbIds.add(m.tmdbId);
    });
  });

  const filteredMovies = movies.filter(movie => {
    const matchSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTag = filterTag ? (movie.tag?._id === filterTag || movie.tag === filterTag) : true;
    const guanyadora = winningTmdbIds.has(movie.tmdbId);
    const matchWinner = filterWinner === 'all' ? true : filterWinner === 'winner' ? guanyadora : !guanyadora;
    return matchSearch && matchTag && matchWinner;
  });

  const groupedMovies = {};
  tags.forEach(t => {
    groupedMovies[t.name] = [];
  });
  groupedMovies['Sense Categoria'] = [];

  filteredMovies.forEach(movie => {
    const tagName = movie.tag?.name || 'Sense Categoria';
    if (!groupedMovies[tagName]) groupedMovies[tagName] = [];
    groupedMovies[tagName].push(movie);
  });

  Object.keys(groupedMovies).forEach(tagName => {
    groupedMovies[tagName].sort((a, b) => {
      const votesA = movieVotesMap[a.tmdbId] || 0;
      const votesB = movieVotesMap[b.tmdbId] || 0;

      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'votes-desc') {
        if (votesB !== votesA) return votesB - votesA;
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'votes-asc') {
        if (votesA !== votesB) return votesA - votesB;
        return a.title.localeCompare(b.title);
      }

      return a.title.localeCompare(b.title);
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex flex-wrap gap-2 w-full">
          <div className="relative flex-1 md:w-48">
            <input 
              type="text" 
              placeholder="Cercar pel·lícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full"
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
            onChange={(e) => setFilterTag(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">Totes les categories</option>
            {tags.map(tag => <option key={tag._id} value={tag._id}>{tag.name}</option>)}
          </select>
          <select 
            value={filterWinner} 
            onChange={(e) => setFilterWinner(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">Totes</option>
            <option value="winner">🏆 Guanyadores</option>
            <option value="nowinner">No guanyadores</option>
          </select>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs text-slate-400 font-medium">Ordenar:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="title">Alfabètic (A-Z)</option>
              <option value="votes-desc">Més vots</option>
              <option value="votes-asc">Menys vots</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedMovies).map(([tagName, moviesList]) => {
          if (moviesList.length === 0) return null;
          return (
            <details open key={tagName} className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 group">
              <summary className="font-bold text-sm text-slate-300 uppercase tracking-wider cursor-pointer list-none flex justify-between items-center">
                <span>{tagName} <span className="text-indigo-400 normal-case font-medium ml-2">({moviesList.length})</span></span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700/50">
                {moviesList.map(movie => {
                  const guanyadora = winningTmdbIds.has(movie.tmdbId);
                  const accumulatedVotes = movieVotesMap[movie.tmdbId] || 0;
                  const anyPeli = movie.release_date ? new Date(movie.release_date).getFullYear() : (movie.year || '');
                  
                  return (
                    <div key={movie._id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md">
                      <div className="flex gap-3 items-start">
                        {movie.poster ? (
                          <img src={`https://image.tmdb.org/t/p/w92${movie.poster}`} alt={movie.title} className="w-14 h-20 object-cover rounded shadow flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-20 bg-slate-700 rounded flex items-center justify-center text-[9px] text-slate-400 flex-shrink-0">Sense imatge</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-bold text-sm text-slate-100 truncate" title={movie.title}>{movie.title}</h4>
                            <a 
                              href={`https://www.themoviedb.org/movie/${movie.tmdbId}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/30 flex-shrink-0"
                              title="Veure a TMDB"
                            >
                              TMDB ↗
                            </a>
                          </div>
                          {anyPeli && <p className="text-[11px] text-slate-400 mt-0.5">{anyPeli}</p>}
                          <p className="text-[11px] text-emerald-400 mt-0.5 font-medium">⭐ {accumulatedVotes} vots</p>
                          {guanyadora && <span className="inline-block mt-1 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-semibold">🏆 Guanyadora</span>}                          
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-700/50">
                        <form action={canviarTag} className="flex gap-2 items-center">
                          <input type="hidden" name="id" value={movie._id} />
                          <select 
                            name="tagId" 
                            defaultValue={movie.tag?._id || ''}
                            onChange={(e) => {
                              const form = e.target.form;
                              startTransition(() => {
                                form.requestSubmit();
                              });
                            }}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 flex-1 cursor-pointer"
                          >
                            {tags.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                          </select>
                        </form>

                        <div className="flex gap-2">
                          <form action={toggleVotacio} className="flex-1">
                            <input type="hidden" name="id" value={movie._id} />
                            <button 
                              type="submit" 
                              disabled={!movie.en_votacio && activeMoviesCount >= numPelisVotacio}
                              className={`w-full py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${movie.en_votacio ? 'bg-amber-600 hover:bg-amber-500 text-white' : activeMoviesCount >= numPelisVotacio ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                            >
                              {movie.en_votacio ? 'Treure de votació' + (movie.votes > 0 ? ` (${movie.votes})` : '') : 'Posar en votació'}
                            </button>
                          </form>

                          <form action={eliminarPeli}>
                            <input type="hidden" name="id" value={movie._id} />
                            <button type="submit" className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer" title="Eliminar pel·lícula">
                              🗑️
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
        {filteredMovies.length === 0 && (
          <p className="text-center text-slate-400 py-8">No s'ha trobat cap pel·lícula.</p>
        )}
      </div>
    </div>
  );
}