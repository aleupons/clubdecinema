import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true },
  title: String,
  release_date: String,
  poster: String,
  overview: String,
  tag: { type: mongoose.Schema.Types.ObjectId, ref: 'Tag', required: true },
  en_votacio: { type: Boolean, default: false },
  guanyadora: { type: Boolean, default: false },
  votes: { type: Number, default: 0 }
});

export default mongoose.models.Movie || mongoose.model('Movie', MovieSchema);