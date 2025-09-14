'use client';
import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';

const QuestionCard = React.memo(({ question, answer, index, setHoveredIndex, isOpen, toggleQuestion, updateHeight, onTransitionEnd, isLast, isMobile }) => {
    const cardRef = useRef(null);
    const contentRef = useRef(null);

    useLayoutEffect(() => {
        if (cardRef.current) {
            updateHeight(index, cardRef.current.offsetHeight, false);
        }
    }, [updateHeight, index]);

    useEffect(() => {
        const contentEl = contentRef.current;
        if (contentEl) {
            contentEl.style.maxHeight = isOpen
                ? `${contentEl.scrollHeight}px`
                : '0px';

            const handleTransitionEnd = () => {
                if (cardRef.current) {
                    updateHeight(index, cardRef.current.offsetHeight, isOpen);
                }
                if (onTransitionEnd) {
                    onTransitionEnd();
                }
            };

            contentEl.addEventListener('transitionend', handleTransitionEnd, { once: true });

            return () => {
                contentEl.removeEventListener('transitionend', handleTransitionEnd);
            };
        }
    }, [isOpen, index, updateHeight, onTransitionEnd]);

    return (
        <div
            ref={cardRef}
            className={`relative flex flex-col items-start py-5 px-6 w-full cursor-pointer ${!isLast ? 'border-b border-white/10' : ''} ${isOpen && isMobile ? 'bg-white/5' : ''}`}
            onMouseEnter={() => !isMobile && setHoveredIndex(index)}
            onMouseLeave={() => !isMobile && setHoveredIndex(null)}
            onClick={() => toggleQuestion(index)}
            data-index={index}
        >
            <div className="w-full flex items-center justify-between">
                <p className="md:text-2xl text-lg unselectable text-white/90 pr-4 w-fit font-inter">
                    {question}
                </p>
                <button className="rounded-full border border-white/20 text-white/90 leading-none w-8 h-8 min-w-8 min-h-8 flex-shrink-0 transition-transform duration-300 flex items-center justify-center">
                    <div
                        className="transition-transform duration-300"
                        style={{ transform: `rotate(${isOpen ? 45 : 0}deg)` }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                        </svg>
                    </div>
                </button>
            </div>
            <div
                ref={contentRef}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: '0px' }}
            >
                <p className="text-base text-[#a0a0a0] mt-3 pr-8">
                    {answer}
                </p>
            </div>
        </div>
    );
});
QuestionCard.displayName = 'QuestionCard';

const FaqSection = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [hoverStyle, setHoverStyle] = useState({});
    const [openQuestions, setOpenQuestions] = useState({});
    const [heights, setHeights] = useState({});
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef(null);
    const lastWindowSize = useRef({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
    });

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const questions = useMemo(() => [
        'How does blockchain verification ensure credential security?',
        'What happens if a university stops using the platform?',
        'Can students control what information employers see?',
        'How long does the validation process take?',
        'What if this website gets hacked or deleted?',
        'What if I lose access to my digital credentials?',
    ], []);
    
    const answers = useMemo(() => [
        "Each credential is cryptographically hashed and stored on the Polygon blockchain, creating an immutable record that cannot be altered or forged. The decentralized nature means no single entity can manipulate the data.",
        "Your credentials remain permanently accessible on the blockchain. Even if a university stops using our platform, the verification data stays intact and verifiable through the blockchain network.",
        "Absolutely. Students have complete control over their credential sharing. You can choose to share specific degrees, grades, or even portions of your academic record using secure QR codes or links.",
        "Verification is instant. Once a recruiter scans your QR code or enters your credential details, blockchain verification happens in seconds, compared to traditional methods that can take weeks.",
        "Your credentials are safe because they're stored on the decentralized Polygon blockchain network, not just on our website. Even if our website is compromised or deleted, your credentials remain permanently accessible through the blockchain. The verification data exists across thousands of nodes worldwide, making it virtually impossible to destroy.",
        "Your credentials are backed up across the blockchain network and accessible through multiple recovery methods. You'll never lose access to your academic achievements, even if you lose a device.",
    ], []);

    const updateHeight = useCallback((index, height, isOpen) => {
        setHeights((prev) => ({
            ...prev,
            [index]: { ...prev[index], [isOpen ? 'open' : 'closed']: height },
        }));
    }, []);

    const toggleQuestion = useCallback((index) => {
        setOpenQuestions((prev) => ({ ...prev, [index]: !prev[index] }));
    }, []);

    const updateHoverStyle = useCallback(() => {
        if (isMobile) return; // Skip hover effects on mobile
        
        if (hoveredIndex !== null && containerRef.current) {
            const card = containerRef.current.querySelector(`[data-index="${hoveredIndex}"]`);
            if (card) {
                const { offsetTop } = card;
                const isOpen = openQuestions[hoveredIndex];
                const height = isOpen
                    ? heights[hoveredIndex]?.open
                    : heights[hoveredIndex]?.closed;
                setHoverStyle({
                    top: `${offsetTop}px`,
                    height: `${height || card.offsetHeight}px`,
                    opacity: 1,
                });
            }
        } else {
            setHoverStyle({ opacity: 0 });
        }
    }, [hoveredIndex, openQuestions, heights, isMobile]);

    const handleCardTransitionEnd = useCallback(() => {
        if (!isMobile) {
            updateHoverStyle();
        }
    }, [updateHoverStyle, isMobile]);

    const recalculateHeights = useCallback(() => {
        if (containerRef.current) {
            const cards = containerRef.current.querySelectorAll('[data-index]');
            cards.forEach((card, index) => {
                const isOpen = openQuestions[index];
                const contentElement = card.querySelector('div[style*="max-height"]');
                
                // Temporarily set maxHeight to none to calculate full height
                if(contentElement) {
                    contentElement.style.maxHeight = 'none';
                }

                updateHeight(index, card.offsetHeight, true); // open height
                
                if (!isOpen && contentElement) {
                    contentElement.style.maxHeight = '0px';
                }

                const questionHeader = card.querySelector('div:first-child');
                if(questionHeader) {
                    updateHeight(index, questionHeader.offsetHeight + 2 * 20, false); // 20px for py-5
                }
            });
        }
    }, [openQuestions, updateHeight]);

    useEffect(() => {
        const handleResize = () => {
            const currentWidth = window.innerWidth;
            if (Math.abs(currentWidth - lastWindowSize.current.width) >= 10) {
                recalculateHeights();
                lastWindowSize.current = { width: currentWidth };
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [recalculateHeights]);

    useEffect(() => {
        if (!isMobile) {
            updateHoverStyle();
        }
    }, [updateHoverStyle, openQuestions, heights, isMobile]);

    return (
        <section className="py-24 sm:py-32">
            <div className="max-w-[86rem] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-[66rem] mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-inter font-bold text-4xl sm:text-5xl text-white mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg sm:text-lg text-[#b1b1b1] font-medium font-inter max-w-3xl mx-auto">
                            Get answers to common questions about blockchain credential verification.
                        </p>
                    </div>

                    <div className="flex w-full mx-auto justify-center">
                        <div className="flex-1 max-w-4xl relative">
                            <div ref={containerRef} className="w-full border border-white/10 rounded-2xl bg-[#0b0b0b]/60 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_10px_40px_rgba(0,0,0,0.35)]">
                                {/* Only show hover overlay on desktop */}
                                {!isMobile && (
                                    <div
                                        className={`absolute left-0 w-full bg-white/5 transition-all duration-300 ease-in-out ${hoveredIndex === 0 ? 'rounded-t-2xl' : hoveredIndex === questions.length - 1 ? 'rounded-b-2xl' : ''}`}
                                        style={hoverStyle}
                                    />
                                )}
                                {questions.map((question, index) => (
                                    <QuestionCard
                                        key={index}
                                        question={question}
                                        answer={answers[index]}
                                        index={index}
                                        setHoveredIndex={setHoveredIndex}
                                        isOpen={!!openQuestions[index]}
                                        toggleQuestion={toggleQuestion}
                                        updateHeight={updateHeight}
                                        onTransitionEnd={handleCardTransitionEnd}
                                        isLast={index === questions.length - 1}
                                        isMobile={isMobile}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FaqSection; 