'use client';

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 rounded-full">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Impossible de charger cette formation
        </h1>

        <p className="text-gray-600 mb-8">
          La formation demandée n&apos;a pas pu être chargée. Elle a peut-être été supprimée ou n&apos;existe plus.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux formations
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-sm text-gray-400">
            Code erreur: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
