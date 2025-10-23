import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaUserPlus, FaUserMinus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import SongCard from '../components/SongCard';
import { useAuth } from '../services/auth';

function Artist({ setCurrentSong, setIsPlaying }) {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadArtist();
  }, [id]);

  const loadArtist = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/artists/${id}`);
      setArtist(response.data);
    } catch (error) {
      toast.error('Failed to load artist');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow artists');
      return;
    }

    try {
      if (isFollowing) {
        await api.delete(`/artists/${id}/follow`);
        toast.success('Unfollowed artist');
        setIsFollowing(false);
      } else {
        await api.post(`/artists/${id}/follow`);
        toast.success('Following artist');
        setIsFollowing(true);
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  const handlePlay = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!artist) {
    return <div className="error">Artist not found</div>;
  }

  return (
    <div className="artist-page">
      <div className="artist-header">
        <img src={artist.image_url || '/default-artist.jpg'} alt={artist.name} className="artist-image" />
        <div className="artist-info">
          <h1>{artist.name}</h1>
          <p className="artist-genre">{artist.genre}</p>
          <p className="artist-followers">{artist.followers?.toLocaleString()} followers</p>
          {artist.bio && <p className="artist-bio">{artist.bio}</p>}
          {isAuthenticated && (
            <button onClick={handleFollow} className="follow-btn">
              {isFollowing ? (
                <>
                  <FaUserMinus /> Unfollow
                </>
              ) : (
                <>
                  <FaUserPlus /> Follow
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">Popular Tracks</h2>
        <div className="song-grid">
          {artist.songs?.map((song) => (
            <SongCard key={song.id} song={song} onPlay={handlePlay} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Artist;
