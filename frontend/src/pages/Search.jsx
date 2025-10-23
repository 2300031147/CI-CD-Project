import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import SongCard from '../components/SongCard';

function Search({ setCurrentSong, setIsPlaying }) {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length > 2) {
      searchContent();
    } else {
      setSongs([]);
      setArtists([]);
    }
  }, [query]);

  const searchContent = async () => {
    try {
      setLoading(true);
      const [songsRes, artistsRes] = await Promise.all([
        api.get(`/songs?search=${query}`),
        api.get(`/artists?search=${query}`)
      ]);
      
      setSongs(songsRes.data.songs);
      setArtists(artistsRes.data.artists);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search</h1>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for songs, artists, albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading && <div className="loading">Searching...</div>}

      {songs.length > 0 && (
        <section className="section">
          <h2 className="section-title">Songs</h2>
          <div className="song-grid">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} onPlay={handlePlay} />
            ))}
          </div>
        </section>
      )}

      {artists.length > 0 && (
        <section className="section">
          <h2 className="section-title">Artists</h2>
          <div className="artist-grid">
            {artists.map((artist) => (
              <div key={artist.id} className="artist-card">
                <img src={artist.image_url || '/default-artist.jpg'} alt={artist.name} />
                <h3>{artist.name}</h3>
                <p>{artist.genre}</p>
                <p>{artist.followers?.toLocaleString()} followers</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && query.length > 2 && songs.length === 0 && artists.length === 0 && (
        <div className="no-results">
          <p>No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}

export default Search;
