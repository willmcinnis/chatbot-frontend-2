import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Create video element
    const videoElement = document.createElement('video');
    videoElement.src = '/Lisa.mp4'; // Use the Lisa.mp4 video
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.style.objectFit = 'cover';
    videoElement.style.position = 'absolute';
    videoElement.style.top = 0;
    videoElement.style.left = 0;
    
    // Listen for the end of the video
    videoElement.addEventListener('ended', () => {
      setIsVisible(false);
      if (onComplete) onComplete();
    });
    
    // Fallback in case video doesn't load or play
    const timeoutId = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 6000); // 6 second fallback timeout
    
    // Add video to container
    const container = document.getElementById('splash-container');
    if (container) {
      container.appendChild(videoElement);
    }
    
    // Cleanup function
    return () => {
      if (container && container.contains(videoElement)) {
        container.removeChild(videoElement);
      }
      clearTimeout(timeoutId);
    };
  }, [onComplete]);
  
  if (!isVisible) return null;
  
  return (
    <div 
      id="splash-container" 
      className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center"
    >
      {/* Optional logo or text overlay */}
      <div className="absolute z-10 text-white text-4xl font-bold">
        {/* Any overlay content can go here */}
      </div>
    </div>
  );
};

export default SplashScreen;
