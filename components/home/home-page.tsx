"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Moon, Sun, FileText, RefreshCw, Languages, Tag, Shield, Infinity, Zap, MousePointer, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { Playfair_Display } from "next/font/google";
import TestimonialsSection from "./testimonials-section";
import { AnimatedSection } from "@/components/ui/animated-section";
import { StaggeredGrid } from "@/components/ui/staggered-grid";
import { AnimatedLogo } from "@/components/ui/animated-logo";

// Font loaders must be at module scope
const headingFont = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });
import Link from "next/link";

export function HomePage() {
  const { theme, setTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#000000'
    }}>
      {/* Background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse-gradient" 
           style={{ 
             backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7' 
           }} />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse-gradient"
        style={{ 
          backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
          animationDelay: "1s" 
        }}
      />

      {/* Header */}
      <header className="relative z-10 container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between gap-3">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <img
              src="/123-removebg-preview.png"
              alt="Panna.ai"
              className={`w-10 h-10 object-contain ${theme === 'dark' ? 'invert' : ''}`}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = '1';
                  target.src = '/123-removebg-preview.jpg';
                }
              }}
            />
            <span className="text-xl font-bold" style={{ 
              color: theme === 'dark' ? '#ffffff' : '#000000',
              fontFamily: 'Inter, sans-serif'
            }}>Panna.ai</span>
          </div>

          {/* Center: Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#use-cases" className="text-sm font-medium hover:underline" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
              Features
            </Link>
            <Link href="#extension" className="text-sm font-medium hover:underline" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
              Extension
            </Link>
            <Link href="#reviews" className="text-sm font-medium hover:underline" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
              Reviews
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 p-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button
              variant="outline"
              className="hidden sm:inline-flex rounded-full px-4 py-2 text-sm"
              style={{ 
                borderColor: theme === 'dark' ? '#333333' : '#e5e5e5',
                color: theme === 'dark' ? '#ffffff' : '#000000',
                backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
                fontFamily: 'Inter, sans-serif'
              }}
              asChild
            >
              <Link href="/auth/signin">Log in</Link>
            </Button>

            <Button
              className="rounded-full px-4 py-2 text-sm font-medium sm:px-5"
              style={{ 
                backgroundColor: '#000000',
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif'
              }}
              asChild
            >
              <Link href="/auth/signup">
                Get Panna
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero section */}
          <AnimatedSection animation="fadeIn" delay={200}>
          <div className="space-y-6">
              <AnimatedSection animation="slideUp" delay={400}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
               style={{ 
                 backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
                 color: theme === 'dark' ? '#f2f2f2' : '#666666',
                 fontFamily: 'Inter, sans-serif'
               }}>
            <Sparkles className="h-4 w-4" />
            AI-Powered + Browser Extension
          </div>
              </AnimatedSection>

              <AnimatedSection animation="slideUp" delay={600}>
            <h1 className={`${headingFont.className} text-5xl md:text-7xl font-bold tracking-tight text-foreground`}>
              <span>Smart Notes</span>
              <br />
              <span>Made Simple</span>
            </h1>
              </AnimatedSection>

              <AnimatedSection animation="slideUp" delay={800}>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed text-muted-foreground">
              A beautiful, minimal note-taking app with AI-powered features and browser extension.
              Capture notes from anywhere and organize them seamlessly. Completely free and open source.
            </p>
              </AnimatedSection>
          </div>
          </AnimatedSection>

          {/* CTA buttons */}
          <AnimatedSection animation="scaleIn" delay={1000}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button
              size="lg"
              className="px-8 py-6 text-lg font-medium rounded-2xl"
              style={{ 
                backgroundColor: '#000000',
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif'
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              asChild
            >
              <Link href="/auth/signin">
                Start Taking Notes
                <ArrowRight
                  className={`ml-2 h-5 w-5 transition-transform ${
                    isHovered ? "translate-x-1" : ""
                  }`}
                />
              </Link>
            </Button>
          </div>
          </AnimatedSection>

          {/* Features */}
          <AnimatedSection animation="slideUp" delay={200}>
            <StaggeredGrid 
              className="grid md:grid-cols-3 gap-8 pt-20" 
              animation="scaleIn" 
              staggerDelay={150}
            >
              <div className="rounded-3xl p-8 text-center space-y-4 flex flex-col h-full" style={{ 
              backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
              border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e5e5'}`
            }}>
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" 
                   style={{ backgroundColor: '#000000' }}>
                <Sparkles className="h-8 w-8" style={{ color: '#ffffff' }} />
              </div>
              <h3 className="text-xl font-semibold" style={{ 
                color: theme === 'dark' ? '#ffffff' : '#000000',
                fontFamily: 'Inter, sans-serif'
              }}>AI-Powered</h3>
                <p className="flex-grow" style={{ 
                color: theme === 'dark' ? '#f2f2f2' : '#666666',
                fontFamily: 'Inter, sans-serif'
              }}>
                  Smart features to enhance your notes
              </p>
            </div>

            <div className="rounded-3xl p-8 text-center space-y-4 flex flex-col h-full" style={{ 
              backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
              border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e5e5'}`
            }}>
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" 
                   style={{ backgroundColor: '#000000' }}>
                <Shield className="h-8 w-8" style={{ color: '#ffffff' }} />
              </div>
              <h3 className="text-xl font-semibold" style={{ 
                color: theme === 'dark' ? '#ffffff' : '#000000',
                fontFamily: 'Inter, sans-serif'
              }}>Privacy First</h3>
              <p className="flex-grow" style={{ 
                color: theme === 'dark' ? '#f2f2f2' : '#666666',
                fontFamily: 'Inter, sans-serif'
              }}>
                Your notes are yours. Control what you share.
              </p>
            </div>

            <div className="rounded-3xl p-8 text-center space-y-4 flex flex-col h-full" style={{ 
              backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
              border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e5e5'}`
            }}>
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" 
                   style={{ backgroundColor: '#000000' }}>
                <Infinity className="h-8 w-8" style={{ color: '#ffffff' }} />
              </div>
              <h3 className="text-xl font-semibold" style={{ 
                color: theme === 'dark' ? '#ffffff' : '#000000',
                fontFamily: 'Inter, sans-serif'
              }}>Free Forever</h3>
              <p className="flex-grow" style={{ 
                color: theme === 'dark' ? '#f2f2f2' : '#666666',
                fontFamily: 'Inter, sans-serif'
              }}>
                No subscriptions, no limits, no costs
              </p>
            </div>
            </StaggeredGrid>
          </AnimatedSection>

          {/* AI Use Cases Section */}
          <AnimatedSection animation="slideUp" delay={200}>
          <div id="use-cases" className="pt-20">
              <AnimatedSection animation="fadeIn" delay={400}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                AI-Powered Features
              </h2>
              <p className="text-xl max-w-2xl mx-auto text-muted-foreground">
                Transform your notes with intelligent AI tools designed to enhance productivity
              </p>
            </div>
              </AnimatedSection>

              <StaggeredGrid 
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" 
                animation="slideUp" 
                staggerDelay={100}
              >
            <div className="rounded-2xl p-6 text-center space-y-4" style={{ 
                backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
                border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e5e5'}`
              }}>
                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center" 
                     style={{ backgroundColor: '#000000' }}>
                  <FileText className="h-6 w-6" style={{ color: '#ffffff' }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ 
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  fontFamily: 'Inter, sans-serif'
                }}>Summarize</h3>
                <p className="text-sm" style={{ 
                  color: theme === 'dark' ? '#f2f2f2' : '#666666',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Extract key points from long documents instantly
                </p>
              </div>

              <div className="rounded-2xl p-6 text-center space-y-4" style={{ 
                backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
                border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e5e5'}`
              }}>
                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center" 
                     style={{ backgroundColor: '#000000' }}>
                  <RefreshCw className="h-6 w-6" style={{ color: '#ffffff' }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ 
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  fontFamily: 'Inter, sans-serif'
                }}>Rephrase</h3>
                <p className="text-sm" style={{ 
                  color: theme === 'dark' ? '#f2f2f2' : '#666666',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Rewrite content in different styles and tones
                </p>
              </div>

              <div className="rounded-2xl p-6 text-center space-y-4" style={{ 
                backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
                border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e5e5'}`
              }}>
                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center" 
                     style={{ backgroundColor: '#000000' }}>
                  <Languages className="h-6 w-6" style={{ color: '#ffffff' }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ 
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  fontFamily: 'Inter, sans-serif'
                }}>Translate</h3>
                <p className="text-sm" style={{ 
                  color: theme === 'dark' ? '#f2f2f2' : '#666666',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Translate notes to multiple languages seamlessly
                </p>
              </div>

              <div className="rounded-2xl p-6 text-center space-y-4" style={{ 
                backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
                border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e5e5'}`
              }}>
                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center" 
                     style={{ backgroundColor: '#000000' }}>
                  <Tag className="h-6 w-6" style={{ color: '#ffffff' }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ 
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  fontFamily: 'Inter, sans-serif'
                }}>Auto-Tag</h3>
                <p className="text-sm" style={{ 
                  color: theme === 'dark' ? '#f2f2f2' : '#666666',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Automatically generate relevant tags for organization
                </p>
              </div>
              </StaggeredGrid>
            </div>
          </AnimatedSection>

          {/* Dashboard Preview Section */}
          <AnimatedSection animation="slideUp" delay={200}>
          <div id="preview" className="pt-20">
              <AnimatedSection animation="fadeIn" delay={400}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Clean & Intuitive Interface
              </h2>
              <p className="text-xl max-w-2xl mx-auto text-muted-foreground">
                Experience a three-panel layout with sidebar, notes list, and rich text editor
              </p>
            </div>
              </AnimatedSection>

              <AnimatedSection animation="scaleIn" delay={600}>
            <div className="relative max-w-7xl mx-auto px-4">
              <img 
                src="/demo.png" 
                alt="Panna.ai Dashboard - Three panel layout with notes, categories, and editor"
                className="w-full h-auto rounded-2xl shadow-2xl"
                style={{ 
                  maxHeight: '700px',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = '1';
                    target.src = '/placeholder.svg';
                  }
                }}
              />
            </div>
              </AnimatedSection>
          </div>
          </AnimatedSection>

          {/* Interactive Testimonials Section */}
          <TestimonialsSection />

          {/* Browser Extension Section */}
          <AnimatedSection animation="slideUp" delay={200}>
          <div id="extension" className="pt-20">
              <AnimatedSection animation="fadeIn" delay={400}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Capture Notes Anywhere
              </h2>
              <p className="text-xl max-w-2xl mx-auto text-muted-foreground">
                Save text from any website instantly with our powerful browser extension
              </p>
            </div>
              </AnimatedSection>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left: Extension Features */}
                <AnimatedSection animation="slideLeft" delay={600}>
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" 
                           style={{ backgroundColor: '#000000' }}>
                        <MousePointer className="h-6 w-6" style={{ color: '#ffffff' }} />
                </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2" style={{ 
                          color: theme === 'dark' ? '#ffffff' : '#000000',
                          fontFamily: 'Inter, sans-serif'
                        }}>Double-Click to Save</h3>
                        <p className="text-muted-foreground" style={{ 
                  fontFamily: 'Inter, sans-serif'
                }}>
                          Simply double-click any selected text on any website to instantly save it to your notes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" 
                       style={{ backgroundColor: '#000000' }}>
                        <Globe className="h-6 w-6" style={{ color: '#ffffff' }} />
                  </div>
                  <div>
                        <h3 className="text-xl font-semibold mb-2" style={{ 
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                      fontFamily: 'Inter, sans-serif'
                        }}>Works Everywhere</h3>
                        <p className="text-muted-foreground" style={{ 
                      fontFamily: 'Inter, sans-serif'
                        }}>
                          Compatible with all websites - news articles, research papers, social media, and more
                        </p>
                </div>
              </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" 
                       style={{ backgroundColor: '#000000' }}>
                        <Zap className="h-6 w-6" style={{ color: '#ffffff' }} />
                  </div>
                  <div>
                        <h3 className="text-xl font-semibold mb-2" style={{ 
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                      fontFamily: 'Inter, sans-serif'
                        }}>Real-time Sync</h3>
                        <p className="text-muted-foreground" style={{ 
                      fontFamily: 'Inter, sans-serif'
                        }}>
                          Notes appear instantly on your dashboard with automatic source attribution
                        </p>
                  </div>
                </div>
              </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90"
                      asChild
                    >
                      <Link href="/auth/signup">
                        Install Extension
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-6 py-3"
                      style={{ 
                        borderColor: theme === 'dark' ? '#333333' : '#e5e5e5',
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
                </AnimatedSection>

                {/* Right: Simple Extension Image */}
                <AnimatedSection animation="slideRight" delay={800}>
                <div className="flex justify-center">
                  <div className="w-80 h-64 rounded-2xl overflow-hidden shadow-lg" 
                       style={{ 
                backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
                border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e5e5'}`
              }}>
                    <img 
                      src="/Extension.png" 
                      alt="Panna.ai Browser Extension" 
                      className="w-full h-full object-contain"
                      style={{ 
                        filter: theme === 'dark' ? 'brightness(0.9)' : 'none'
                      }}
                    />
                  </div>
                </div>
                </AnimatedSection>
              </div>
            </div>
          </AnimatedSection>

          {/* Final CTA Section */}
          <AnimatedSection animation="slideUp" delay={200}>
          <div id="cta" className="pt-20">
              <AnimatedSection animation="fadeIn" delay={400}>
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                Ready to Transform
                <br />
                <span>Your Notes?</span>
              </h2>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-muted-foreground">
                Join thousands of users who are already using AI to enhance their productivity. 
                Start taking smarter notes today.
              </p>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="scaleIn" delay={600}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
                  asChild
                >
                  <Link href="/auth/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg"
                  style={{ 
                    borderColor: theme === 'dark' ? '#333333' : '#e5e5e5',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  asChild
                >
                  <Link href="/auth/signin">
                    Sign In
                  </Link>
                </Button>
              </div>
              </AnimatedSection>
            </div>
          </AnimatedSection>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-12 mt-20">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <img
              src="/123-removebg-preview.png"
              alt="Panna.ai"
              className={`w-8 h-8 object-contain ${theme === 'dark' ? 'invert' : ''}`}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = '1';
                  target.src = '/Panna.ai logo.png';
                }
              }}
            />
            <span className="font-semibold" style={{ 
              color: theme === 'dark' ? '#ffffff' : '#000000',
              fontFamily: 'Inter, sans-serif'
            }}>Panna.ai</span>
          </div>
        <p style={{ 
          color: theme === 'dark' ? '#f2f2f2' : '#666666',
          fontFamily: 'Inter, sans-serif'
        }}>
          Built with ❤️ by India
        </p>
          
        </div>
      </footer>

      {/* Animated Logo */}
      <AnimatedLogo />
    </div>
  );
}
