import { connectDB } from '@/lib/mongodb';
import Movie from '@/models/Movie';
import Tag from '@/models/Tag';
import History from '@/models/History';
import Setting from '@/models/Setting';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import LiveSearch from '@/components/LiveSearch';
import HomeRepository from '@/components/HomeRepository';
import ActiveMoviesList from '@/components/ActiveMoviesList';
import Navbar from '@/components/Navbar';

export default async function Home() {
  await connectDB();
  const rawTags = await Tag.find().lean();
  const tags = rawTags.map(t => ({ _id: t._id.toString(), name: t.name })).sort((a, b) => a.name.localeCompare(b.name));
  const tagsMap = new Map(tags.map(t => [t._id, t]));
  const tagsNameMap = new Map(tags.map(t => [t.name, t]));

  // Comprovar si les votacions estan tancades per l'administrador
  const setting = await Setting.findOne({ key: 'voting_closed' });
  const votingClosed = setting ? setting.value : false;

  const cStore = await cookies();
  const votedMovieId = cStore.get('voted_movie_id')?.value || null;

  const rawActiveMovies = await Movie.find({ en_votacio: true }).lean();
  
  const activeMovies = rawActiveMovies.map(m => {
    let resolvedTag = null;
    if (m.tag) {
      const tagStr = m.tag.toString();
      if (tagsMap.has(tagStr)) resolvedTag = tagsMap.get(tagStr);
      else if (tagsNameMap.has(tagStr)) resolvedTag = tagsNameMap.get(tagStr);
      else resolvedTag = { _id: tagStr, name: tagStr };
    }
    return { ...m, _id: m._id.toString(), tag: resolvedTag };
  });

  const isVotingReady = activeMovies.length === 10;

  const rawRepoMovies = await Movie.find().lean();
  const repoMovies = rawRepoMovies.map(m => {
    let resolvedTag = null;
    if (m.tag) {
      const tagStr = m.tag.toString();
      if (tagsMap.has(tagStr)) resolvedTag = tagsMap.get(tagStr);
      else if (tagsNameMap.has(tagStr)) resolvedTag = tagsNameMap.get(tagStr);
      else resolvedTag = { _id: tagStr, name: tagStr };
    }
    return { ...m, _id: m._id.toString(), tag: resolvedTag };
  });

  const historyRecords = JSON.parse(
      JSON.stringify(await History.find().sort({ createdAt: -1 }).lean())
    );
  
  const rawIds = [];
  historyRecords.forEach(record => {
    record.movies.forEach(m => {
      if (m.tmdbId !== undefined && m.tmdbId !== null) {
        rawIds.push(m.tmdbId);
      }
    });
  });

  const allTmdbIds = [...new Set(rawIds.flatMap(id => [id, String(id), Number(id)]))];
  const moviesData = await Movie.find({ tmdbId: { $in: allTmdbIds } }).lean();

  const movieMap = {};
  moviesData.forEach(movie => {
    if (movie.tmdbId !== undefined && movie.tmdbId !== null) {
      movieMap[String(movie.tmdbId)] = {
        title: movie.title,
        poster: movie.poster,
        release_date: movie.release_date
      };
    }
  });

  const historyWithDetails = historyRecords.map(record => ({
    ...record,
    movies: record.movies.map(m => ({
      ...m,
      title: movieMap[String(m.tmdbId)]?.title || `Pel·lícula no trobada (ID: ${m.tmdbId})`,
      poster: movieMap[String(m.tmdbId)]?.poster || null,
      release_date: movieMap[String(m.tmdbId)]?.release_date || null
    }))
  }));

  async function votar(formData) {
    'use server'
    // Si la votació està tancada, no permetre votar ni canviar vots
    const settingCheck = await Setting.findOne({ key: 'voting_closed' });
    if (settingCheck && settingCheck.value) return;

    const cookieStore = await cookies();
    await connectDB();
    const activeCheck = await Movie.countDocuments({ en_votacio: true });
    if (activeCheck < 10) return; 

    const newId = formData.get('id');
    const oldVotedId = cookieStore.get('voted_movie_id')?.value;

    if (oldVotedId) {
      if (oldVotedId === newId) {
        // Si torna a clicar la mateixa, es retira el vot (unvote)
        await Movie.findByIdAndUpdate(newId, { $inc: { votes: -1 } });
        cookieStore.delete('voted_movie_id');
      } else {
        // Si canvia de vot: resta a l'antiga i suma a la nova
        await Movie.findByIdAndUpdate(oldVotedId, { $inc: { votes: -1 } });
        await Movie.findByIdAndUpdate(newId, { $inc: { votes: 1 } });
        cookieStore.set('voted_movie_id', newId, { maxAge: 60 * 60 * 24 * 30 });
      }
    } else {
      // Primer vot
      await Movie.findByIdAndUpdate(newId, { $inc: { votes: 1 } });
      cookieStore.set('voted_movie_id', newId, { maxAge: 60 * 60 * 24 * 30 });
    }
    
    revalidatePath('/');
  }

  async function afegirDesDeUsuari(formData) {
    'use server'
    const LIMIT = 5;
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    const cookieStore = await cookies();
    const now = Date.now();

    // Llegim els timestamps de les pel·lícules afegides recentment per aquest usuari
    const raw = cookieStore.get('added_movies_log')?.value;
    let timestamps = [];
    if (raw) {
      try {
        timestamps = JSON.parse(raw);
      } catch {
        timestamps = [];
      }
    }

    // Ens quedem només amb els de l'última setmana
    const recentTimestamps = timestamps.filter(t => now - t < WEEK_MS);

    if (recentTimestamps.length >= LIMIT) {
      return { success: false, error: `Has arribat al límit de ${LIMIT} pel·lícules afegides aquesta setmana. Torna-ho a provar més endavant.` };
    }

    const tmdbId = Number(formData.get('tmdbId'));
    const title = formData.get('title');
    const poster = formData.get('poster');
    const overview = formData.get('overview');
    const release_date = formData.get('release_date') || '';
    let tagId = formData.get('tagId');

    await connectDB();
    const existent = await Movie.findOne({ tmdbId });
    if (existent) {
      return { success: false, error: 'Aquesta pel·lícula ja existeix al repositori!' };
    }

    await Movie.create({
      tmdbId,
      title,
      poster,
      overview,
      release_date,
      tag: tagId,
      en_votacio: false,
      votes: 0
    });

    // Registrem aquest afegit i guardem la cookie actualitzada
    recentTimestamps.push(now);
    cookieStore.set('added_movies_log', JSON.stringify(recentTimestamps), { maxAge: 60 * 60 * 24 * 30 });
    
    revalidatePath('/');
    return { success: true };
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        
        <header className="text-center space-y-2 pt-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Votacions i propostes</h1>
          <p className="text-slate-400">Vota la pel·lícula que vols veure aquest mes i proposa'n de noves</p>
        </header>

        <section id="search-section" className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 space-y-3 scroll-mt-24">
          <h3 className="text-sm font-semibold text-slate-300">Proposa una pel·lícula nova</h3>
          <LiveSearch onAddMovie={afegirDesDeUsuari} tags={tags} existingMovies={[...activeMovies, ...repoMovies]} />
        </section>

        <section id="active-section" className="space-y-6 scroll-mt-24">
          <ActiveMoviesList 
            activeMovies={activeMovies} 
            isVotingReady={isVotingReady} 
            votedMovieId={votedMovieId}
            votar={votar} 
            votingClosed={votingClosed}
          />
        </section>

        <section id="repo-section" className="scroll-mt-24">
          <HomeRepository movies={repoMovies} tags={tags} historyRecords={historyWithDetails} />
        </section>

        <section id="history-section" className="space-y-6 border-slate-800 scroll-mt-24">
          <h2 className="text-2xl font-bold border-b border-slate-800 pb-3">
            🕒 <span>Històric de guanyadores</span>
          </h2>
          {historyRecords.length === 0 ? (
            <p className="text-slate-500 text-sm">Encara no hi ha registres a l'històric.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {historyWithDetails.map((record) => {
                const winner = record.movies.find(m => m.guanyadora) || record.movies[0];
                const anyPeli = winner.release_date ? new Date(winner.release_date).getFullYear() : (winner.year || '');
                return (
                  <a 
                    key={record._id} 
                    href={`https://www.themoviedb.org/movie/${winner.tmdbId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:border-indigo-500 hover:bg-slate-750 hover:shadow-indigo-500/10 hover:shadow-lg transition cursor-pointer group"                    
                  >
                    {winner?.poster ? (
                      <img src={`https://image.tmdb.org/t/p/w92${winner.poster}`} alt={winner.title} className="w-14 h-20 object-cover rounded-lg shadow" />
                    ) : <div className="w-14 h-20 bg-slate-700 rounded-lg" />}
                    <div className="flex-auto">
                      <div className="flex justify-between items-start">
                        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-medium">{record.roundName}</span>
                        <span className="text-[10px]">↗</span>
                      </div>
                      <h4 className="font-bold text-sm mt-1 group-hover:text-indigo-300 transition">{winner?.title} {anyPeli && <span className="text-xs text-slate-400 mt-1">({anyPeli})</span>}</h4>                     
                      <p className="text-xs text-slate-400 mt-1">⭐ {winner?.votes} vots</p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}