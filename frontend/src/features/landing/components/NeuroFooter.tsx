"use client";

import { useState } from "react";

export const NeuroFooter = () => (
  <footer className="relative w-full bg-[#0a0d18] border-t border-white/10 text-white py-16 font-sans overflow-hidden">
    <FooterBackgroundWatermark />
    <div className="max-w-7xl mx-auto px-6 lg:px-16 flex flex-col items-center text-center relative z-10 gap-10">
      <FooterHeadingSection />
      <NewsletterForm />
    </div>
  </footer>
);

const FooterBackgroundWatermark = () => (
  <div className="absolute -right-20 -bottom-24 opacity-[0.04] pointer-events-none text-white" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-[580px] h-[580px]">
      <path d="M12 2a4 4 0 0 1 4 4c0 .88-.29 1.7-.78 2.36A4.5 4.5 0 0 1 20 12c0 1.28-.53 2.44-1.39 3.26.25.54.39 1.14.39 1.74a4 4 0 0 1-4 4c-.75 0-1.44-.2-2.04-.56A4 4 0 0 1 12 22a4 4 0 0 1-.96-1.56A4 4 0 0 1 9 21a4 4 0 0 1-4-4c0-.6.14-1.2.39-1.74A4.5 4.5 0 0 1 4 12c0-1.92 1.2-3.56 2.78-4.24A4 4 0 0 1 8 6a4 4 0 0 1 4-4z" />
      <path d="M12 2v20M8 6c0 4 8 4 8 8s-8 4-8 8M16 6c0 4-8 4-8 8s8 4 8 8" />
    </svg>
  </div>
);

const FooterHeadingSection = () => (
  <div className="flex flex-col items-center gap-2 max-w-xl">
    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/90 tracking-wide uppercase">
      <span>NeuroMeet Updates</span>
    </div>
    <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
      Stay Connected on All Things Collaboration
    </h3>
    <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
      Subscribe to receive product updates, ADHD engagement research, and new AI conferencing features.
    </p>
  </div>
);

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubscribed(true);
  };

  if (isSubscribed) {
    return (
      <div className="px-6 py-3 rounded-full bg-primary/20 border border-primary/30 text-white text-sm font-medium">
        Thank you for subscribing to NeuroMeet!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 px-4 py-3 rounded-full bg-white/5 border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
      />
      <button
        type="submit"
        className="px-8 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-all cursor-pointer shrink-0 shadow-xs"
      >
        Subscribe
      </button>
    </form>
  );
};
