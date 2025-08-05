import React, { useRef, useState } from "react";

const MoodSongs = ({ song }) => {
  const [playingIndex, setPlayingIndex] = useState(null);
  const [progress, setProgress] = useState(0); 
  const [duration, setDuration] = useState(0); 

  const audioRefs = useRef([]);

  
  const handlePlayPause = (idx) => {
    if (playingIndex === idx) {
      audioRefs.current[idx]?.pause();
      setPlayingIndex(null);
    } else {
      audioRefs.current.forEach((audio, i) => {
        if (audio && i !== idx) audio.pause();
      });
      audioRefs.current[idx]?.play();
      setPlayingIndex(idx);
    }
  };


  const handleTimeUpdate = (e, idx) => {
    if (playingIndex === idx) {
      setProgress(e.target.currentTime);
      setDuration(e.target.duration);
    }
  };

 
  const handleLoadedMetadata = (e, idx) => {
    if (playingIndex === idx) {
      setDuration(e.target.duration);
    }
  };


  const handleSeek = (val, idx) => {
    audioRefs.current[idx].currentTime = val;
    setProgress(val);
  };

  
  const formatTime = (sec) =>
    sec ? `${Math.floor(sec / 60)}:${("0" + Math.floor(sec % 60)).slice(-2)}` : "0:00";


  const handleEnded = () => {
    setPlayingIndex(null);
    setProgress(0);
    setDuration(0);
  };

  const moodHeading = song?.[0]?.mood || "Mood";

  return (
    <section className="w-full   bg-gradient-to-br from-[#1e293b] to-[#111827] 
      h-100 overflow-auto rounded-xl shadow-lg px-2 md:px-8 py-8 ">
      <h1 className="text-3xl  md:text-4xl font-extrabold text-white mb-8">
        {moodHeading} — Recommended Songs
      </h1>
      <div className="flex flex-col  gap-5">
        {song.map((item, idx) => (
          <div
            key={idx}
            className="w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-md
            flex flex-col md:flex-row md:items-center gap-3 justify-between px-4 py-2
            transition group hover:bg-blue-900/20 overflow-hidden"
          >
            <div className="flex flex-col flex-1 min-w-0">
              <h2 className="truncate text-xl font-bold text-white mb-1">{item.title}</h2>
              <p className="truncate text-md text-gray-200 opacity-90">{item.artist}</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2 min-w-[120px]">
              <button
                onClick={() => handlePlayPause(idx)}
                className="rounded-full p-2 bg-blue-400 hover:bg-blue-500
                transition shadow-lg focus:outline-none"
                aria-label={playingIndex === idx ? "Pause" : "Play"}
              >
                {playingIndex === idx ? (
                  <i className="ri-pause-line text-2xl text-white" />
                ) : (
                  <i className="ri-play-fill text-2xl text-white" />
                )}
              </button>

             
              <div
                className={`w-full flex items-center gap-2 transition-all origin-right
                ${
                  playingIndex === idx
                    ? "max-w-xs opacity-100 h-7 duration-500"
                    : "max-w-0 opacity-0 h-0 duration-300"
                }`}
                style={{ minWidth: 0 }}
              >
                
                {playingIndex === idx && (
                  <span className="text-xs text-gray-200">{formatTime(progress)}</span>
                )}

                <input
                  className="slider-thumb w-full flex-grow h-1 rounded-lg appearance-none bg-blue-300 accent-blue-500
                  transition-all outline-none ring-1 ring-blue-400/40 focus:ring-2"
                  type="range"
                  min="0"
                  max={duration || 1}
                  value={playingIndex === idx ? progress : 0}
                  onChange={(e) => handleSeek(Number(e.target.value), idx)}
                  style={{
                    accentColor: "#1fb6ff",
                    transition: "width 0.4s cubic-bezier(.4,0,.2,1)",
                  }}
                />

       
                {playingIndex === idx && (
                  <span className="text-xs text-gray-200">{formatTime(duration)}</span>
                )}
              </div>
             
              <audio
                ref={(el) => (audioRefs.current[idx] = el)}
                src={item.audio}
                onPlay={() => setPlayingIndex(idx)}
                onPause={() => setPlayingIndex(null)}
                onTimeUpdate={(e) => handleTimeUpdate(e, idx)}
                onLoadedMetadata={(e) => handleLoadedMetadata(e, idx)}
                onEnded={handleEnded}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MoodSongs;