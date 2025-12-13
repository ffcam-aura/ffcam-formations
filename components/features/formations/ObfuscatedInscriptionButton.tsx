'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Copy, Check } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const subject = `Demande d'inscription - ${formationTitle}`;
  const body = `Bonjour,

Je souhaite m'inscrire à la formation "${formationTitle}".

Pouvez-vous me confirmer la disponibilité et les modalités d'inscription ?

Cordialement,`;

  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const handleMailtoClick = () => {
    setShowEmail(true);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback pour les navigateurs qui ne supportent pas clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = email;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        size="lg"
        className="w-full"
        disabled={disabled}
        asChild
      >
        <a href={mailtoLink} onClick={handleMailtoClick}>
          {disabled ? 'Formation complète' : "Demande d'inscription"}
          {!disabled && <Mail className="w-4 h-4 ml-2" />}
        </a>
      </Button>
      {!disabled && showEmail && (
        <>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700 flex-1">{email}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyEmail}
              className="flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copié!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copier
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Si votre client email ne s&apos;ouvre pas, copiez l&apos;adresse ci-dessus
          </p>
        </>
      )}
    </div>
  );
}