import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

const DEFAULT_AVATAR = "/face-detection.webp";

export default function FacialExpression({ setSong }) {
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false); // prevent double clicks

  const loadModels = async () => {
    const MODEL_URL = '/models';
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      
      setModelsLoaded(true);
    } catch (error) {
      
    }
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setCameraActive(true);
            
          };
        }
      })
      .catch((err) => {
        
        setCameraActive(false);
      });
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      
    }
  };

  const detectMood = async () => {
    if (!videoRef.current || isDetecting || !cameraActive) return;
    setIsDetecting(true);
    console.log("📸 Running mood detection...");

    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    console.log("🔍 Detections:", detections);

    if (!detections || detections.length === 0 || !detections[0].expressions) {
      console.log("😶 No face or expressions detected");
      setIsDetecting(false);
      return;
    }

    let highestProb = 0;
    let detectedMood = '';

    for (const [expression, probability] of Object.entries(detections[0].expressions)) {
      if (probability > highestProb) {
        highestProb = probability;
        detectedMood = expression;
      }
    }

    console.log("🧠 Detected mood:", detectedMood);

    try {
      const result = await axios.get(`http://localhost:3000/songs?mood=${detectedMood}`);
      console.log("🎵 Songs received:", result.data.songs);
      setSong(result.data.songs);
    } catch (err) {
      console.error("❌ Error fetching songs:", err);
    }

    stopCamera();

    
    setTimeout(() => {
      startVideo();
      setIsDetecting(false);
    }, 2000);
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      await loadModels();
      if (isMounted) startVideo();
    })();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []);

  return (
    <section className="flex flex-col items-center w-full max-w-2xl mx-auto mt-4 mb-6">
      <div className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2d3748]/60 to-[#0ea5e9]/40 rounded-2xl shadow-lg px-6 py-3 md:py-5">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight text-center">
          Mood Detection
        </h2>

        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-sky-900 shadow-xl mb-6">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover absolute inset-0 z-10"
          />
          {!cameraActive && (
            <img
              src={DEFAULT_AVATAR}
              alt="Default avatar"
              className="w-full h-full object-cover absolute inset-0 z-0"
            />
          )}
        </div>

        <button
          onClick={detectMood}
          disabled={!modelsLoaded || isDetecting}
          className={`px-8 py-3 rounded-full ${isDetecting ? 'bg-gray-400' : 'bg-blue-400 hover:bg-blue-500'} transition text-white font-bold text-lg shadow-lg focus:outline-none active:scale-95`}
        >
          {isDetecting ? "Detecting..." : "Detect Mood"}
        </button>
      </div>
    </section>
  );
}
