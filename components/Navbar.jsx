"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const navLinks = [
  { label: "How it works" },
  { label: "Validate" },
  { label: "FAQs" },
  { label: "Careers" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavTransitioning, setIsNavTransitioning] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navigateWithOverlay = (path, revealKey) => {
    if (isNavTransitioning) return;
    // Prevent overlay if navigating to the same path
    if (path === pathname) return;
    try {
      if (typeof window !== 'undefined' && revealKey) {
        sessionStorage.setItem(revealKey, '1');
      }
    } catch {}
    setIsNavTransitioning(true);
    setTimeout(() => {
      router.push(path);
    }, 500);
  };

  const scrollToId = (id) => {
    try {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch {}
  };

  const handleNavToHomeAnchor = (e, id) => {
    e.preventDefault();
    if (pathname === '/') {
      scrollToId(id);
    } else {
      try { sessionStorage.setItem('homeScrollTarget', id); } catch {}
      navigateWithOverlay('/', 'homeReveal');
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.__onavixNavOverlayNavigate = navigateWithOverlay;
      }
    } catch {}
    return () => {
      try {
        if (typeof window !== 'undefined' && window.__onavixNavOverlayNavigate === navigateWithOverlay) {
          delete window.__onavixNavOverlayNavigate;
        }
      } catch {}
    };
  }, [navigateWithOverlay]);

  // Clear overlay flag when route changes to ensure overlay is not stuck
  useEffect(() => {
    if (!isNavTransitioning) return;
    // Turn off overlay after navigation completes or pathname updates
    setIsNavTransitioning(false);
  }, [pathname]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b py-2.5 border-zinc-800 z-50 w-full">
        <div className="flex items-center justify-between h-[60px] px-6 lg:h-auto lg:px-0 lg:pl-[1.8rem] lg:gap-x-10 max-w-[66rem] mx-auto">
          <div className="flex items-center gap-x-4 flex-shrink-0">
            <Link href="/" onClick={(e) => { e.preventDefault(); navigateWithOverlay('/', 'homeReveal'); }} className="flex items-center gap-x-3">
              <div className="flex-shrink-0">
                <i className="ri-building-fill text-3xl"></i>
              </div>
              <span className="font-pop font-semibold text-xl text-white whitespace-nowrap">
                Proofly
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-x-8 whitespace-nowrap">
            {navLinks.map((link) => (
              <button key={link.label} onClick={(e) => {
                if (link.label === 'Careers') {
                  e.preventDefault();
                  // Placeholder for now - just prevent default
                  console.log('Careers clicked - placeholder for now');
                } else if (link.label === 'How it works') {
                  handleNavToHomeAnchor(e, 'how-it-works');
                } else if (link.label === 'Validate') {
                  e.preventDefault();
                  navigateWithOverlay('/validate', 'validateReveal');
                } else if (link.label === 'FAQs') {
                  handleNavToHomeAnchor(e, 'faqs');
                }
              }}>
                <span className="relative cursor-pointer font-medium hover:text-[#e3e3e3e1] text-white/95 font-pop transition-colors">
                  {link.label}
                </span>
              </button>
            ))}
          </div>

          <div className="hidden lg:block">
            <button
              onClick={() => navigateWithOverlay('/validate', 'validateReveal')}
              className="bg-[#ffffff] hover:bg-[#f5f5f5f5] font-medium cursor-pointer font-pop text-black px-6 py-[10.7px] rounded-full transition-colors whitespace-nowrap"
            >
              Get started
            </button>
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="bg-white text-black p-2 rounded-lg hover:bg-white/90 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-[380px] bg-[#050505]/95 backdrop-blur-xl border-l border-[#212121] transform transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-[#212121]">
            <span className="text-white font-pop font-semibold text-lg">
              Menu
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col p-6">
            {navLinks.map((link, index) => (
              <button
                key={link.label}
                onClick={(e) => {
                  setIsMenuOpen(false);
                  if (link.label === 'Careers') {
                    e.preventDefault();
                    // Placeholder for now
                    console.log('Careers clicked - placeholder for now');
                  } else if (link.label === 'How it works') {
                    handleNavToHomeAnchor(e, 'how-it-works');
                  } else if (link.label === 'Validate') {
                    e.preventDefault();
                    navigateWithOverlay('/validate', 'validateReveal');
                  } else if (link.label === 'FAQs') {
                    handleNavToHomeAnchor(e, 'faqs');
                  }
                }}
                className={`group py-4 border-b border-[#212121]/50 text-left w-full ${
                  index === navLinks.length - 1 ? "border-b-0" : ""
                }`}
              >
                <span className="text-xl font-pop text-white group-hover:text-[#e3e3e3] transition-colors flex items-center justify-between">
                  {link.label}
                  <span className="text-white/40 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </span>
              </button>
            ))}

            <button
              onClick={() => {
                setIsMenuOpen(false);
                navigateWithOverlay('/validate', 'validateReveal');
              }}
              className="mt-8 w-full bg-white hover:bg-[#f5f5f5f5] text-black font-pop font-medium py-4 rounded-full transition-colors"
            >
              Get started
            </button>
          </div>
        </div>
      </div>

      {isNavTransitioning && (
        <div className="route-overlay-enter" aria-hidden="true" />
      )}
      <style jsx>{`
        @keyframes route-fill-right {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .route-overlay-enter {
          position: fixed;
          inset: 0;
          background: #000;
          z-index: 1000;
          transform-origin: right;
          animation: route-fill-right 500ms ease-in-out forwards;
        }
      `}</style>
    </>
  );
};

export default Navbar;
