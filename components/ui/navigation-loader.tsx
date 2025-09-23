'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useNavigation } from '@/contexts/NavigationContext';

export default function NavigationLoader() {
  const pathname = usePathname();
  const { isNavigating, endNavigation } = useNavigation();

  useEffect(() => {
    // Reset navigation state when path changes
    endNavigation();
  }, [pathname, endNavigation]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">Chargement</p>
              <p className="text-sm text-gray-500 mt-1">Un instant...</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}