import { connectDB } from '@/lib/mongodb';
import Movie from '@/models/Movie';
import { revalidatePath } from 'next/cache';

export default async function Admin() {
  await connectDB();
  const dbMovies = await Movie.find().sort({ title: 1 });

  async function buscarIafegir(formData) {
    'use server'
    const query = formData.get('query');
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}&language=ca-ES`);
    const data = await res.json();
    const peli = data.results[0]; // Agafa el primer resultat per simplicitat
    
    if (peli) {
      await connectDB();
      await Movie.create({
        tmdbId: peli.id,
        title: peli.title,
        poster: peli.poster_path,
        overview: peli.overview,
        status: 'null' // Entra al repositori per defecte
      }).catch(e => console.log('Ja existeix'));
      revalidatePath('/admin');
    }
  }

  async function canviarEstat(formData) {
    'use server'
    const id = formData.get('id');
    const nouEstat = formData.get('estat');
    await connectDB();
    // Si la passem a "en votació", reiniciem els vots a 0 automàticament
    const vots = nouEstat === 'en votació' ? 0 : undefined;
    
    const updateData = { status: nouEstat };
    if (vots !== undefined) updateData.votes = vots;

    await Movie.findByIdAndUpdate(id, updateData);
    revalidatePath('/admin');
    revalidatePath('/');
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Panell d&aposAdministració</h1>
      
      {/* Cercador TMDB */}
      <form action={buscarIafegir} className="mb-8 flex gap-2">
        <input type="text" name="query" placeholder="Cerca a TMDB (ex: Matrix)..." className="border p-2 flex-1 text-black" required />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Afegir al Repositori</button>
      </form>

      {/* Llista del Repositori */}
      <div className="flex flex-col gap-4">
        {dbMovies.map((movie) => (
          <div key={movie._id} className="border p-4 flex justify-between items-center rounded">
            <div>
              <strong>{movie.title}</strong> - Vots: {movie.votes}
            </div>
            <form action={canviarEstat} className="flex gap-2">
              <input type="hidden" name="id" value={movie._id.toString()} />
              <select name="estat" defaultValue={movie.status} className="border p-1 text-black">
                <option value="null">Al calaix (null)</option>
                <option value="en votació">En votació (10 del mes)</option>
                <option value="votades">Ja votades</option>
                <option value="guanyadores">Guanyadores</option>
              </select>
              <button className="bg-gray-200 px-3 py-1 rounded text-black">Guardar</button>
            </form>
          </div>
        ))}
      </div>
    </main>
  );
}