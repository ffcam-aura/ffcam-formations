'use client';

import { Mail } from 'lucide-react';
import { EmailDisplay } from '@/components/ui/EmailDisplay';

interface ObfuscatedEmailProps {
  email: string;
}

export default function ObfuscatedEmail({ email }: ObfuscatedEmailProps) {
  return (
    <div className="flex items-start gap-3">
      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
      <div>
        <p className="text-sm text-gray-600">Contact</p>
        <EmailDisplay
          email={email}
          showLabel={false}
          className="font-medium text-primary-600 hover:text-primary-700 underline"
        />
      </div>
    </div>
  );
}