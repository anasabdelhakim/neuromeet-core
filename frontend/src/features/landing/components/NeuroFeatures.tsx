import { Card, CardContent, CardDescription, CardTitle } from "@/src/components/ui/card";
import { BrainCircuit, Video, Shield, Zap } from "lucide-react";
export const NeuroFeatures = () => {
  const features = [
    {
      icon: <Video className="w-8 h-8 text-brand-cyan" />,
      title: "Crystal Clear HD",
      description: "Experience ultra-low latency 4K video conferencing built on our proprietary streaming protocol.",
    },
    {
      icon: <BrainCircuit className="w-8 h-8 text-brand-purple" />,
      title: "Neural Transcripts",
      description: "AI-powered real-time transcriptions, action items, and meeting summaries automatically generated.",
    },
    {
      icon: <Shield className="w-8 h-8 text-status-success" />,
      title: "Enterprise Secure",
      description: "End-to-end encryption ensures your most sensitive data never falls into the wrong hands.",
    },
    {
      icon: <Zap className="w-8 h-8 text-action-yellow" />,
      title: "Instant Join",
      description: "No downloads required. Guests join instantly through any modern browser with a single click.",
    },
  ];
  return (
    <section className="w-full max-w-6xl mx-auto py-20 border-t border-border mt-10 max-sm:pt-10 max-sm:pb-8 max-sm:mb-0">
      <div className="text-center mb-16 animate-page-entrance">
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary-light mb-2">
          Why NeuroMeet?
        </h2>
        <h3 className="text-3xl md:text-6xl font-extrabold text-foreground mb-6">
          Smarter meetings. <br className="hidden md:block" /> Better outcomes.
        </h3>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          We rebuilt the video conferencing stack from the ground up, infusing it with AI to make your meetings highly productive.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
{features.map((feature, i) => (
  <button
    key={i}
    aria-label={feature.title}
    className="relative overflow-hidden bg-black-soft-subtle border border-border/50 hover:border-primary/50 focus:border-primary/50 opacity-90 hover:opacity-100 focus:opacity-100 hover:-translate-y-1.5 focus:-translate-y-1.5 transition-all duration-normal ease-smooth transform-gpu flex flex-col p-4 sm:p-5 rounded-soft shadow-soft hover:shadow-glow-cyan focus:shadow-glow-cyan group text-left w-full"
  >
    <div className="absolute inset-x-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-primary-light to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-normal ease-smooth" />
    <div className="absolute -inset-px bg-gradient-to-br from-primary-soft-subtle to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-normal pointer-events-none rounded-soft" />
    <div className="relative z-10 bg-white-soft-subtle border border-white/5 w-14 h-14 rounded-medium flex items-center justify-center mb-4 group-hover:scale-110 group-focus:scale-110 group-hover:bg-white-soft-muted group-focus:bg-white-soft-muted group-hover:border-white/10 group-focus:border-white/10 group-hover:shadow-soft group-focus:shadow-soft transition-all duration-normal ease-bouncy">
      {feature.icon}
    </div>
    <div className="relative z-10 p-0 flex flex-col flex-1">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-primary-light group-focus:text-primary-light transition-colors duration-normal">
        {feature.title}
      </h3>
      <p className="text-muted-foreground-mid text-sm leading-relaxed mb-auto group-hover:text-muted-foreground group-focus:text-muted-foreground transition-colors duration-normal">
        {feature.description}
      </p>
    </div>
  </button>
))}
</div>
    </section>
  );
};