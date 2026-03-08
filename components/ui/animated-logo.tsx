"use client";

import { useState, useEffect, useRef } from 'react';
import { useTheme } from "next-themes";
import { X, MessageCircle, HelpCircle, Send, Sparkles } from 'lucide-react';

interface AnimatedLogoProps {
  onLogoClick?: () => void;
}

export function AnimatedLogo({ onLogoClick }: AnimatedLogoProps) {
  const { theme } = useTheme();
  const [isFalling, setIsFalling] = useState(false);
  const [isAtRest, setIsAtRest] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: -100 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [showFAQ, setShowFAQ] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hi! I\'m the Panna.ai FAQ Bot! Ask me anything about our note-taking app! 🤖✨'
    }
  ]);
  const logoRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(undefined);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Physics constants
  const GRAVITY = 0.8;
  const BOUNCE_DAMPING = 0.7;
  const FRICTION = 0.98;
  const ROTATION_SPEED = 0.1;

  // Start falling animation
  const startFalling = () => {
    setIsFalling(true);
    setIsAtRest(false);
    setShowFAQ(false); // Close FAQ bot when logo falls again
    
    // Only fall on the sides (left 20% or right 20% of screen)
    const screenWidth = window.innerWidth;
    const sideWidth = screenWidth * 0.2; // 20% of screen width for each side
    const isLeftSide = Math.random() < 0.5;
    
    const x = isLeftSide 
      ? Math.random() * sideWidth 
      : screenWidth - sideWidth + Math.random() * sideWidth;
    
    setPosition({ x, y: -100 });
    setVelocity({ 
      x: (Math.random() - 0.5) * 8, // Reduced horizontal velocity
      y: 0 
    });
    setRotation(0);
  };

  // Animation loop
  useEffect(() => {
    if (!isFalling) return;

    const animate = () => {
      setPosition(prev => {
        const newX = prev.x + velocity.x;
        const newY = prev.y + velocity.y;
        
        // Check boundaries - keep logo on sides only
        const screenWidth = window.innerWidth;
        const sideWidth = screenWidth * 0.2;
        const maxX = sideWidth - 50; // Keep within left side
        const rightMinX = screenWidth - sideWidth;
        const maxY = window.innerHeight - 100;
        
        let newVelX = velocity.x;
        let newVelY = velocity.y + GRAVITY;
        
        // Bounce off walls - keep within side boundaries
        if (newX <= 0 || newX >= maxX) {
          newVelX *= -BOUNCE_DAMPING;
        }
        
        // If logo drifts to middle, push it back to sides
        if (newX > maxX && newX < rightMinX) {
          newVelX = newX < screenWidth / 2 ? -Math.abs(newVelX) : Math.abs(newVelX);
        }
        
        // Bounce off bottom
        if (newY >= maxY) {
          newVelY *= -BOUNCE_DAMPING;
          newVelY = Math.max(newVelY, -15); // Prevent infinite bouncing
        }
        
        // Apply friction
        newVelX *= FRICTION;
        
        // Check if at rest
        if (Math.abs(newVelY) < 0.5 && newY >= maxY - 10) {
          setIsFalling(false);
          setIsAtRest(true);
          setVelocity({ x: 0, y: 0 });
        } else {
          setVelocity({ x: newVelX, y: newVelY });
        }
        
        // Constrain to sides only
        let constrainedX = newX;
        if (newX > maxX && newX < rightMinX) {
          constrainedX = newX < screenWidth / 2 ? maxX : rightMinX;
        } else if (newX >= rightMinX) {
          constrainedX = Math.min(newX, screenWidth - 50);
        }
        
        return {
          x: Math.max(0, Math.min(constrainedX, screenWidth - 50)),
          y: Math.max(0, Math.min(newY, maxY))
        };
      });
      
      setRotation(prev => prev + ROTATION_SPEED);
      
      if (isFalling) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isFalling, velocity]);

  // Start falling on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      startFalling();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Listen for scroll events to trigger falling again
  useEffect(() => {
    const handleScroll = () => {
      // Don't fall if FAQ bot is open - let users read/use it without interruption
      if (isAtRest && !showFAQ && window.scrollY > 100) {
        startFalling();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAtRest, showFAQ]);

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      setShowFAQ(!showFAQ); // Toggle FAQ bot open/close
    }
  };

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      // Use smooth scrolling
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Auto-scroll when FAQ bot opens
  useEffect(() => {
    if (showFAQ) {
      // Small delay to ensure the popup is rendered
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [showFAQ]);

  // Close FAQ bot when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFAQ && logoRef.current && !logoRef.current.contains(event.target as Node)) {
        // Check if click is not on the FAQ popup itself
        const faqPopup = document.querySelector('[data-faq-popup]');
        if (faqPopup && !faqPopup.contains(event.target as Node)) {
          setShowFAQ(false);
        }
      }
    };

    if (showFAQ) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFAQ]);

  // FAQ responses
  const faqResponses: { [key: string]: string } = {
    'what is panna': 'Panna.ai is a free, AI-powered note-taking app that helps you organize, summarize, and enhance your notes with intelligent features like auto-tagging, translation, and content rephrasing!',
    'is it free': 'Yes! Panna.ai is completely free forever with no hidden costs, subscriptions, or limits. We believe everyone should have access to powerful note-taking tools.',
    'ai features': 'We offer amazing AI features including: document summarization, content rephrasing, multi-language translation, and automatic tag generation for better organization!',
    'how to start': 'Getting started is super easy! Just sign up for free (no credit card required) and start taking notes immediately. You can also try our browser extension for quick capture!',
    'privacy': 'Your privacy is our top priority! All your notes are encrypted and secure. You have complete control over your data and what you choose to share.',
    'browser extension': 'Yes! We have a browser extension that lets you quickly capture notes from any webpage. Right-click to save text or use the popup for quick notes!',
    'mobile app': 'Currently we\'re web-based, but we\'re working on mobile apps! The web version works great on mobile browsers in the meantime.',
    'collaboration': 'Right now Panna.ai is focused on personal note-taking, but we\'re exploring collaboration features for the future!',
    'data export': 'Yes! You can export your notes in various formats including Markdown, PDF, and plain text. Your data is always yours.',
    'support': 'We\'re here to help! You can reach us at support@panna.ai or join our community for tips and updates.'
  };

  const getBotResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    for (const [key, response] of Object.entries(faqResponses)) {
      if (lowerQuestion.includes(key)) {
        return response;
      }
    }
    
    return 'That\'s a great question! While I don\'t have a specific answer for that, feel free to contact our support team at support@panna.ai. They\'re super helpful! 😊';
  };

  const handleSendMessage = () => {
    if (!userQuestion.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user' as const,
      message: userQuestion
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    // Get bot response
    const botResponse = getBotResponse(userQuestion);
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot' as const,
      message: botResponse
    };
    
    // Add bot response after a short delay
    setTimeout(() => {
      setChatMessages(prev => [...prev, botMessage]);
    }, 800);
    
    setUserQuestion('');
  };

  return (
    <>
      {/* Animated Logo - Desktop Only */}
      <div
        ref={logoRef}
        className={`hidden md:block fixed z-50 cursor-pointer transition-all duration-300 ${
          isAtRest ? 'hover:scale-110' : ''
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `rotate(${rotation}deg)`,
          transition: isFalling ? 'none' : 'all 0.3s ease'
        }}
        onClick={handleLogoClick}
      >
        <div className="relative">
          <img
            src="/123-removebg-preview.png"
            alt="Panna.ai"
            className={`w-16 h-16 object-contain transition-all duration-300 ${
              theme === 'dark' ? 'invert' : ''
            } ${isAtRest ? 'drop-shadow-lg' : 'drop-shadow-2xl'}`}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.dataset.fallback) {
                target.dataset.fallback = '1';
                target.src = '/123-removebg-preview.jpg';
              }
            }}
          />
          
          {/* Glow effect when at rest */}
          {isAtRest && (
            <div 
              className="absolute inset-0 rounded-full opacity-20 animate-pulse blur-md -z-10"
              style={{ backgroundColor: theme === 'dark' ? '#ffffff' : '#000000' }}
            />
          )}
          
          {/* Bounce indicator when at rest */}
          {isAtRest && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div 
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: theme === 'dark' ? '#ffffff' : '#000000' }}
              />
            </div>
          )}
          
          {/* Click indicator when at rest */}
          {isAtRest && (
            <div 
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
            >
              {showFAQ ? 'Click outside to close' : 'Click me!'}
            </div>
          )}
        </div>
      </div>

          {/* FAQ Bot Popup */}
          {showFAQ && (
            <div className="fixed z-50" style={{
              left: position.x < window.innerWidth / 2 
                ? `${Math.min(position.x + 70, window.innerWidth - 330)}px` // Right side of logo with 70px spacing
                : `${Math.max(position.x - 330, 20)}px`, // Left side of logo with 20px margin
              top: `${Math.min(Math.max(position.y - 150, 20), window.innerHeight - 420)}px`
            }}>
          <div 
            data-faq-popup
            className="rounded-2xl shadow-2xl w-80 max-h-96 overflow-hidden border"
            style={{
              backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
              borderColor: theme === 'dark' ? '#333333' : '#e5e5e5'
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{
                borderColor: theme === 'dark' ? '#333333' : '#e5e5e5'
              }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#000000' }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: '#ffffff' }} />
                </div>
                <div>
                  <h3 
                    className="text-sm font-semibold"
                    style={{ 
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    FAQ Bot
                  </h3>
                  <p 
                    className="text-xs"
                    style={{ 
                      color: theme === 'dark' ? '#f2f2f2' : '#666666',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    Ask me anything!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFAQ(false)}
                className="p-1 rounded-full transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: theme === 'dark' ? '#f2f2f2' : '#666666'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#333333' : '#f0f0f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="p-3 space-y-3 max-h-48 overflow-y-auto scroll-smooth"
            >
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[85%] p-2 rounded-xl"
                    style={{
                      backgroundColor: message.type === 'user' 
                        ? '#000000' 
                        : theme === 'dark' ? '#333333' : '#ffffff',
                      color: message.type === 'user' 
                        ? '#ffffff' 
                        : theme === 'dark' ? '#ffffff' : '#000000',
                      border: message.type === 'bot' 
                        ? `1px solid ${theme === 'dark' ? '#444444' : '#e5e5e5'}` 
                        : 'none'
                    }}
                  >
                    <p 
                      className="text-xs"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {message.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Questions */}
            <div className="px-3 pb-2">
              <div className="flex flex-wrap gap-1">
                {['What is Panna.ai?', 'Is it free?', 'AI features?', 'How to start?'].map((question) => (
                  <button
                    key={question}
                    onClick={() => setUserQuestion(question)}
                    className="px-2 py-1 text-xs rounded-full transition-colors"
                    style={{
                      backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
                      color: theme === 'dark' ? '#f2f2f2' : '#666666',
                      border: `1px solid ${theme === 'dark' ? '#444444' : '#e5e5e5'}`,
                      fontFamily: 'Inter, sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#444444' : '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#333333' : '#ffffff';
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div 
              className="p-3 border-t"
              style={{
                borderColor: theme === 'dark' ? '#333333' : '#e5e5e5'
              }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-2 py-1 text-xs rounded-lg focus:outline-none transition-colors"
                  style={{
                    backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    border: `1px solid ${theme === 'dark' ? '#444444' : '#e5e5e5'}`,
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#000000';
                    e.target.style.boxShadow = '0 0 0 2px rgba(0, 0, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme === 'dark' ? '#444444' : '#e5e5e5';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  className="px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                  style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#333333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#000000';
                  }}
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div 
              className="p-2 border-t"
              style={{
                borderColor: theme === 'dark' ? '#333333' : '#e5e5e5',
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f9f9f9'
              }}
            >
              <div 
                className="flex items-center gap-1 text-xs"
                style={{
                  color: theme === 'dark' ? '#f2f2f2' : '#666666',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                <HelpCircle className="w-3 h-3" />
                <span>Need help? Contact support@panna.ai</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
