'use client';
import { useState, useEffect } from 'react';

export default function LiveSearch({ onAddMovie, tags = [], existingMovies = [] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [addedLocal, setAddedLocal] = useState(new Set()); // Per actualitzar a l'instant els ja afegits sense recarregar

  useEffect(() => {
    if (statusMsg.text) {
      const timer = setTimeout(() => {
        setStatusMsg({ text: '', type: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  // 1. Cerca automàtica en escriure
  useEffect(() => {
    const fetchMovies = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        let response = await fetch(`/api/tmdb?q=${encodeURIComponent(query)}`).catch(() => null);
        let data;
        if (response && response.ok) {
          data = await response.json();
        } else {
          const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || 'fb7c43df52fbb6b42b10cae7fc6d6c34'; 
          const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=ca-ES`);
          data = await tmdbRes.json();
        }
        setResults(data.results || data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchMovies, 500); // 500ms d'espera per no saturar TMDB
    return () => clearTimeout(timeoutId);
  }, [query]);

  // 2. Afegir sense tancar els resultats
  const handleAdd = async (e, movie) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    setStatusMsg({ text: 'Afegint...', type: 'info' });
    
    try {
      const res = await onAddMovie(formData);
      if (res?.error) {
        setStatusMsg({ text: `${res.error}`, type: 'error' });
      } else {
        // 3. Avís a sota de l'input
        setStatusMsg({ text: `S'ha afegit "${movie.title}" correctament!`, type: 'success' });
        setAddedLocal(prev => new Set(prev).add(movie.id));
      }
    } catch (err) {
      setStatusMsg({ text: `Error a l'afegir la pel·lícula.`, type: 'error' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text" 
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setStatusMsg({ text: '', type: '' }); // netejar missatge al escriure
              }}
              placeholder="Escriu el títol per cercar automàticament..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 pr-10 shadow-inner"
            />
            {query && (
              <button type="button" onClick={() => {setQuery(''); setResults([]); setStatusMsg({text:'', type:''});}} className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer transition">✕</button>
            )}
          </div>
        </div>
        {statusMsg.text && (
          <div className={`mt-3 p-3 rounded-xl text-xs font-medium border transition-all ${
            statusMsg.type === 'error' 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
              : statusMsg.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
          }`}>
            {statusMsg.text}
          </div>
        )}
      </div>
      
      {loading && <p className="text-slate-400 text-xs px-2 animate-pulse">Cercant a TMDB...</p>}
      
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 max-h-[600px] overflow-y-auto pr-2">
          {results.map(movie => {
            const alreadyExists = addedLocal.has(movie.id) || existingMovies.some(em => em.tmdbId === movie.id);
            return (
              <div key={movie.id} className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex gap-3 shadow-md">
                {movie.poster_path ? (
                   <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt={movie.title} className="w-16 h-24 object-cover rounded shadow" />
                ) : (
                   <div className="w-16 h-24 bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-500 text-center p-1">Sense imatge</div>
                )}
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-slate-200 line-clamp-2" title={movie.title}>{movie.title}</h5>
                    <p className="text-xs text-slate-400 mt-0.5">{movie.release_date ? movie.release_date.split('-')[0] : 'Sense data'}</p>
                  </div>
                  
                  <form onSubmit={(e) => handleAdd(e, movie)} className="mt-2 flex gap-1">
                    <input type="hidden" name="tmdbId" value={movie.id} />
                    <input type="hidden" name="title" value={movie.title} />
                    <input type="hidden" name="release_date" value={movie.release_date} />
                    <input type="hidden" name="poster" value={movie.poster_path || ''} />
                    <input type="hidden" name="overview" value={movie.overview || ''} />
                    
                    {!alreadyExists && (
                      <select name="tagId" className="bg-slate-800 border border-slate-600 rounded-lg text-[10px] px-1 text-slate-300 flex-1 min-w-0 cursor-pointer">
                        {tags.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                      </select>
                    )}
                    
                    {/* Botó que es queda deshabilitat visualment amb text diferent */}
                    <button 
                      type="submit" 
                      disabled={alreadyExists}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold transition flex-1 ${
                        alreadyExists 
                          ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                      }`}
                    >
                      {alreadyExists ? 'Ja afegida' : 'Afegir +'}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}