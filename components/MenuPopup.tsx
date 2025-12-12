'use client';

import { X } from 'lucide-react';
import Link from 'next/link';

interface MenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuPopup({ isOpen, onClose }: MenuPopupProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white p-12 rounded-lg max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-500 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <nav className="flex flex-col gap-6 text-right">
          <Link 
            href="/" 
            className="text-2xl font-bold text-black hover:text-pink-500 transition-colors"
            onClick={onClose}
          >
            בית
          </Link>
          <Link 
            href="/about" 
            className="text-2xl font-bold text-black hover:text-pink-500 transition-colors"
            onClick={onClose}
          >
            אודות
          </Link>
          <Link 
            href="/portfolio" 
            className="text-2xl font-bold text-black hover:text-pink-500 transition-colors"
            onClick={onClose}
          >
            תיק עבודות
          </Link>
          <Link 
            href="/testimonials" 
            className="text-2xl font-bold text-black hover:text-pink-500 transition-colors"
            onClick={onClose}
          >
            ממליצים עלינו
          </Link>
          <Link 
            href="#contact" 
            className="text-2xl font-bold text-black hover:text-pink-500 transition-colors"
            onClick={onClose}
          >
            יצירת קשר
          </Link>
        </nav>
      </div>
    </div>
  );
}

