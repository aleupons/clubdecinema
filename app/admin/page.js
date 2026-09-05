import { connectDB } from '@/lib/mongodb';
import Movie from '@/models/Movie';
import Tag from '@/models/Tag';
import History from '@/models/History';
import Setting from '@/models/Setting';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import AdminRepository from '@/components/AdminRepository';
import LiveSearch from '@/components/LiveSearch';
import Navbar from '@/components/Navbar';
import VotingControls from '@/components/VotingControls';
import TagManager from '@/components/TagManager';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await connectDB();
  const rawTags = await Tag.find().lean();
  const tags = rawTags.map(t => ({ _id: t._id.toString(), name: t.name })).sort((a, b) => a.name.localeCompare(b.name));
  const tagsMap = new Map(tags.map(t => [t._id, t]));
  const tagsNameMap = new Map(tags.map(t => [t.name, t]));

  const rawMovies = await Movie.find().lean();
  const movies = rawMovies.map(m => {
    let resolvedTag = null;
    if (m.tag) {
      const tagStr = m.tag.toString();
      if (tagsMap.has(tagStr)) resolvedTag = tagsMap.get(tagStr);
      else if (tagsNameMap.has(tagStr)) resolvedTag = tagsNameMap.get(tagStr);
      else resolvedTag = { _id: tagStr, name: tagStr };
    }
    return { ...m, _id: m._id.toString(), tag: resolvedTag };
  });

  const activeMoviesCount = movies.filter(m => m.en_votacio).length;
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
        poster: movie.poster
      };
    }
  });

  const historyWithDetails = historyRecords.map(record => ({
    ...record,
    movies: record.movies.map(m => ({
      ...m,
      title: movieMap[String(m.tmdbId)]?.title || `Pel·lícula no trobada (ID: ${m.tmdbId})`,
      poster: movieMap[String(m.tmdbId)]?.poster || null
    }))
  }));

  const setting = await Setting.findOne({ key: 'voting_closed' });
  const votingClosed = setting ? setting.value : false;

  const mesos = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];
  const anys = [2026, 2027, 2028, 2029, 2030];
  const numPelisVotacio = 10;

  async function canviarTag(formData) {
    'use server'
    const id = formData.get('id');
    const tagId = formData.get('tagId');
    await connectDB();
    await Movie.findByIdAndUpdate(id, { tag: tagId });
    revalidatePath('/admin');
    revalidatePath('/');
  }

  async function toggleVotacio(formData) {
    'use server'
    const id = formData.get('id');
    await connectDB();
    const movie = await Movie.findById(id);
    if (!movie) return;

    if (!movie.en_votacio) {
      const count = await Movie.countDocuments({ en_votacio: true });
      if (count >= numPelisVotacio) return;
    }

    movie.en_votacio = !movie.en_votacio;
    if (!movie.en_votacio) {
      movie.votes = 0;
    }
    await movie.save();
    revalidatePath('/admin');
    revalidatePath('/');
  }

  async function eliminarPeli(formData) {
    'use server'
    const id = formData.get('id');
    await connectDB();
    await Movie.findByIdAndDelete(id);
    revalidatePath('/admin');
    revalidatePath('/');
  }

  async function afegirTag(formData) {
    'use server'
    const name = formData.get('name');
    if (!name) return;
    await connectDB();
    await Tag.create({ name });
    revalidatePath('/admin');
    revalidatePath('/');
  }

  async function eliminarTag(formData) {
    'use server'
    const id = formData.get('id');
    await connectDB();
    await Tag.findByIdAndDelete(id);
    revalidatePath('/admin');
    revalidatePath('/');
  }

  async function tancarRonda() {
    'use server'    
    await connectDB();

    const active = await Movie.find({ en_votacio: true }).lean();
    if (active.length === 0) {
      return { success: false, message: 'No hi ha pel·lícules en votació per poder tancar-la.' };
    }

    const maxVotes = Math.max(...active.map(m => m.votes));

    await Movie.updateMany({ en_votacio: true }, { $set: { guanyadora: false } });
    if (maxVotes > 0) {
      await Movie.findOneAndUpdate(
        { en_votacio: true, votes: maxVotes },
        { $set: { guanyadora: true } }
      );
    }

    await Setting.findOneAndUpdate({ key: 'voting_closed' }, { value: true }, { upsert: true });

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, message: 'Votació tancada correctament i pel·lícula guanyadora assignada!' };
  }

  async function reobrirRonda() {
    'use server'
    await connectDB();

    await Movie.updateMany({ en_votacio: true }, { $set: { guanyadora: false } });
    await Setting.findOneAndUpdate({ key: 'voting_closed' }, { value: false }, { upsert: true });

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, message: 'Votació reoberta correctament. Els usuaris ja poden tornar a votar.' };
  }

  async function resetejarVotacio(formData) {
    'use server'
    const mes = formData.get('mes');
    const any = formData.get('any');
    const roundName = `${mes} ${any}`;

    const cStore = await cookies();
    await connectDB();

    const active = await Movie.find({ en_votacio: true }).lean();
    if (active.length !== numPelisVotacio) {
      return { success: false, message: `Cal tenir exactament ${numPelisVotacio} pel·lícules en votació per guardar l'històric.` };
    }

    const existent = await History.findOne({ roundName });
    if (existent) {
      return { success: false, message: `Ja existeix un històric registrat per a ${roundName}.` };
    }

    const maxVotes = Math.max(...active.map(m => m.votes));

    await Movie.updateMany({ en_votacio: true }, { $set: { guanyadora: false } });
    if (maxVotes > 0) {
      await Movie.findOneAndUpdate(
        { en_votacio: true, votes: maxVotes },
        { $set: { guanyadora: true } }
      );
    }

    await History.create({
      roundName,
      movies: active.map(m => ({
        tmdbId: m.tmdbId,
        votes: m.votes,
        guanyadora: m.votes > 0 && m.votes === maxVotes
      }))
    });
    
    await Movie.updateMany({ en_votacio: true }, { $set: { en_votacio: false, votes: 0 } });
    await Setting.findOneAndUpdate({ key: 'voting_closed' }, { value: false }, { upsert: true });
    cStore.delete('voted_movie_id');

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, message: `Històric de ${roundName} desat i votació resetejada amb èxit!` };
  }

  async function afegirDesDeAdmin(formData) {
    'use server'
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
    
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar page={"admin"} />
      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        
        <header className="text-center space-y-2 pt-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Panell d'administració</h1>
          <p className="text-slate-400">Gestiona les pel·lícules, categories i votacions</p>
        </header>

        <section id="admin-afegir" className="space-y-6 scroll-mt-24">
          <h2 className="text-2xl font-bold border-b border-slate-800 pb-3">
            🎞️ <span>Afegir pel·lícules i categories</span>
          </h2> 

          <div className="flex flex-col gap-6">
            <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-lg flex flex-col">
              <h4 className="text-sm font-bold text-slate-200 mb-4">Cercador TMDB per afegir pel·lícules al repositori</h4>
              <div className="flex-1">
                <LiveSearch onAddMovie={afegirDesDeAdmin} tags={tags} existingMovies={movies} />
              </div>
            </div>

            <TagManager tags={tags} afegirTag={afegirTag} eliminarTag={eliminarTag} />
          </div>
        </section>

        <section id="admin-active" className="scroll-mt-24">
          <VotingControls 
            activeMoviesCount={activeMoviesCount}
            numPelisVotacio={numPelisVotacio}
            votingClosed={votingClosed}
            mesos={mesos}
            anys={anys}
            tancarRonda={tancarRonda}
            reobrirRonda={reobrirRonda}
            resetejarVotacio={resetejarVotacio}
          />
        </section>

        <section id="admin-repo" className="scroll-mt-24">
          <AdminRepository 
            movies={movies} 
            tags={tags} 
            activeMoviesCount={activeMoviesCount} 
            toggleVotacio={toggleVotacio} 
            eliminarPeli={eliminarPeli} 
            canviarTag={canviarTag}
            historyRecords={historyWithDetails}
            numPelisVotacio={numPelisVotacio}
          />
        </section>

        <section id="admin-history" className="space-y-6 scroll-mt-24">
          <h2 className="text-2xl font-bold border-b border-slate-800 pb-3">
            🕒 <span>Històric de votacions</span>
          </h2>

          {historyRecords.length === 0 ? (
            <p className="text-slate-500 text-sm">Encara no hi ha rondes registrades.</p>
          ) : (
            <div className="space-y-4">
              {historyWithDetails.map((record) => (
                <details key={record._id} className="bg-slate-800 border border-slate-700/80 rounded-xl p-5 shadow-lg group">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <h3 className="font-bold text-lg text-indigo-300">{record.roundName}</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400">{new Date(record.createdAt).toLocaleDateString()}</span>
                      <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                    </div>
                  </summary>
                  
                  <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-2 border-t border-slate-700/50">
                    {record.movies.map((m, idx) => (
                      <a 
                        key={idx} 
                        href={`https://www.themoviedb.org/movie/${m.tmdbId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`relative bg-slate-900 border rounded-xl p-3 flex gap-3 items-center ${m.guanyadora ? 'border-amber-500/50' : 'border-slate-700/50'} transition cursor-pointer group`}
                      >
                        <span className="absolute top-3 right-3 text-[10px]">↗</span>       
                        {m.poster ? (
                          <img src={`https://image.tmdb.org/t/p/w92${m.poster}`} alt={m.title} className="w-10 h-14 object-cover rounded shadow" />
                        ) : <div className="w-10 h-14 bg-slate-800 rounded" />}
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs truncate text-slate-200">{m.title}</h4>
                          <p className="text-[10px] text-emerald-400 mt-0.5">⭐ {m.votes} vots</p>
                          {m.guanyadora && <p className="text-[10px] font-bold text-amber-400 mt-0.5">🏆 Guanyadora</p>}
                        </div>       
                      </a>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}