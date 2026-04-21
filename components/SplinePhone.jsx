'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// Dynamic import to avoid SSR issues
let SplineComponent = null;
if (typeof window !== 'undefined') {
  // Only import on client side
  import('@splinetool/react-spline').then((mod) => {
    SplineComponent = mod.default;
  }).catch(() => {
    // Fallback handled in component
  });
}

export default function SplinePhone({ 
  className = '',
  screenImage = null, // URL of image to show on phone screen
  screenVideo = null, // URL of video to show on phone screen
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const splineRef = useRef(null);

  // Spline scene URL (the .splinecode file)
  const splineSceneUrl = 'https://prod.spline.design/dynamiciphonemockup-eiy4uPKEdU7zQNWHJCly33kO/scene.splinecode';

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Apply screen texture when spline loads
  useEffect(() => {
    if (!isLoaded || !splineRef.current || (!screenImage && !screenVideo)) return;
    
    const applyScreenTexture = async () => {
      try {
        const spline = splineRef.current;
        
        // Find the screen object by name (common names in Spline iPhone mockups)
        const screenObject = spline.findObjectByName('Screen') || 
                            spline.findObjectByName('screen') ||
                            spline.findObjectByName('Display') ||
                            spline.findObjectByName('display') ||
                            spline.findObjectByName('Plane');
        
        if (screenObject && screenImage) {
          // Set image texture on screen
          await spline.setTexture(screenObject, screenImage, {
            fillMode: 'cover',
          });
        }
      } catch (err) {
        console.log('Could not apply screen texture:', err);
      }
    };

    // Delay slightly to ensure scene is fully ready
    const timer = setTimeout(applyScreenTexture, 500);
    return () => clearTimeout(timer);
  }, [isLoaded, screenImage, screenVideo]);

  // Handle spline load
  const onSplineLoad = (spline) => {
    splineRef.current = spline;
    setIsLoaded(true);
  };

  // Fallback UI on error
  if (hasError || !isClient) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-28 h-44 mx-auto mb-3 rounded-[1.5rem] border-2 border-[#d4cfc5] bg-gradient-to-b from-[#f8f6f2] to-[#e8e4dc] shadow-xl flex items-center justify-center overflow-hidden relative"
            >
              {screenImage ? (
                <img 
                  src={screenImage} 
                  alt="Screen" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl">📱</span>
              )}
            </motion.div>
            <p className="text-xs text-[#6a6050] font-medium">
              {screenImage ? 'Anteprima' : 'iPhone Mockup'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If Spline component failed to load, use iframe fallback
  if (isClient && !SplineComponent) {
    return (
      <div className={`relative ${className}`}>
        {!isLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <motion.div
              className="w-10 h-10 rounded-full border-2 border-[#d4cfc5] border-t-[#7c6f5b]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}
        <iframe
          src="https://my.spline.design/dynamiciphonemockup-eiy4uPKEdU7zQNWHJCly33kO/"
          width="100%"
          height="100%"
          frameBorder="0"
          onLoad={() => setIsLoaded(true)}
          style={{ border: 'none', borderRadius: '0.5rem' }}
          title="3D iPhone"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            className="w-10 h-10 rounded-full border-2 border-[#d4cfc5] border-t-[#7c6f5b]"
            transition={{ opacity: { duration: 0.2 }, rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }}
          />
        </div>
      )}

      {/* Spline 3D Viewer */}
      <div 
        className={`w-full h-full transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ borderRadius: '0.5rem' }}
      >
        {SplineComponent && (
          <SplineComponent
            scene={splineSceneUrl}
            onLoad={onSplineLoad}
            onError={() => setHasError(true)}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '0.5rem',
            }}
          />
        )}
      </div>

      {/* Gradient overlay for blending */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-lg"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(245, 242, 236, 0.2) 100%)'
        }}
      />
    </div>
  );
}
