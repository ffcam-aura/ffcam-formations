'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { saveScrollPosition } from '@/lib/scrollMemory';

interface NavigationContextType {
  isNavigating: boolean;
  startNavigation: (event?: React.MouseEvent) => void;
  endNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);

  const startNavigation = useCallback((event?: React.MouseEvent) => {
    // Cmd/Ctrl/Maj/Alt+clic ou clic molette : ouverture dans un autre onglet, la page
    // courante ne change pas et l'écran « Chargement » resterait affiché indéfiniment
    if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) return;
    // Position de la liste, rétablie au retour (voir lib/scrollMemory)
    saveScrollPosition();
    setIsNavigating(true);
  }, []);

  const endNavigation = useCallback(() => {
    setIsNavigating(false);
  }, []);

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation, endNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}