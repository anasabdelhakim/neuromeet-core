"use client";

import { PreJoin } from "@livekit/components-react";
import { Shield, Video, Mic } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Logo } from "@/src/features/landing/components/Logo";

interface PreJoinScreenProps {
  onSubmit: (values: any) => void;
  isInstructor: boolean;
}

export function PreJoinScreen({ onSubmit, isInstructor }: PreJoinScreenProps) {
  return (
    <div className="flex h-[100svh] w-full bg-background overflow-hidden">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-card border-r border-border p-10 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-xs font-semibold tracking-widest text-brand-cyan uppercase mb-3">
              {isInstructor ? "Instructor Session" : "Live Class"}
            </p>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Ready to{" "}
              <span className="text-brand-cyan">
                {isInstructor ? "teach?" : "learn?"}
              </span>
            </h1>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed max-w-xs">
              {isInstructor
                ? "Your class is waiting. Set up your camera and mic before going live."
                : "Your instructor is ready. Configure your devices and join the session."}
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Video, label: "HD Video", desc: "Adaptive quality for smooth calls" },
              { icon: Mic, label: "Clear Audio", desc: "Noise cancellation built in" },
              { icon: Shield, label: "Secure Room", desc: "End-to-end encrypted session" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-button bg-black-soft-muted border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-brand-cyan" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-muted-foreground opacity-50">
          © {new Date().getFullYear()} NeuroMeet. All rights reserved.
        </p>
      </div>

      {/* Right panel — PreJoin */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 relative bg-background">
        <div className="lg:hidden mb-8 scale-75">
          <Logo />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-white mb-1">Check your setup</h2>
            <p className="text-muted-foreground text-sm">
              Make sure your camera and microphone are working before joining.
            </p>
          </div>

          <div className="w-full">
            <PreJoin
              defaults={{ videoEnabled: true, audioEnabled: true }}
              onSubmit={onSubmit}
              className={cn(
                /* Container Resets */
                "[&_.lk-prejoin]:bg-transparent [&_.lk-prejoin]:p-0 [&_.lk-prejoin]:gap-5",
                
                /* Video Preview Container */
                "[&_.lk-video-container]:aspect-video [&_.lk-video-container]:w-full [&_.lk-video-container]:rounded-xl [&_.lk-video-container]:border [&_.lk-video-container]:border-border [&_.lk-video-container]:overflow-hidden [&_.lk-video-container]:bg-muted [&_.lk-video-container]:relative [&_.lk-video-container]:flex [&_.lk-video-container]:items-center [&_.lk-video-container]:justify-center",
                "[&_video]:absolute [&_video]:inset-0 [&_video]:w-full [&_video]:h-full [&_video]:object-cover",

                /* Form Layout */
                "[&>div>form]:mt-4 [&>div>form]:flex [&>div>form]:flex-col [&>div>form]:gap-5",

                /* Labels */
                "[&_.lk-form-control>label]:text-muted-foreground [&_.lk-form-control>label]:text-sm [&_.lk-form-control>label]:font-medium [&_.lk-form-control>label]:mb-1.5 [&_.lk-form-control>label]:block",

                /* Inputs (Username) */
                "[&_.lk-form-control>input]:w-full [&_.lk-form-control>input]:bg-background [&_.lk-form-control>input]:border [&_.lk-form-control>input]:border-input [&_.lk-form-control>input]:text-foreground [&_.lk-form-control>input]:px-3 [&_.lk-form-control>input]:py-2 [&_.lk-form-control>input]:rounded-md [&_.lk-form-control>input]:outline-none focus-visible:[&_.lk-form-control>input]:ring-1 focus-visible:[&_.lk-form-control>input]:ring-ring",

                /* Selects (Mic/Camera) - using default styles mostly but themed */
                "[&_.lk-form-control>select]:w-full [&_.lk-form-control>select]:bg-background [&_.lk-form-control>select]:border [&_.lk-form-control>select]:border-input [&_.lk-form-control>select]:text-foreground [&_.lk-form-control>select]:px-3 [&_.lk-form-control>select]:py-2 [&_.lk-form-control>select]:rounded-md [&_.lk-form-control>select]:outline-none focus-visible:[&_.lk-form-control>select]:ring-1 focus-visible:[&_.lk-form-control>select]:ring-ring",

                /* Submit Button Override */
                "[&_button[type='submit']]:w-full [&_button[type='submit']]:bg-primary [&_button[type='submit']]:text-primary-foreground hover:[&_button[type='submit']]:bg-primary/90 [&_button[type='submit']]:h-10 [&_button[type='submit']]:px-4 [&_button[type='submit']]:py-2 [&_button[type='submit']]:rounded-md [&_button[type='submit']]:font-medium [&_button[type='submit']]:transition-colors"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
