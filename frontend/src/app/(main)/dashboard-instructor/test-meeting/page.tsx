'use client';

import { useState } from 'react';
import { launchTestMeetingAction } from './actions';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Video, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function TestMeetingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLaunch = async () => {
    setLoading(true);
    setError(null);
    const res = await launchTestMeetingAction();
    if (res && !res.success) {
      setError(res.error || 'Failed to start meeting.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg bg-black-soft-subtle/40 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-cyan/20 rounded-full blur-[100px] pointer-events-none" />

        <CardHeader className="text-center relative z-10">
          <div className="mx-auto w-16 h-16 rounded-full bg-btn-new-gradient flex items-center justify-center mb-4 shadow-lg shadow-brand-cyan/25 animate-pulse">
            <Video className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-white bg-logo-gradient bg-clip-text text-transparent">
            Instant Test Meeting
          </CardTitle>
          <CardDescription className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
            Create an immediate test room to test the Real-Time Engagement AI. 
            Clicking below will create the meeting, join you as the host, and automatically spin up the Python AI agent.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          {error && (
            <div className="p-4 rounded-soft bg-red-950/40 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-red-300">
                <p className="font-bold">Initialization Failed</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-soft p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[hsl(220,80%,75%)] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Automatic Pipeline Setup
              </h4>
              <ul className="text-xs text-gray-300 space-y-2 list-disc pl-4">
                <li>Instantiates a live-session meeting room</li>
                <li>Generates custom LiveKit tokens for the instructor</li>
                <li>Triggers Python Worker microservice (spawns hidden AI bot)</li>
                <li>Launches WebRTC track subscriptions & P2P Data Channels</li>
              </ul>
            </div>

            <Button
              onClick={handleLaunch}
              disabled={loading}
              className="w-full h-14 bg-btn-new-gradient text-white font-bold text-base shadow-lg 
                         transition-all duration-normal ease-standard rounded-soft hover:scale-[1.01] 
                         active:scale-[0.99] border border-white/20 hover:brightness-110 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Spinning up AI agents...
                </>
              ) : (
                'Launch Instant Session'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
