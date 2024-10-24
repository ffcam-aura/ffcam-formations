import { Github } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <div className="relative h-10 w-10">
            <Image
                src="/ffcam.png"
                alt="Logo FFCAM"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-primary-500">Formations FFCAM</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              href="#" 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
            >
              Accueil
            </Link>
            <Link 
              href="#" 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
            >
              À propos
            </Link>
            <a 
              href="https://github.com/Club-Alpin-Lyon-Villeurbanne/ffcam-formations"
              target="_blank"
              rel="noopener noreferrer" 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors inline-flex items-center space-x-2"
            >
              <Github size={16} />
              <span>GitHub</span>
            </a>
            <Link 
              href="#" 
              className="ml-2 px-4 py-2 rounded-md text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}