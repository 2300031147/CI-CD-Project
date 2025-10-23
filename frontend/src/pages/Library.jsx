import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import SongCard from '../components/SongCard';

function Library({ setCurrentSong, setIsPlaying }) {
  const [playlists, setPlaylists] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('playlists');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const [playlistsRes, historyRes] = await Promise.all([
        api.get('/playlists'),
        api.get('/users/me/history')
      ]);
      
      setPlaylists(playlistsRes.data.playlists);
      setHistory(historyRes.data.history);
    } catch (error) {
      toast.error('Failed to load library');
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    try {
      await api.post('/playlists', {
        name: newPlaylistName,
        description: '',
        isPublic: false
      });
      
      toast.success('Playlist created!');
      setNewPlaylistName('');
      setShowCreateModal(false);
      loadLibrary();
    } catch (error) {
      toast.error('Failed to create playlist');
    }
  };

  const handlePlay = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <div className="library">
      <div className="library-header">
        <h1>Your Library</h1>
        <button className="create-btn" onClick={() => setShowCreateModal(true)}>
          <FaPlus /> Create Playlist
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('playlists')}
        >
          Playlists
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {activeTab === 'playlists' && (
        <div className="playlists-section">
          {playlists.length === 0 ? (
            <div className="empty-state">
              <p>No playlists yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="playlist-grid">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="playlist-card">
                  <h3>{playlist.name}</h3>
                  <p>{playlist.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-section">
          {history.length === 0 ? (
            <div className="empty-state">
              <p>No listening history yet</p>
            </div>
          ) : (
            <div className="song-grid">
              {history.map((song) => (
                <SongCard key={song.id} song={song} onPlay={handlePlay} />
              ))}
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Playlist</h2>
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="input"
            />
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={createPlaylist} className="btn-primary">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Library;
