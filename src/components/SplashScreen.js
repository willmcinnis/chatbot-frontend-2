import React, { useState, useEffect, useRef } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef(null);
  
  useEffect(() => {
    console.log("SplashScreen mounted");
    
    const video = videoRef.current;
    if (!video) {
      console.error("Video element not found");
      return;
    }
    
    // Log video attributes for debugging
    console.log("Video element:", video);
    console.log("Video source:", video.src);
    console.log("Video ready state:", video.readyState);
    
    // Handle video load success
    const handleCanPlay = () => {
      console.log("Video can play now");
      // Attempt to play the video
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Video playback started successfully");
          })
          .catch(error => {
            console.error("Video playback failed:", error);
            // If autoplay fails, just hide the splash screen
            setTimeout(() => {
              setIsVisible(false);
              if (onComplete) onComplete();
            }, 1000);
          });
      }
    };
    
    // Handle video end
    const handleEnded = () => {
      console.log("Video playback ended");
      setIsVisible(false);
      if (onComplete) onComplete();
    };
    
    // Handle video error
    const handleError = (error) => {
      console.error("Video error:", error);
      setIsVisible(false);
      if (onComplete) onComplete();
    };
    
    // Set up event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    
    // Fallback timeout - hide splash screen after 6 seconds regardless
    const timeoutId = setTimeout(() => {
      console.log("Fallback timeout triggered");
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 6000);
    
    // Cleanup
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      clearTimeout(timeoutId);
    };
  }, [onComplete]);
  
  if (!isVisible) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center"
    >
      <video 
        ref={videoRef}
        src="/Lisa.mp4"
        muted
        playsInline
        autoPlay
        className="w-full h-full object-cover"
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      
      {/* Optional logo or text overlay */}
      <div className="absolute z-10 text-white text-4xl font-bold">
        {/* Any overlay content can go here */}
      </div>
    </div>
  );
};

export default SplashScreen;
