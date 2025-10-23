import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Player from './components/Player';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Artist from './pages/Artist';
import Login from './pages/Login';
import Premium from './pages/Premium';
import { AuthProvider, useAuth } from './services/auth';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppContent() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home setCurrentSong={setCurrentSong} setIsPlaying={setIsPlaying} />} />
          <Route path="/search" element={<Search setCurrentSong={setCurrentSong} setIsPlaying={setIsPlaying} />} />
          <Route path="/library" element={
            <ProtectedRoute>
              <Library setCurrentSong={setCurrentSong} setIsPlaying={setIsPlaying} />
            </ProtectedRoute>
          } />
          <Route path="/artist/:id" element={<Artist setCurrentSong={setCurrentSong} setIsPlaying={setIsPlaying} />} />
          <Route path="/premium" element={<Premium />} />
        </Routes>
      </main>
      {currentSong && (
        <Player 
          song={currentSong} 
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying}
        />
      )}
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
