import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaDownload, FaShare } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../services/auth';

function Player({ song, isPlaying, setIsPlaying }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
        recordPlay();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, song]);

  const recordPlay = async () => {
    try {
      await api.post(`/songs/${song.id}/play`);
    } catch (error) {
      console.error('Failed to record play:', error);
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  const handleDownload = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to download songs');
      return;
    }

    try {
      await api.post(`/songs/${song.id}/download`);
      toast.success('Download started!');
    } catch (error) {
      toast.error('Failed to download song');
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/song/${song.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="player">
      <audio
        ref={audioRef}
        src={song.file_url || '/sample-audio.mp3'}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="player-info">
        <img src={song.cover_url || '/default-cover.jpg'} alt={song.title} className="player-cover" />
        <div className="player-details">
          <div className="player-title">{song.title}</div>
          <div className="player-artist">{song.artist}</div>
        </div>
      </div>

      <div className="player-controls">
        <div className="player-buttons">
          <button className="control-btn">
            <FaStepBackward />
          </button>
          <button className="control-btn play-btn" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button className="control-btn">
            <FaStepForward />
          </button>
        </div>

        <div className="player-progress">
          <span className="time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={(currentTime / duration) * 100 || 0}
            onChange={handleSeek}
            className="progress-bar"
          />
          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-actions">
        <button className="action-btn" onClick={handleDownload}>
          <FaDownload />
        </button>
        <button className="action-btn" onClick={handleShare}>
          <FaShare />
        </button>
        <div className="volume-control">
          <FaVolumeUp />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            className="volume-bar"
          />
        </div>
      </div>
    </div>
  );
}

export default Player;
