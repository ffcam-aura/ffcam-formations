'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

interface ObfuscatedInscriptionButtonProps {
  email: string;
  formationTitle: string;
  disabled?: boolean;
}

export default function ObfuscatedInscriptionButton({
  email,
  formationTitle,
  disabled = false
}: ObfuscatedInscriptionButtonProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleClick = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      // Petit délai pour éviter les bots automatiques
      setTimeout(() => {
        const subject = encodeURIComponent(`Demande d'inscription - ${formationTitle}`);
        const body = encodeURIComponent(
          `Bonjour,\n\nJe souhaite m'inscrire à la formation "${formationTitle}".\n\nPouvez-vous me confirmer la disponibilité et les modalités d'inscription ?\n\nCordialement,`
        );
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      }, 100);
    }
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="w-full"
      disabled={disabled}
    >
      {disabled ? 'Formation complète' : 'Demande d\'inscription'}
      {!disabled && <Mail className="w-4 h-4 ml-2" />}
    </Button>
  );
}