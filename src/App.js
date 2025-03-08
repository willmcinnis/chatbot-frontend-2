import React, { useState } from 'react';
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
      <ChatInterface />
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
    </div>
  );
}

export default App;
