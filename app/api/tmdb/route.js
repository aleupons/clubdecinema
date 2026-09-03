import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  if (!query) return NextResponse.json({ results: [] });

  try {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=ca-ES`);
    const data = await res.json();
    return NextResponse.json({ results: data.results || [] });
  } catch (error) {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}