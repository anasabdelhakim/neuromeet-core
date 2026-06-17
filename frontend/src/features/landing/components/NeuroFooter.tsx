import Link from "next/link";
import { Logo } from "@/src/features/landing";

export const NeuroFooter = () => {
  return (
    <footer className="w-full bg-card-footer-bg border-t border-border backdrop-blur-xl mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex-shrink-0">
          <Logo />
        </div>
        <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground text-center">
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors duration-normal">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors duration-normal">
              Terms of Service
            </Link>
          </div>
          <p>© 2026 NeuroMeet Inc. All rights reserved.</p>
        </div>

        {/* Right: Social Accounts */}
        {/* Removed ghost opacity, made icons size 24x24 instead of 18x18 */}
        <div className="flex items-center gap-5 text-muted-foreground">
          
          <Link href="#" className="hover:text-brand-cyan transition-colors duration-normal" aria-label="Twitter">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
          </Link>
          
          <Link href="#" className="hover:text-white transition-colors duration-normal" aria-label="GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </Link>
          
          <Link href="#" className="hover:text-brand-purple transition-colors duration-normal" aria-label="LinkedIn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </Link>

        </div>
      </div>
    </footer>
  );
};