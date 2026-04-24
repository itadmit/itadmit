'use client';

import { useEffect, useState } from 'react';
import {
  X,
  Phone,
  Instagram,
  Facebook,
  MessageCircle,
  Mail,
  ArrowUpLeft,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface MenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const LINKS = [
  { href: '/', label: 'בית' },
  { href: '#more-projects', label: 'תיק עבודות' },
  { href: '#contact', label: 'יצירת קשר' },
  {
    href: 'https://api.whatsapp.com/send/?phone=972542284283&text=' +
      encodeURIComponent('היי, הגעתי מהאתר ואשמח להצעת מחיר.'),
    label: 'הצעת מחיר',
    external: true,
  },
];

export default function MenuPopup({ isOpen, onClose }: MenuPopupProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
      const t = window.setTimeout(() => setShow(true), 20);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = '';
      };
    }
    setShow(false);
    const t = window.setTimeout(() => setMounted(false), 420);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-[420ms] ease-out ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="תפריט ראשי"
    >
      {/* Background */}
      <div
        aria-hidden
        className="absolute inset-0 backdrop-blur-xl"
        style={{
          background:
            'radial-gradient(1100px 550px at 82% -10%, rgba(37,211,102,0.22), transparent 60%), radial-gradient(900px 500px at -10% 110%, rgba(0,128,105,0.22), transparent 60%), linear-gradient(180deg, #0b1220 0%, #050810 100%)',
        }}
      />

      {/* Decorative grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage:
            'radial-gradient(ellipse at center, black 35%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 35%, transparent 75%)',
        }}
      />

      {/* Content wrapper — clicking backdrop closes */}
      <div
        className="relative flex h-full w-full flex-col px-5 py-5 md:px-12 md:py-8"
        onClick={onClose}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(-8px)',
            transition: 'opacity 400ms ease 60ms, transform 400ms ease 60ms',
          }}
        >
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 text-white"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_4px_18px_-4px_rgba(16,185,129,0.5)]">
              <Image
                src="/images/tadmit-logo.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
            </span>
            <span className="hidden leading-tight sm:flex sm:flex-col">
              <span className="text-[14px] font-semibold">תדמית אינטראקטיב</span>
              <span className="text-[11px] text-white/55">בניית אתרים וחנויות</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-white/35 hover:bg-white/10"
            aria-label="סגור תפריט"
          >
            <X className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
          </button>
        </div>

        {/* Nav — big staggered links */}
        <nav
          className="relative mt-10 flex flex-1 flex-col justify-center gap-2 md:mt-0 md:gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300/70 md:mb-4"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 400ms ease 120ms, transform 400ms ease 120ms',
            }}
          >
            — תפריט
          </div>

          {LINKS.map((link, i) => {
            const commonClass =
              'group relative inline-flex w-fit items-baseline gap-3 py-1 md:gap-5';
            const style = {
              opacity: show ? 1 : 0,
              transform: show ? 'translateX(0)' : 'translateX(-24px)',
              transition: `opacity 520ms cubic-bezier(0.2, 1, 0.3, 1) ${180 + i * 70}ms, transform 520ms cubic-bezier(0.2, 1, 0.3, 1) ${180 + i * 70}ms`,
            };

            const inner = (
              <>
                <span className="font-mono text-[11px] text-white/35 md:text-xs">
                  0{i + 1}
                </span>
                <span className="relative text-[44px] font-black leading-[1.05] text-white transition-colors duration-300 group-hover:text-emerald-300 md:text-[72px] lg:text-[84px]">
                  {link.label}
                  <span className="absolute inset-x-0 -bottom-1 h-[3px] origin-right scale-x-0 rounded-full bg-gradient-to-l from-emerald-400 to-teal-300 transition-transform duration-500 group-hover:scale-x-100" />
                </span>
                <ArrowUpLeft className="h-5 w-5 -translate-x-1 text-white/40 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:h-6 md:w-6" />
              </>
            );

            if (link.external) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className={commonClass}
                  style={style}
                >
                  {inner}
                </a>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={commonClass}
                style={style}
              >
                {inner}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="mt-auto flex flex-col gap-5 border-t border-white/10 pt-5 md:flex-row md:items-end md:justify-between"
          onClick={(e) => e.stopPropagation()}
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(12px)',
            transition:
              'opacity 500ms ease 460ms, transform 500ms ease 460ms',
          }}
        >
          <div className="flex flex-col gap-1.5">
            <a
              href="tel:0542284283"
              className="inline-flex items-center gap-2 text-[14px] text-white/85 transition hover:text-white"
            >
              <Phone className="h-4 w-4 text-emerald-300" />
              054-228-4283
            </a>
            <a
              href="mailto:itadmit@gmail.com"
              className="inline-flex items-center gap-2 text-[14px] text-white/85 transition hover:text-white"
            >
              <Mail className="h-4 w-4 text-emerald-300" />
              itadmit@gmail.com
            </a>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://api.whatsapp.com/send/?phone=972542284283"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition hover:border-[#25D366]/60 hover:bg-[#25D366]/20 hover:text-white"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com/tadmit_interactive"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition hover:border-pink-400/60 hover:bg-pink-500/15 hover:text-white"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com/tadmitinteractive"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition hover:border-[#1877f2]/60 hover:bg-[#1877f2]/20 hover:text-white"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
