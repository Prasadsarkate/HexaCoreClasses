import { useState, useEffect, useRef } from 'react';
import PageMeta from '@/components/common/PageMeta';
import { getAssetUrl } from '@/services/api';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getVideoById, updateVideoProgress, getPlaylistVideos } from '@/services/api';
import type { Video } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, AlertCircle, SkipForward, PlayCircle, Pause, Volume2, VolumeX, Maximize, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

// Custom scrollbar styles for the playlist sidebar
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }
`;

// Declare YouTube API types for TS
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function VideoPlayer() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playlistContainerRef = useRef<HTMLDivElement>(null);
  const [video, setVideo] = useState<Video | null>(null);
  const [playlistVideos, setPlaylistVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showNextVideoPrompt, setShowNextVideoPrompt] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const autoplay = searchParams.get('autoplay') === 'true';

  // Custom Controls State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (id) {
      loadVideo();
    }
  }, [id]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showNextVideoPrompt && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showNextVideoPrompt && countdown === 0) {
      playNextVideo();
    }
    return () => clearTimeout(timer);
  }, [showNextVideoPrompt, countdown]);

  const loadVideo = async () => {
    if (!id) return;
    setIsLoading(true);
    setVideo(null); // Force cleanup of previous player
    setVideoError(false);
    setHasMarkedComplete(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setShowNextVideoPrompt(false);
    setCountdown(5);

    try {
      const videoData = await getVideoById(id);
      if (videoData) {
        setVideo(videoData);
        if (videoData.playlist_id) {
          const videos = await getPlaylistVideos(videoData.playlist_id);
          setPlaylistVideos(videos);
        }
      }
    } catch (err) {
      setVideoError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // YouTube API Integration
  useEffect(() => {
    const videoId = extractYouTubeId(video?.video_url || '');
    if (!video || !videoId) return;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      const playerElement = document.getElementById('youtube-player');
      if (!playerElement) return;

      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) { }
      }

      playerRef.current = new window.YT.Player('youtube-player', {
        host: 'https://www.youtube-nocookie.com',
        videoId: videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          widget_referrer: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setDuration(event.target.getDuration());
            if (autoplay) {
              event.target.playVideo();
              setIsPlaying(true);
            }
          },
          onStateChange: (event: any) => {
            // Numeric fallbacks for consistency
            const PLAYING = window.YT ? window.YT.PlayerState.PLAYING : 1;
            const PAUSED = window.YT ? window.YT.PlayerState.PAUSED : 2;
            const ENDED = window.YT ? window.YT.PlayerState.ENDED : 0;

            if (event.data === PLAYING) setIsPlaying(true);
            else if (event.data === PAUSED) setIsPlaying(false);
            else if (event.data === ENDED) handleVideoEnd();
          },
          onError: (e: any) => {
            console.error('YouTube Player Error:', e.data);
            setVideoError(true);
          },
        }
      });
    };

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player && window.YT.loaded) {
        initPlayer();
      } else {
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          const tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const prevOnReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prevOnReady) prevOnReady();
          initPlayer();
        };

        // Fallback polling
        const checkYT = setInterval(() => {
          if (window.YT && window.YT.Player && window.YT.loaded) {
            initPlayer();
            clearInterval(checkYT);
          }
        }, 500);
        setTimeout(() => clearInterval(checkYT), 10000);
      }
    };

    loadYouTubeAPI();

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) { }
        playerRef.current = null;
      }
    };
  }, [video, autoplay, isLoading]);

  // Sync Progress for YouTube
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying && typeof playerRef.current.getCurrentTime === 'function') {
        const current = playerRef.current.getCurrentTime();
        setCurrentTime(current);
        const dur = playerRef.current.getDuration();
        if (dur > 0 && current / dur >= 0.9 && !hasMarkedComplete) {
          handleVideoEnd();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, hasMarkedComplete]);

  // Scroll active video into view in the sidebar
  useEffect(() => {
    if (video && playlistContainerRef.current) {
      const activeItem = playlistContainerRef.current.querySelector('[data-active="true"]');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [video, playlistVideos]);

  const extractYouTubeId = (url: string) => {
    if (!url) return null;
    // Handle full iframe embed codes
    if (url.includes('<iframe')) {
      const srcMatch = url.match(/src=["']([^"']+)["']/);
      if (srcMatch) url = srcMatch[1];
    }

    // Comprehensive regex for all YouTube formats (Shorts, Embeds, Watch, etc.)
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  const getNextVideo = () => {
    if (!video || playlistVideos.length === 0) return null;
    const currentIndex = playlistVideos.findIndex(v => v.id === video.id);
    if (currentIndex === -1 || currentIndex === playlistVideos.length - 1) return null;
    return playlistVideos[currentIndex + 1];
  };

  const playNextVideo = () => {
    const nextVideo = getNextVideo();
    if (nextVideo) {
      navigate(`/video/${nextVideo.id}?autoplay=true`);
      setShowNextVideoPrompt(false);
      setCountdown(5);
    }
  };

  const handleVideoEnd = async () => {
    if (!profile || !video || hasMarkedComplete) return;
    setHasMarkedComplete(true);
    setIsPlaying(false);

    if (video.playlist_id) {
      await updateVideoProgress(profile.id, video.id, video.playlist_id, video.duration, true);
      toast({ title: 'Video Completed!', description: 'Great job! Keep learning.' });
    }

    const nextVideo = getNextVideo();
    if (nextVideo) setShowNextVideoPrompt(true);
  };

  // Custom Controls Functions
  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
      setIsPlaying(!isPlaying);
    } else if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (values: number[]) => {
    const time = values[0];
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
    } else if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) playerRef.current.unMute();
      else playerRef.current.mute();
      setIsMuted(!isMuted);
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (values: number[]) => {
    const v = values[0];
    setVolume(v);
    if (playerRef.current) {
      playerRef.current.setVolume(v);
    } else if (videoRef.current) {
      videoRef.current.volume = v / 100;
    }
    setIsMuted(v === 0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Video not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const videoId = extractYouTubeId(video.video_url);
  const isYouTube = !!videoId;
  const nextVideo = getNextVideo();

  return (
    <div className="min-h-screen bg-background pb-20" onMouseMove={handleMouseMove}>
      <PageMeta
        title={video.title}
        description={video.description || ""}
        ogImage={getAssetUrl(video.thumbnail_url) || ""}
        keywords={`${video.title.split(' ').join(', ')}, HexaCore Classes, video tutorial`}
        ogType="article"
      />
      <style>{scrollbarStyles}</style>
      {/* Header */}
      <div className={`bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md transition-opacity duration-300 ${!showControls && isPlaying ? 'opacity-0' : 'opacity-100'}`}>
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-2 h-8 sm:h-9"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5 mr-1 sm:mr-2" strokeWidth={1.5} />
            Back
          </Button>
          <h1 className="text-lg sm:text-xl font-bold line-clamp-2">{video.title}</h1>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6">
          <div className="flex-1 lg:max-w-[calc(100%-400px)]">
            {/* Player Container */}
            <div
              ref={containerRef}
              className="w-full bg-black relative rounded-lg sm:rounded-xl overflow-hidden shadow-2xl aspect-video group"
            >
              {isYouTube ? (
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                  <div id="youtube-player" className="w-full h-full" />
                </div>
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  onEnded={handleVideoEnd}
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime);
                      setDuration(videoRef.current.duration);
                    }
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={() => setVideoError(true)}
                  poster={video.thumbnail_url}
                  autoPlay={autoplay}
                >
                  <source src={video.video_url} type="video/mp4" />
                </video>
              )}

              {/* Click-Blocker / Custom Interaction Layer */}
              <div
                className={`absolute inset-0 z-10 cursor-pointer flex items-center justify-center transition-all duration-300 ${!isPlaying && !isLoading ? 'bg-black/40 backdrop-blur-sm' : ''}`}
                onClick={togglePlay}
              >
                {!isPlaying && !isLoading && (
                  <div className="text-center group">
                    <div className="w-20 h-20 bg-primary/90 rounded-full flex items-center justify-center shadow-2xl transform transition-all group-hover:scale-110 mb-4 mx-auto">
                      <Play size={40} className="text-white ml-2" fill="currentColor" />
                    </div>
                    <p className="text-white font-bold text-lg drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">Resume Learning</p>
                  </div>
                )}
              </div>

              {/* Custom Controls UI */}
              <div className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-10 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                {/* Progress Bar */}
                <div className="mb-4 group/slider">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                      {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>

                    <div className="flex items-center gap-2 group/vol">
                      <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
                        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <div className="w-0 group-hover/vol:w-24 transition-all overflow-hidden flex items-center">
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          max={100}
                          onValueChange={handleVolumeChange}
                          className="w-24 ml-2"
                        />
                      </div>
                    </div>

                    <span className="text-white text-xs sm:text-sm font-medium">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
                      <Maximize size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Next Video Prompt */}
              {showNextVideoPrompt && nextVideo && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30 p-4">
                  <div className="bg-card rounded-2xl p-6 max-w-sm w-full text-center border border-border">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <SkipForward size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">Up Next</h3>
                    <p className="text-muted-foreground mb-4">Starting in {countdown}...</p>
                    <div className="bg-muted p-3 rounded-xl mb-6">
                      <p className="font-semibold text-sm line-clamp-2">{nextVideo.title}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setShowNextVideoPrompt(false)}>Cancel</Button>
                      <Button className="flex-1" onClick={playNextVideo}>Play Now</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Error Message */}
            {videoError && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-xl flex flex-col gap-2 text-destructive border border-destructive/20">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} />
                  <p className="font-bold">Unable to load video</p>
                </div>
                <ul className="text-xs list-disc list-inside space-y-1 ml-8 text-destructive/80">
                  <li>Make sure the YouTube video is <strong>Public</strong>.</li>
                  <li>Check if <strong>"Allow Embedding"</strong> is enabled in YouTube settings.</li>
                  <li>Verify if the video is age-restricted or private.</li>
                </ul>
              </div>
            )}

            {/* Video Details */}
            <div className="mt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">{video.title}</h2>
                  {video.description && !video.description.includes('Part of imported playlist') && (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{video.description}</p>
                  )}
                </div>
                {hasMarkedComplete && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-500/10 px-3 py-1.5 rounded-full">
                    <CheckCircle size={20} />
                    <span className="font-bold text-sm">Completed</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-[380px] shrink-0 space-y-6">
            {/* Full Playlist Content Section */}
            {playlistVideos.length > 0 && (
              <div className="bg-card rounded-2xl p-5 border border-border shadow-lg sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <PlayCircle size={20} className="text-primary" />
                    <h3 className="font-bold text-lg">Course Playlist</h3>
                  </div>
                  <Badge variant="outline" className="rounded-lg">{playlistVideos.length} Videos</Badge>
                </div>
                <div
                  ref={playlistContainerRef}
                  className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar"
                >
                  {playlistVideos.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => navigate(`/video/${v.id}`)}
                      data-active={v.id === video.id}
                      className={`w-full group flex items-center gap-3 p-2 rounded-xl transition-all text-left ${v.id === video.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${v.id === video.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                        {i + 1}
                      </div>
                      <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0 border border-border">
                        <img src={v.thumbnail_url} className="w-full h-full object-cover" />
                        {v.id === video.id ? (
                          <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                              <Play size={14} className="text-white" fill="currentColor" />
                              <span className="text-[8px] text-white font-bold uppercase mt-0.5">Now</span>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity" />
                        )}
                      </div>
                      <div className="min-w-0 pr-1">
                        <p className={`text-sm font-bold line-clamp-2 ${v.id === video.id ? 'text-primary' : 'text-slate-900 group-hover:text-primary'}`}>
                          {v.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">
                          {formatTime(v.duration)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
