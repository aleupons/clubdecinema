import { connectDB } from '@/lib/mongodb';
import Movie from '@/models/Movie';
import { revalidatePath } from 'next/cache';

export default async function Home() {
  await connectDB();
  // Només carreguem les 10 pel·lícules del mes
  const movies = await Movie.find({ status: 'en votació' }).sort({ votes: -1 });

  async function votarPeli(formData) {
    'use server'
    const id = formData.get('id');
    await connectDB();
    await Movie.findByIdAndUpdate(id, { $inc: { votes: 1 } });
    revalidatePath('/'); // Actualitza els vots en temps real
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Votació del Mes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {movies.map((movie) => (
          <div key={movie._id} className="border p-4 rounded-lg flex gap-4">
            <image src={`https://image.tmdb.org/t/p/w200${movie.poster}`} alt={movie.title} className="w-24 h-36 object-cover" />
            <div>
              <h2 className="text-xl font-bold">{movie.title}</h2>
              <p className="text-sm line-clamp-3 my-2">{movie.overview}</p>
              <form action={votarPeli}>
                <input type="hidden" name="id" value={movie._id.toString()} />
                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  Votar ({movie.votes} vots)
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}