import { useState } from "react";
import Logo from "./Logo";

export default function TopNavBar({ onLoginClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Logo size="md" showText={true} />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Fonctionnalités
          </a>
          <a
            href="#benefits"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Avantages
          </a>
          <a
            href="#security"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Sécurité
          </a>
          <a
            href="#faq"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            FAQ
          </a>
          <button
            onClick={onLoginClick}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Connexion
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col gap-1"
        >
          <span className="w-6 h-0.5 bg-gray-800 block"></span>
          <span className="w-6 h-0.5 bg-gray-800 block"></span>
          <span className="w-6 h-0.5 bg-gray-800 block"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <a
            href="#features"
            className="block px-4 py-3 text-gray-600 hover:text-blue-600"
          >
            Fonctionnalités
          </a>
          <a
            href="#benefits"
            className="block px-4 py-3 text-gray-600 hover:text-blue-600"
          >
            Avantages
          </a>
          <a
            href="#security"
            className="block px-4 py-3 text-gray-600 hover:text-blue-600"
          >
            Sécurité
          </a>
          <a
            href="#faq"
            className="block px-4 py-3 text-gray-600 hover:text-blue-600"
          >
            FAQ
          </a>
          <button
            onClick={onLoginClick}
            className="w-full mx-4 mb-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Connexion
          </button>
        </div>
      )}
    </nav>
  );
}
