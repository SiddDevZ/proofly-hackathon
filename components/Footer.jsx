"use client";

import "remixicon/fonts/remixicon.css";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#050505] text-white/80 font-inter">
      <div className="max-w-[86rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex flex-col gap-2 text-left">
            <div className="flex gap-3 items-center">
              <div className="flex-shrink-0">
                <i className="ri-building-fill text-3xl"></i>
              </div>
              <span className="font-semibold text-2xl font-inter text-white">
                Proofly
              </span>
            </div>
            <p className="text-base font-inter font-medium text-white/60 mt-0.5">
              © {new Date().getFullYear()} Proofly. All rights reserved.
            </p>
          </div>
          
          <div className="gap-8 sm:flex hidden">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-white mb-2">Platform</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="#"
                    className="hover:text-white/95 text-[#a8a8a8] font-medium transition-colors"
                  >
                    For Students
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-white/95 text-[#a8a8a8] font-medium transition-colors"
                  >
                    For Universities
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-white/95 text-[#a8a8a8] font-medium transition-colors"
                  >
                    For Recruiters
                  </Link>
                </li>
              </ul>
            </div>
            
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-8">
            <div className="flex sm:items-center gap-4">
              <Link
                href="#"
                className="text-white/60 hover:text-white transition-colors"
              >
                <i className="ri-twitter-x-fill text-3xl"></i>
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-white transition-colors"
              >
                <i className="ri-linkedin-box-fill text-3xl"></i>
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-white transition-colors"
              >
                <i className="ri-github-fill text-3xl"></i>
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-white transition-colors"
              >
                <i className="ri-mail-line text-3xl"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 