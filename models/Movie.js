import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true },
  title: String,
  poster: String,
  overview: String,
  status: { 
    type: String, 
    enum: ['null', 'en votació', 'votades', 'guanyadores'], 
    default: 'null' 
  },
  votes: { type: Number, default: 0 }
});

export default mongoose.models.Movie || mongoose.model('Movie', MovieSchema);