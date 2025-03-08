import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import SplashScreen from './components/SplashScreen';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <div className="App">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <ChatInterface />
    </div>
  );
}

export default App;
