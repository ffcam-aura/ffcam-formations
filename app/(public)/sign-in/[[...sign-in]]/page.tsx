import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      {/* Logo et titre */}
      <div className="flex flex-col items-center mb-8 space-y-4">
        <Link 
          href="/"
          className="relative w-16 h-16 transition-transform hover:scale-105"
          title="Retour à l'accueil"
        >
          <Image
            src="/ffcam.png"
            alt="Logo FFCAM"
            width={64}
            height={64}
            className="object-contain"
            priority
          />
        </Link>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenue</h1>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous pour gérer vos notifications
          </p>
        </div>
      </div>

      {/* Conteneur de la SignIn Box */}
      <div className="w-full max-w-md">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-primary-500 hover:bg-primary-600 text-sm normal-case",
                card: "shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: 
                  "border border-gray-300 hover:bg-gray-50 text-sm normal-case",
                formFieldInput: 
                  "h-11 border-gray-300 focus:border-primary-500 focus:ring-primary-500",
                footer: "hidden"
              },
            }}
          />
      </div>

      {/* Lien de retour */}
      <div className="mt-8">
        <Link 
          href="/" 
          className="text-sm text-gray-500 hover:text-primary-500 transition-colors"
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}