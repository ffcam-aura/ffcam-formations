'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Reset loading state when path changes
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);

    // Listen for route changes
    window.addEventListener('beforeunload', handleStart);

    return () => {
      window.removeEventListener('beforeunload', handleStart);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
            <p className="text-sm text-gray-600">Chargement de la formation...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}