"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import Image from "next/image";
import { AnimatedSection } from "@/components/ui/animated-section";

// Generate realistic human face avatars using a professional service
const generateAvatar = (seed: string) => {
  // Using a seed-based approach for consistent faces
  const seedNumber = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Using a service that provides realistic human faces
  return `https://i.pravatar.cc/64?img=${seedNumber % 70 + 1}`;
};

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Research Scientist",
    avatarSeed: "sarah-chen-researcher",
    rating: 5,
    review: "The AI features are incredible! I can summarize long research papers in seconds and translate my notes to multiple languages. It's like having a personal assistant for my notes."
  },
  {
    id: 2,
    name: "Marcus Johnson", 
    title: "Student",
    avatarSeed: "marcus-johnson-student",
    rating: 5,
    review: "Clean interface, powerful features, and completely free. This is exactly what I needed for organizing my study notes. The rephrasing tool helps me understand complex concepts better."
  },
  {
    id: 3,
    name: "Alex Rivera",
    title: "Content Writer", 
    avatarSeed: "alex-rivera-writer",
    rating: 5,
    review: "As a writer, I love how I can quickly rephrase my content in different styles. The privacy-first approach gives me confidence that my ideas stay secure. Highly recommended!"
  },
  {
    id: 4,
    name: "Emily White",
    title: "Project Manager",
    avatarSeed: "emily-white-manager",
    rating: 5,
    review: "Panna.ai has streamlined my workflow immensely. Capturing ideas and getting quick summaries means I spend less time organizing and more time creating. A must-have tool!"
  },
  {
    id: 5,
    name: "David Kim",
    title: "Software Engineer",
    avatarSeed: "david-kim-engineer",
    rating: 5,
    review: "The auto-tagging feature is a game-changer. My notes are now perfectly organized without any manual effort. The AI truly understands context and creates meaningful tags."
  },
  {
    id: 6,
    name: "Lisa Zhang",
    title: "Product Designer",
    avatarSeed: "lisa-zhang-designer",
    rating: 5,
    review: "Beautiful design meets powerful functionality. The three-panel layout is intuitive, and the AI features feel natural to use. This is how note-taking should be."
  }
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex space-x-1 mb-4">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function TestimonialsSection() {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentTestimonial = testimonials[activeIndex];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Handle manual testimonial change with transition
  const handleTestimonialChange = (index: number) => {
    if (isTransitioning) return; // Prevent rapid clicking

    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 500); // Match CSS transition duration
  };

  return (
    <section 
      id="reviews" 
      className="py-20" 
      style={{ 
        backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000'
      }}
    >
      <div className="max-w-6xl mx-auto px-4 text-center">
        <AnimatedSection animation="slideUp" delay={200}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ 
            color: theme === 'dark' ? '#ffffff' : '#000000',
            fontFamily: 'Inter, sans-serif'
          }}>
            Loved by Users
          </h2>
        </AnimatedSection>
        <AnimatedSection animation="fadeIn" delay={400}>
          <p className="text-xl mb-12" style={{ 
            color: theme === 'dark' ? '#f2f2f2' : '#666666',
            fontFamily: 'Inter, sans-serif'
          }}>
            See what our community has to say about Panna.ai
          </p>
        </AnimatedSection>

        <AnimatedSection animation="slideUp" delay={600}>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
            {/* Main Testimonial Display */}
            <div 
              className={`
                w-full lg:w-3/5 xl:w-1/2 p-8 rounded-3xl shadow-xl 
                transition-all duration-500 ease-out 
                flex flex-col justify-between
                min-h-[400px] max-h-[400px]
                ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
              `}
              style={{ 
                backgroundColor: theme === 'dark' ? '#171717' : '#f7f7f7',
                color: theme === 'dark' ? '#f2f2f2' : '#666666',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <div className="flex-1 flex flex-col justify-center">
                <StarRating rating={currentTestimonial.rating} />
                <p 
                  className="text-xl font-medium leading-relaxed mb-6 flex-1 flex items-center"
                  style={{ 
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  &ldquo;{currentTestimonial.review}&rdquo;
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 mt-auto">
                {/* Avatar for current testimonial */}
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={generateAvatar(currentTestimonial.avatarSeed)}
                    alt={currentTestimonial.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p 
                    className="text-lg font-semibold"
                    style={{ 
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {currentTestimonial.name}
                  </p>
                  <p 
                    className="text-sm"
                    style={{ 
                      color: theme === 'dark' ? '#f2f2f2' : '#666666',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {currentTestimonial.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* User Profile Carousel */}
        <AnimatedSection animation="fadeIn" delay={800}>
          <div className="mt-12 flex justify-center items-center gap-4 flex-wrap">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                onClick={() => handleTestimonialChange(index)}
                className={`
                  relative w-16 h-16 rounded-full overflow-hidden transition-all duration-300 ease-in-out
                  ${index === activeIndex 
                    ? 'ring-4 ring-black ring-offset-2 scale-110' 
                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }
                `}
              >
                <Image
                  src={generateAvatar(testimonial.avatarSeed)}
                  alt={testimonial.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Navigation dots for mobile */}
        <AnimatedSection animation="fadeIn" delay={1000}>
          <div className="mt-8 flex justify-center gap-2 lg:hidden">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleTestimonialChange(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'bg-black w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}