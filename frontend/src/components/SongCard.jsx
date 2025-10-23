import React from 'react';
import { FaPlay } from 'react-icons/fa';

function SongCard({ song, onPlay }) {
  return (
    <div className="song-card" onClick={() => onPlay(song)}>
      <div className="song-card-image">
        <img src={song.cover_url || '/default-cover.jpg'} alt={song.title} />
        <div className="song-card-overlay">
          <button className="play-button">
            <FaPlay />
          </button>
        </div>
      </div>
      <div className="song-card-info">
        <h3 className="song-title">{song.title}</h3>
        <p className="song-artist">{song.artist}</p>
        <div className="song-stats">
          <span>{song.plays?.toLocaleString() || 0} plays</span>
        </div>
      </div>
    </div>
  );
}

export default SongCard;
