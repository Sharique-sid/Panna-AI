"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Moon, Sun, FileText, RefreshCw, Languages, Tag } from "lucide-react";
import { useTheme } from "next-themes";
import { Playfair_Display } from "next/font/google";

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
              Use cases
            </Link>
            <Link href="#features" className="text-sm font-medium hover:underline" style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
              Resources
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
          <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
               style={{ 
                 backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
                 color: theme === 'dark' ? '#f2f2f2' : '#666666',
                 fontFamily: 'Inter, sans-serif'
               }}>
            <Sparkles className="h-4 w-4" />
            AI-Powered & Free Forever
          </div>

            <h1 className={`${headingFont.className} text-5xl md:text-7xl font-bold tracking-tight text-foreground`}>
              <span>Smart Notes</span>
              <br />
              <span>Made Simple</span>
            </h1>

            <p className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed text-muted-foreground">
              A beautiful, minimal note-taking app with AI-powered features.
              Completely free and open source.
            </p>
          </div>

          {/* CTA buttons */}
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

          {/* Features */}
          <div id="features" className="grid md:grid-cols-3 gap-8 pt-20">
            <div className="rounded-3xl p-8 text-center space-y-4" style={{ 
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
              <p style={{ 
                color: theme === 'dark' ? '#f2f2f2' : '#666666',
                fontFamily: 'Inter, sans-serif'
              }}>
                Smart features to enhance your note-taking experience
              </p>
            </div>

            <div className="rounded-3xl p-8 text-center space-y-4" style={{ 
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
              }}>Privacy First</h3>
              <p style={{ 
                color: theme === 'dark' ? '#f2f2f2' : '#666666',
                fontFamily: 'Inter, sans-serif'
              }}>
                Your notes are yours. Control what you share.
              </p>
            </div>

            <div className="rounded-3xl p-8 text-center space-y-4" style={{ 
              backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
              border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e5e5'}`
            }}>
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" 
                   style={{ backgroundColor: '#000000' }}>
                <span className="text-2xl font-bold" style={{ color: '#ffffff' }}>∞</span>
              </div>
              <h3 className="text-xl font-semibold" style={{ 
                color: theme === 'dark' ? '#ffffff' : '#000000',
                fontFamily: 'Inter, sans-serif'
              }}>Free Forever</h3>
              <p style={{ 
                color: theme === 'dark' ? '#f2f2f2' : '#666666',
                fontFamily: 'Inter, sans-serif'
              }}>
                No subscriptions, no limits, no hidden costs
              </p>
            </div>
          </div>

          {/* AI Use Cases Section */}
          <div id="use-cases" className="pt-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                AI-Powered Features
              </h2>
              <p className="text-xl max-w-2xl mx-auto text-muted-foreground">
                Transform your notes with intelligent AI tools designed to enhance productivity
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </div>
          </div>

          {/* Dashboard Preview Section */}
          <div id="preview" className="pt-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Clean & Intuitive Interface
              </h2>
              <p className="text-xl max-w-2xl mx-auto text-muted-foreground">
                Experience a three-panel layout with sidebar, notes list, and rich text editor
              </p>
            </div>

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
          </div>

          {/* Testimonials Section */}
          <div id="reviews" className="pt-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Loved by Users
              </h2>
              <p className="text-xl max-w-2xl mx-auto text-muted-foreground">
                See what our community has to say about Panna.ai
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="rounded-2xl p-6" style={{ 
                backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
                border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e5e5'}`
              }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="mb-4" style={{ 
                  color: theme === 'dark' ? '#f2f2f2' : '#666666',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  "The AI features are incredible! I can summarize long research papers in seconds and translate my notes to multiple languages. It's like having a personal assistant for my notes."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                       style={{ backgroundColor: '#000000' }}>
                    <span className="text-white font-bold">S</span>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ 
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                      fontFamily: 'Inter, sans-serif'
                    }}>Sarah Chen</div>
                    <div className="text-sm" style={{ 
                      color: theme === 'dark' ? '#f2f2f2' : '#666666',
                      fontFamily: 'Inter, sans-serif'
                    }}>Research Scientist</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6" style={{ 
                backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
                border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e5e5'}`
              }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="mb-4" style={{ 
                  color: theme === 'dark' ? '#f2f2f2' : '#666666',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  "Clean interface, powerful features, and completely free. This is exactly what I needed for organizing my study notes. The rephrasing tool helps me understand complex concepts better."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                       style={{ backgroundColor: '#000000' }}>
                    <span className="text-white font-bold">M</span>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ 
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                      fontFamily: 'Inter, sans-serif'
                    }}>Marcus Johnson</div>
                    <div className="text-sm" style={{ 
                      color: theme === 'dark' ? '#f2f2f2' : '#666666',
                      fontFamily: 'Inter, sans-serif'
                    }}>Student</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6" style={{ 
                backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
                border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e5e5'}`
              }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="mb-4" style={{ 
                  color: theme === 'dark' ? '#f2f2f2' : '#666666',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  "As a writer, I love how I can quickly rephrase my content in different styles. The privacy-first approach gives me confidence that my ideas stay secure. Highly recommended!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                       style={{ backgroundColor: '#000000' }}>
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ 
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                      fontFamily: 'Inter, sans-serif'
                    }}>Alex Rivera</div>
                    <div className="text-sm" style={{ 
                      color: theme === 'dark' ? '#f2f2f2' : '#666666',
                      fontFamily: 'Inter, sans-serif'
                    }}>Content Writer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA Section */}
          <div id="cta" className="pt-20">
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
            </div>
          </div>
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
    </div>
  );
}
