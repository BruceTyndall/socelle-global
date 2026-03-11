import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface ProductVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}

export function ProductVideoPlayer({ src, poster, title, className = '' }: ProductVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Default muted for auto-play scenarios
  const [isHovered, setIsHovered] = useState(false);

  // Intersection Observer to auto-pause when out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && isPlaying) {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div 
      className={`relative rounded-2xl overflow-hidden bg-mn-dark group isolate ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        muted={isMuted}
        loop
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        onClick={togglePlay}
      />

      {/* Play/Pause Center Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-graphite/20 pointer-events-none transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          isHovered || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {title && (
          <p className="text-white font-medium text-sm mb-3 drop-shadow-md line-clamp-1">
            {title}
          </p>
        )}
        <div className="flex items-center justify-between">
          <button 
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleMute}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
