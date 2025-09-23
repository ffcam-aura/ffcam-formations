'use client';

import { useState } from 'react';

interface EmailDisplayProps {
  email: string | null;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function EmailDisplay({
  email,
  className = "text-primary underline",
  showLabel = true,
  label = "Email :"
}: EmailDisplayProps) {
  const [showEmail, setShowEmail] = useState(false);

  if (!email) {
    return showLabel ? (
      <>
        {label && <strong className="w-16 flex-shrink-0">{label}</strong>}
        <span>Non disponible</span>
      </>
    ) : (
      <span>Non disponible</span>
    );
  }

  return (
    <>
      {showLabel && label && <strong className="w-16 flex-shrink-0">{label}</strong>}
      {showEmail ? (
        <a href={`mailto:${email}`} className={`${className} break-all`}>
          {email}
        </a>
      ) : (
        <button
          onClick={() => setShowEmail(true)}
          className={`${className} text-left`}
        >
          Afficher l&apos;email
        </button>
      )}
    </>
  );
}