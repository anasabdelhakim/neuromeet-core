import { Card, CardContent, CardDescription, CardTitle } from "@/src/components/ui/card";
import { BrainCircuit, Video, Shield, Zap } from "lucide-react";
export const NeuroFeatures = () => {
  const features = [
    {
      icon: <Video className="w-6 h-6 text-foreground" />,
      title: "Low-Latency Video",
      description: "Optimized WebRTC media pipelines with adaptive bitrate and high audio fidelity.",
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-foreground" />,
      title: "Real-Time Transcripts",
      description: "Automated transcription, action item detection, and structured session summaries.",
    },
    {
      icon: <Shield className="w-6 h-6 text-foreground" />,
      title: "Secure by Design",
      description: "End-to-end encrypted room signaling with role-based access control.",
    },
    {
      icon: <Zap className="w-6 h-6 text-foreground" />,
      title: "Instant In-Browser Join",
      description: "Zero installs required. Participants join directly from any modern web browser.",
    },
  ];
  return (
    <section className="w-full max-w-6xl mx-auto py-20 border-t border-border mt-10 max-sm:pt-10 max-sm:pb-8 max-sm:mb-0">
      <div className="text-center mb-16">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Platform Capabilities
        </h2>
        <h3 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
          Engineered for real-time performance.
        </h3>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
          Custom WebRTC streaming, fast media processing, and zero-memory chunked recording storage.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {features.map((feature, i) => (
          <div
            key={i}
            className="bg-card border border-border/80 hover:border-border transition-colors duration-200 rounded-xl p-5 shadow-xs flex flex-col text-left w-full group"
          >
            <div className="w-12 h-12 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center mb-4">
              {feature.icon}
            </div>
            <div className="p-0 flex flex-col flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-auto">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};