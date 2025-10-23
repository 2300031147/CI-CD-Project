import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import SongCard from '../components/SongCard';
import { useAuth } from '../services/auth';

function Home({ setCurrentSong, setIsPlaying }) {
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadContent();
  }, [isAuthenticated]);

  const loadContent = async () => {
    try {
      setLoading(true);
      
      // Load trending songs
      const trendingRes = await api.get('/recommendations/trending');
      setTrending(trendingRes.data.songs);

      // Load personalized recommendations if logged in
      if (isAuthenticated) {
        try {
          const recRes = await api.get('/recommendations');
          setRecommendations(recRes.data.songs);
        } catch (error) {
          console.error('Failed to load recommendations:', error);
        }
      }
    } catch (error) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
      <section className="section">
        <h1 className="section-title">Trending Now</h1>
        <div className="song-grid">
          {trending.map((song) => (
            <SongCard key={song.id} song={song} onPlay={handlePlay} />
          ))}
        </div>
      </section>

      {isAuthenticated && recommendations.length > 0 && (
        <section className="section">
          <h2 className="section-title">Recommended for You</h2>
          <p className="section-subtitle">AI-powered recommendations based on your listening history</p>
          <div className="song-grid">
            {recommendations.map((song) => (
              <SongCard key={song.id} song={song} onPlay={handlePlay} />
            ))}
          </div>
        </section>
      )}

      {!isAuthenticated && (
        <section className="section cta-section">
          <h2>Get Personalized Recommendations</h2>
          <p>Sign in to unlock AI-powered music recommendations tailored just for you</p>
        </section>
      )}
    </div>
  );
}

export default Home;
