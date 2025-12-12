'use client';

import Image from 'next/image';
import { Phone, Instagram, Facebook, Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between w-full header px-6 md:px-[18%]">
      <div className="flex items-center justify-between w-full">
        
        {/* Right - Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/tadmit-logo.png"
              alt="תדמית אינטראקטיב"
              width={50}
              height={50}
              className="h-auto w-auto"
              priority
            />
          </Link>
        </div>

        {/* Center - Social Icons & Menu */}
        <div className="flex items-center gap-6">
          <a 
            href="tel:0542284283" 
            className="text-white hover:text-white/80 transition-colors" 
            aria-label="Phone"
          >
            <Phone className="w-6 h-6" />
          </a>
          <a 
            href="https://instagram.com/tadmit_interactive" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white hover:text-white/80 transition-colors" 
            aria-label="Instagram"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a 
            href="https://facebook.com/tadmitinteractive" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white hover:text-white/80 transition-colors" 
            aria-label="Facebook"
          >
            <Facebook className="w-6 h-6" />
          </a>
          
          {/* Menu Button - without border */}
          <button 
            onClick={onMenuClick}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
            id="menubtn"
          >
            <Menu className="w-5 h-5" />
            <span className="text-base font-medium">תפריט</span>
          </button>
        </div>
      </div>
    </header>
  );
}
