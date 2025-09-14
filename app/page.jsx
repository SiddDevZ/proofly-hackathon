'use client';

import Image from "next/image";
import Navbar from "../components/Navbar";
import { ShinyText } from "@/components/ShinyText";
import { AuroraText } from "@/components/magicui/aurora-text";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Particles } from "@/components/magicui/particles";
import { TextReveal } from "@/components/magicui/text-reveal";
import { ShieldCheck, Zap, Globe, DollarSign, User, GraduationCap } from "lucide-react";
import Reviews from "../components/Reviews";
import FaqSection from "../components/FaqSection";
import Footer from "../components/Footer";

const howItWorksSteps = [
  {
    title: 'University Issues',
    description: 'Universities issue credentials hashed on the Polygon blockchain, making them tamper-proof and verifiable forever.',
  },
  {
    title: 'Student Stores & Shares',
    description: 'Students keep all credentials in a secure digital vault, with the option to selectively share details using QR codes or secure links.',
  },
  {
    title: 'Recruiter Verifies',
    description: 'Recruiters scan or upload a credential, the system checks its hash on the blockchain, providing instant fraud-proof verification.',
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Tamper-Proof Security',
    description: 'Blockchain technology ensures credentials can never be forged, altered, or falsified. Once issued, they\'re permanently verified and secure.',
  },
  {
    icon: Zap,
    title: 'Instant Verification',
    description: 'No more waiting days or weeks for credential verification. Get results in seconds with our blockchain-powered verification system.',
  },
  {
    icon: Globe,
    title: 'Global Recognition',
    description: 'Works seamlessly across borders and institutions. Your credentials are recognized and verifiable anywhere in the world.',
  },
  {
    icon: DollarSign,
    title: 'Cost Effective',
    description: 'Eliminate expensive manual verification processes. Reduce administrative costs while increasing efficiency and accuracy.',
  },
  {
    icon: User,
    title: 'Student Ownership',
    description: 'Students maintain complete control over their credentials. Share what you want, when you want, with full privacy protection.',
  },
  {
    icon: GraduationCap,
    title: 'University Authority',
    description: 'Universities remain the trusted source of truth. Our platform enhances their authority while streamlining the verification process.',
  },
];

export default function Home() {
  const stepsRef = useRef(null);
  const [fillHeight, setFillHeight] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navigateWithOverlay = (path, revealKey) => {
    if (isTransitioning) return;
    // Prevent overlay if navigating to the same path
    if (path === pathname) return;
    try {
      if (typeof window !== 'undefined' && revealKey) {
        sessionStorage.setItem(revealKey, '1');
      }
    } catch {}
    setIsTransitioning(true);
    setTimeout(() => {
      router.push(path);
    }, 500);
  };

  useEffect(() => {
    const updateFill = () => {
      if (!stepsRef.current) return;
      const rect = stepsRef.current.getBoundingClientRect();
      const viewportMid = window.innerHeight / 2;
      const containerTop = rect.top;
      const containerHeight = rect.height;
      const raw = viewportMid - containerTop;
      const clamped = Math.max(0, Math.min(containerHeight, raw));
      setFillHeight(clamped);
    };

    updateFill();
    window.addEventListener('scroll', updateFill, { passive: true });
    window.addEventListener('resize', updateFill);
    return () => {
      window.removeEventListener('scroll', updateFill);
      window.removeEventListener('resize', updateFill);
    };
  }, []);

  // Clear overlay flag when route changes
  useEffect(() => {
    if (!isTransitioning) return;
    setIsTransitioning(false);
  }, [pathname]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen mb-[1rem] w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full mx-auto text-center mt-[10rem]">
          <div className="flex justify-center">
            <ShinyText />
          </div>

          <div className="mt-4 mb-4">
            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-inter font-bold leading-[1.12]">
              Validate credentials
              <br />
              in record time
            </h1>
          </div>

          <div className="max-w-3xl mt-4 mb-4 mx-auto">
            <p className="text-sm sm:text-lg font-inter font-medium text-gray-300 leading-relaxed">
              Blockchain-powered platform for academic credential verification, built on the Polygon Network.
              Universities issue tamper-proof certificates, recruiters verify instantly, 
              and students own their achievements forever.
            </p>
          </div>

          <div className="flex mt-8 mb-4 flex-col sm:flex-row gap-4 justify-center items-center">
            <RainbowButton 
              variant="outline" 
              size="lg" 
              onClick={() => navigateWithOverlay('/student/login', 'studentReveal')}
              className="pl-10 pr-8 text-base items-center font-medium bg-white text-black hover:scale-[1.03] transition-all duration-200"
            >
              For Students
              <svg className="ml-1 w-4 h-4 self-center mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </RainbowButton>
            
            <button 
              onClick={() => navigateWithOverlay('/university/login', 'universityReveal')}
              className="group cursor-pointer relative inline-flex items-center justify-center pl-10 pr-8 text-base font-medium text-white bg-transparent border-2 border-[#414141] hover:scale-[1.03] transition-all duration-200  h-11 rounded-xl"
            >
              For Universities
              <svg className="ml-1 w-4 h-4 self-center mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="w-full max-w-6xl mx-auto mt-16 px-4 bg-[#000000] sm:px-6 lg:px-8">
          <div className="aspect-video w-full border-2 border-[#1a1a1a] rounded-xl overflow-hidden">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/video-1757807389390.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        <div className="max-w-4xl w-full mx-auto">
          <div className="pt-24">
            <div className="text-center mb-6">
              <p className=" font-inter text-[#929292]">Trusted by leading institutions & top companies</p>
            </div>
            <div className="flex flex-wrap sm:-translate-y-10 justify-center items-center gap-8 opacity-70">
              <Image 
                src="/universities/ox.png" 
                alt="Oxford University" 
                width={120} 
                height={40}
                className="filter brightness-0 invert hover:opacity-100 transition-all duration-200"
              />
                        
              <Image 
                src="/universities/sequoia.png" 
                alt="Sequoia Capital" 
                width={120} 
                height={40}
                className="filter brightness-0 invert hover:opacity-100 transition-all duration-200"
              />
              
              <Image 
                src="/universities/accel.png" 
                alt="Accel Partners" 
                width={80} 
                height={40}
                className="filter brightness-0 invert hover:opacity-100 transition-all duration-200"
              />

              <Image 
                src="/universities/mic.webp" 
                alt="Y Combinator" 
                width={120} 
                height={40}
                className="filter brightness-0 invert hover:opacity-100 transition-all duration-200"
              />

              <Image 
                src="/universities/google.webp" 
                alt="Google" 
                width={80} 
                height={40}
                className="filter brightness-0 invert hover:opacity-100 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <div className="w-full dark max-w-[80rem] mx-auto mt-16 ">
          <TextReveal>Trust in education should be simple. universities stay the source of truth, students own their achievements, and recruiters verify instantly.</TextReveal>
        </div>


        {/* How it Works Section */}
        <section id="how-it-works" className="relative py-24 sm:py-36">
          <div className="max-w-[86rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-6 max-w-[600px]">
                <div className="lg:sticky top-24">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.9rem] text-white/80">
                    <span>How it works</span>
                  </div>
                  <h2 className="mt-4 font-inter font-bold text-4xl sm:text-5xl lg:text-5xl leading-tight text-white">
                    Three simple steps to secure verification
                  </h2>
                  <p className="mt-3 text-lg sm:text-xl text-gray-300 max-w-xl">
                    Our blockchain-powered platform makes credential verification seamless, secure, and instant for everyone involved.
                  </p>
                  <div className="mt-6">
                    <RainbowButton 
                      variant="outline" 
                      size="lg" 
                      onClick={() => navigateWithOverlay('/validate', 'validateReveal')}
                      className="pl-8 pr-6 text-base items-center font-medium bg-white text-black hover:scale-[1.03] transition-all duration-200"
                    >
                      Get Started
                      <svg className="ml-1 w-4 h-4 self-center mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </RainbowButton>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 relative" ref={stepsRef}>
                <div className="hidden sm:block absolute left-[22px] top-0 bottom-0 w-[3px] bg-white/10 rounded-full z-0" aria-hidden="true" />
                <div className="hidden sm:block absolute left-[22px] top-0 w-[3px] bg-[#fbda02] rounded-full z-0" style={{ height: fillHeight }} aria-hidden="true" />
                <ul className="space-y-8">
                  {howItWorksSteps.map((step, idx) => (
                    <li key={idx} className="relative pl-0 sm:pl-20">
                      <div className="absolute left-0 top-3 hidden sm:flex items-center justify-center h-11 w-11 rounded-full bg-[#fbda02] text-black font-inter font-bold text-lg ring-1 ring-black/10 shadow-[0_6px_20px_rgba(251,218,2,0.20)]">
                        {String(idx + 1)}
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_10px_40px_rgba(0,0,0,0.35)] hover:border-white/20 transition-colors duration-300">
                        <h3 className="font-dm-sans font-bold text-2xl text-white">{step.title}</h3>
                        <p className="mt-1.5 text-base font-dm-sans font-medium leading-relaxed text-gray-300">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-24 sm:py-32">
          <div className="max-w-[86rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-inter font-bold text-4xl sm:text-5xl text-white mb-4">
                Why choose our platform?
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
                Built for the future of education verification, designed for simplicity and trust.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="text-left">
                    <div className="w-14 h-14 rounded-xl bg-[#fbda02]/10 flex items-center justify-center mb-6">
                      <IconComponent className="w-7 h-7 text-[#fbda02]" />
                    </div>
                    <h3 className="font-dm-sans font-bold text-2xl text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-base font-dm-sans text-[#bfbfbf] font-medium leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="relative py-24 sm:py-32">
          <div className="max-w-[78rem] mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-inter font-bold text-4xl sm:text-5xl text-white mb-4">
                Trusted by leading institutions worldwide
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
                Universities, recruiters, and students around the globe trust our platform for secure, instant credential verification.
              </p>
            </div>
            <Reviews />
          </div>
        </section>

        <FaqSection />
      </div>
      
      <Footer />
      
      <Particles
          className="absolute inset-0 -z-10"
          quantity={100}
          ease={80}
          color={"#bdbdbd"}
          refresh
        />

      {isTransitioning && (
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
}
