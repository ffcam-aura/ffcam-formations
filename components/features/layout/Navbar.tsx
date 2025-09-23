"use client";
import { BellRing, Github, Menu, X, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Assuming you have the shadcn/ui cn utility

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const NavLink = ({ href, children, className, onClick }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive 
          ? "bg-primary-50 text-primary-500" 
          : "text-gray-700 hover:bg-gray-100 hover:text-primary-500",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and title */}
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
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
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <NavLink href="/">Accueil</NavLink>
              <NavLink href="/a-propos">À propos</NavLink>
              <a
                href="https://www.ffcam.fr/export/liste_des_actions.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors inline-flex items-center space-x-2"
              >
                <FileText size={16} />
                <span>Cahier des formations</span>
              </a>
              <a
                href="https://github.com/ffcam-aura/ffcam-formations"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors inline-flex items-center space-x-2"
              >
                <Github size={16} />
                <span>Code source</span>
              </a>
            </div>

            {/* Desktop Clerk Components */}
            <div className="flex items-center space-x-4 ml-4 border-l pl-4">
              <SignedOut>
                <SignInButton>
                  <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors">
                    Se connecter
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="px-4 py-2 rounded-md text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors">
                    S&apos;inscrire
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/notifications"
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
                  title="Gérer vos notifications"
                >
                  <BellRing size={20} />
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 rounded-md",
                      userButtonTrigger: "hover:bg-gray-100 rounded-md p-1 transition-colors"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } md:hidden border-t py-4 space-y-4`}
        >
          <div className="flex flex-col space-y-2">
            <NavLink href="/" onClick={closeMenu}>
              Accueil
            </NavLink>
            <NavLink href="/a-propos" onClick={closeMenu}>
              À propos
            </NavLink>
            <a
              href="https://www.ffcam.fr/export/liste_des_actions.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors inline-flex items-center space-x-2"
              onClick={closeMenu}
            >
              <FileText size={16} />
              <span>Cahier des formations</span>
            </a>
            <a
              href="https://github.com/ffcam-aura/ffcam-formations"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors inline-flex items-center space-x-2"
              onClick={closeMenu}
            >
              <Github size={16} />
              <span>Code source</span>
            </a>
          </div>

          {/* Mobile Clerk Components */}
          <div className="border-t pt-4 space-y-2">
            <SignedOut>
              <div className="flex flex-col space-y-2 px-3">
                <SignInButton>
                  <button className="w-full py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors">
                    Se connecter
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="w-full py-2 rounded-md text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors">
                    S&apos;inscrire
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center space-x-4 px-3">
                <Link
                  href="/notifications"
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
                  title="Gérer vos notifications"
                  onClick={closeMenu}
                >
                  <BellRing size={20} />
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 rounded-md",
                      userButtonTrigger: "hover:bg-gray-100 rounded-md p-1 transition-colors"
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}