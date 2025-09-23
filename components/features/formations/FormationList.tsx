'use client';

import { Formation } from "@/types/formation";
import FormationCard from "@/components/features/formations/FormationCard";
import FormationRow from "@/components/features/formations/FormationRow";
import { motion, AnimatePresence } from "framer-motion";

interface FormationListProps {
  formations: Formation[];
  viewMode: 'grid' | 'list';
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export default function FormationList({ formations, viewMode }: FormationListProps) {
  return (
    <AnimatePresence mode="wait">
      {viewMode === 'grid' ? (
        <motion.ul
          key="grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {formations.map((formation, index) => (
            <motion.li
              key={formation.reference}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.02 }}
            >
              <FormationCard formation={formation} />
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <motion.ul
          key="list"
          className="space-y-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {formations.map((formation, index) => (
            <motion.li
              key={formation.reference}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.02 }}
            >
              <FormationRow formation={formation} />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}