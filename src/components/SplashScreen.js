import React, { useState, useEffect, useRef } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef(null);
  
  useEffect(() => {
    const video = videoRef.current;
    
    if (!video) return;
    
    // Function to handle timeupdate event
    const handleTimeUpdate = () => {
      // Get video duration
      const duration = video.duration;
      // Get current time
      const currentTime = video.currentTime;
      
      // Start fade out when there's 1 second left in the video
      if (duration - currentTime <= 1) {
        setFadeOut(true);
      }
    };
    
    // Function to handle video end
    const handleEnded = () => {
      if (onComplete) onComplete();
    };
    
    // Add event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    
    // Fallback timeout in case video doesn't play
    const fallbackTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 10000); // 10 seconds fallback
    
    // Cleanup function
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      clearTimeout(fallbackTimer);
    };
  }, [onComplete]);
  
  return (
    <div 
      className={`fixed inset-0 z-40 flex items-center justify-center ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{
        transition: 'opacity 1s ease-out',
        // These styles constrain the video to the chat interface area
        maxWidth: 'calc(100% - 2rem)', // Match chat width
        margin: '0 auto',
        borderRadius: '0.5rem', // Match chat border radius
        overflow: 'hidden'
      }}
    >
      <video 
        ref={videoRef}
        src="/Lisa.mp4"
        className="w-full h-full object-cover"
        muted
        autoPlay
        playsInline
      />
    </div>
  );
};

export default SplashScreen;
