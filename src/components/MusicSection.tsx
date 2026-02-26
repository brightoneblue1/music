import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Music, Clock, Youtube, Volume2, Info, SkipBack, SkipForward, Repeat, Shuffle, Volume1, VolumeX, Search } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { DownloadModal } from './DownloadModal';

interface Beat {
  id: string;
  title: string;
  genre: string;
  bpm: string;
  duration: string;
  audioUrl: string;
  imageUrl: string;
  type: 'beat' | 'remix';
}

export function MusicSection() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'beat' | 'remix'>('all');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('one');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchBeats();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === 'all') {
        handleNext();
      } else {
        const currentIndex = filteredBeats.findIndex(b => b.id === playingId);
        if (currentIndex < filteredBeats.length - 1) {
          handleNext();
        } else {
          setPlayingId(null);
        }
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode, playingId]);

  const fetchBeats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/beats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch beats:', await response.text());
        return;
      }
      
      const data = await response.json();
      setBeats(data.beats || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching beats:', error);
      setIsLoading(false);
    }
  };

  const handlePlayPause = (beat: Beat) => {
    if (!beat.audioUrl) {
      alert('Audio file not available. Please add an audio URL in the admin panel.');
      return;
    }
    
    if (playingId === beat.id) {
      // Toggle play/pause for current track
      if (audioRef.current?.paused) {
        audioRef.current?.play().catch(error => {
          console.error('Error playing audio:', error);
          alert('Unable to play audio. Please check the audio URL in the admin panel.');
        });
      } else {
        audioRef.current?.pause();
      }
    } else {
      // Switch to new track
      setPlayingId(beat.id);
      setSelectedBeat(beat);
      if (audioRef.current) {
        audioRef.current.src = beat.audioUrl;
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          alert('Unable to play audio. Please check the audio URL in the admin panel.');
          setPlayingId(null);
        });
        
        // Track listen count
        trackListen(beat.id);
      }
    }
  };

  const trackListen = async (beatId: string) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/track-listen`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ beatId }),
        }
      );
    } catch (error) {
      console.error('Error tracking listen:', error);
      // Don't show error to user, just log it
    }
  };

  const handleDownloadClick = (beat: Beat) => {
    if (!beat.audioUrl) {
      alert('Audio file not available. Please add an audio URL in the admin panel.');
      return;
    }
    setSelectedBeat(beat);
    setShowDownloadModal(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const filteredBeats = filter === 'all' 
    ? beats 
    : beats.filter(beat => beat.type === filter);

  // Apply search filter
  const searchedBeats = searchQuery
    ? filteredBeats.filter(beat =>
        beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beat.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beat.bpm.includes(searchQuery)
      )
    : filteredBeats;

  const currentBeat = beats.find(b => b.id === playingId);

  const handleNext = () => {
    const currentIndex = filteredBeats.findIndex(b => b.id === playingId);
    if (currentIndex < filteredBeats.length - 1) {
      const nextBeat = filteredBeats[currentIndex + 1];
      if (!nextBeat.audioUrl) {
        alert('Audio file not available for next track.');
        return;
      }
      setPlayingId(nextBeat.id);
      setSelectedBeat(nextBeat);
      if (audioRef.current) {
        audioRef.current.src = nextBeat.audioUrl;
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    } else if (repeatMode === 'all') {
      const firstBeat = filteredBeats[0];
      if (!firstBeat.audioUrl) return;
      setPlayingId(firstBeat.id);
      setSelectedBeat(firstBeat);
      if (audioRef.current) {
        audioRef.current.src = firstBeat.audioUrl;
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    }
  };

  const handlePrevious = () => {
    const currentIndex = filteredBeats.findIndex(b => b.id === playingId);
    if (currentIndex > 0) {
      const previousBeat = filteredBeats[currentIndex - 1];
      if (!previousBeat.audioUrl) {
        alert('Audio file not available for previous track.');
        return;
      }
      setPlayingId(previousBeat.id);
      setSelectedBeat(previousBeat);
      if (audioRef.current) {
        audioRef.current.src = previousBeat.audioUrl;
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    }
  };

  return (
    <div className="pt-24 pb-32 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-white mb-2">Music Library</h2>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracks..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border-2 border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-all"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              filter === 'all'
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            All Tracks
          </button>
          <button
            onClick={() => setFilter('beat')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              filter === 'beat'
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Beats
          </button>
          <button
            onClick={() => setFilter('remix')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              filter === 'remix'
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Remixes
          </button>
        </div>

        {/* Track List - Spotify Style */}
        <div className="bg-white/5 backdrop-blur-lg border-2 border-white/20 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_auto_auto_auto] gap-2 md:gap-4 px-3 md:px-6 py-3 border-b border-white/10 text-sm text-gray-400 font-medium">
            <div className="w-8 md:w-12">#</div>
            <div>Title</div>
            <div className="text-center w-16 md:w-24 hidden md:block">Genre</div>
            <div className="text-center w-16 md:w-24">Time</div>
            <div className="w-12 md:w-32"></div>
          </div>

          {/* Track List */}
          <div>
            {searchedBeats.map((beat, index) => (
              <div
                key={beat.id}
                className={`grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_auto_auto_auto] gap-2 md:gap-4 px-3 md:px-6 py-4 hover:bg-white/10 transition-all group ${
                  playingId === beat.id ? 'bg-white/10' : ''
                }`}
              >
                {/* Play Button & Number */}
                <div className="w-8 md:w-12 flex items-center">
                  <button
                    onClick={() => handlePlayPause(beat)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {playingId === beat.id ? (
                      <Pause className="w-4 md:w-5 h-4 md:h-5 text-white" />
                    ) : (
                      <Play className="w-4 md:w-5 h-4 md:h-5 text-white" />
                    )}
                  </button>
                  <span className={`text-gray-400 text-sm md:text-base group-hover:hidden ${playingId === beat.id ? 'hidden' : ''}`}>
                    {index + 1}
                  </span>
                </div>

                {/* Track Info */}
                <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
                  {beat.imageUrl ? (
                    <img
                      src={beat.imageUrl}
                      alt={beat.title}
                      className="hidden md:block w-12 h-12 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="hidden md:flex w-12 h-12 bg-white/10 rounded items-center justify-center flex-shrink-0">
                      <Music className="w-6 h-6 text-white/40" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className={`font-semibold truncate text-sm md:text-base ${
                      playingId === beat.id ? 'text-white' : 'text-white'
                    }`}>
                      {beat.title}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-400 truncate">{beat.bpm} BPM</p>
                  </div>
                </div>

                {/* Genre - Hidden on Mobile */}
                <div className="hidden md:flex items-center justify-center w-24">
                  <span className="text-sm text-gray-400">{beat.genre}</span>
                </div>

                {/* Duration */}
                <div className="flex items-center justify-center w-16 md:w-24">
                  <span className="text-xs md:text-sm text-gray-400">{beat.duration}</span>
                </div>

                {/* Actions */}
                <div className="w-12 md:w-32 flex items-center justify-end">
                  <button
                    onClick={() => handleDownloadClick(beat)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-full transition-all"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {isLoading && (
            <div className="text-center py-20">
              <Music className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-pulse" />
              <p className="text-xl text-gray-400">Loading music...</p>
            </div>
          )}

          {!isLoading && filteredBeats.length === 0 && (
            <div className="text-center py-20">
              <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400">No tracks available yet. Check back soon!</p>
            </div>
          )}
        </div>

        <audio ref={audioRef} />
      </div>

      {/* Fixed Media Player - Spotify Style */}
      {currentBeat && playingId && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10 z-50">
          <div className="max-w-screen-2xl mx-auto px-4 py-3">
            <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 items-center">
              {/* Currently Playing Track Info */}
              <div className="flex items-center space-x-4 min-w-0">
                {currentBeat.imageUrl ? (
                  <img
                    src={currentBeat.imageUrl}
                    alt={currentBeat.title}
                    className="w-14 h-14 object-cover rounded"
                  />
                ) : (
                  <div className="w-14 h-14 bg-white/10 rounded flex items-center justify-center flex-shrink-0">
                    <Music className="w-6 h-6 text-white/40" />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-semibold text-white truncate">{currentBeat.title}</h4>
                  <p className="text-sm text-gray-400 truncate">{currentBeat.genre} • {currentBeat.bpm} BPM</p>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-4">
                  {/* Repeat Button */}
                  <button
                    onClick={() => {
                      if (repeatMode === 'off') setRepeatMode('all');
                      else if (repeatMode === 'all') setRepeatMode('one');
                      else setRepeatMode('off');
                    }}
                    className={`p-2 rounded-full transition-all ${
                      repeatMode !== 'off' 
                        ? 'text-white bg-white/20' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title={
                      repeatMode === 'off' 
                        ? 'Repeat Off' 
                        : repeatMode === 'all' 
                        ? 'Repeat All' 
                        : 'Repeat One'
                    }
                  >
                    <Repeat className="w-4 h-4" />
                    {repeatMode === 'one' && (
                      <span className="absolute text-[10px] font-bold">1</span>
                    )}
                  </button>

                  {/* Previous */}
                  <button
                    onClick={handlePrevious}
                    className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={filteredBeats.findIndex(b => b.id === playingId) === 0}
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={() => handlePlayPause(currentBeat)}
                    className="w-10 h-10 bg-white hover:bg-gray-200 text-black rounded-full flex items-center justify-center transition-all transform hover:scale-105"
                  >
                    {playingId === currentBeat.id && !audioRef.current?.paused ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>

                  {/* Next */}
                  <button
                    onClick={handleNext}
                    className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={filteredBeats.findIndex(b => b.id === playingId) === filteredBeats.length - 1}
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full flex items-center space-x-2">
                  <span className="text-xs text-gray-400 w-10 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-110"
                  />
                  <span className="text-xs text-gray-400 w-10">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Volume Control */}
              <div className="flex items-center justify-end space-x-4">
                <div className="flex items-center space-x-2 relative">
                  <button
                    onClick={() => setShowVolume(!showVolume)}
                    onMouseEnter={() => setShowVolume(true)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  {showVolume && (
                    <div 
                      className="absolute bottom-full right-0 mb-2 bg-black/95 border border-white/20 rounded-lg p-2"
                      onMouseLeave={() => setShowVolume(false)}
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                        style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDownloadClick(currentBeat)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDownloadModal && selectedBeat && (
        <DownloadModal
          beat={selectedBeat}
          onClose={() => {
            setShowDownloadModal(false);
            setSelectedBeat(null);
          }}
        />
      )}
    </div>
  );
}