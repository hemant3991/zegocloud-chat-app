"use client"

import { useState, useEffect, useRef } from 'react';
import { zegoService } from '@/lib/zegocloud-service';

export function useZegoCloud() {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (initializedRef.current) {
        console.log("[useZegoCloud] Service already initialized.");
        return;
      }

      console.log("[useZegoCloud] Initializing service...");
      const success = await zegoService.initialize();
      if (isMounted && success) {
        console.log("[useZegoCloud] Service initialized successfully.");
        initializedRef.current = true;
        setIsInitialized(true);
      } else if (isMounted) {
        console.error("[useZegoCloud] Service failed to initialize.");
      }
    };

    initialize();

    return () => {
      isMounted = false;
      console.log("[useZegoCloud] Cleaning up service...");
      zegoService.destroy();
    };
  }, []);

  return { service: zegoService, isInitialized };
}
