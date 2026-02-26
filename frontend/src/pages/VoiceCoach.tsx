import { useState } from "react";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mic, Play, Pause, Sparkles, Loader2, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { API_BASE_URL } from "@/services/api";

const VoiceCoach = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [script, setScript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    average_hook: string;
    high_retention_hook: string;
    why_high_retention_works: string;
    retention_score: number;
    retention_score_reason: string;
    coaching_explanation?: string;
  } | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null); // 'average' or 'high' or null
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null); // 'average' or 'high' or null

  const handleAnalyze = async () => {
    if (!script.trim()) return;

    setIsAnalyzing(true);
    try {
      // Get token from session
      const token = session?.access_token;

      const response = await fetch(`${API_BASE_URL}/api/voice-coach/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ script }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setResults(data);
      toast({
        title: "Analysis Complete",
        description: "Generated improved hooks for your script.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze script. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playAudio = async (text: string, type: 'average' | 'high') => {
    if (isPlaying === type) {
      setIsPlaying(null);
      return;
    }

    setLoadingAudio(type);
    try {
      const token = session?.access_token;

      // Construct coaching text (Explanation + Hook)
      let speechText = text;
      if (type === 'high' && results?.coaching_explanation) {
        speechText = `${results.coaching_explanation} ... For example, try saying: ... ${text}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/voice-coach/speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          text: speechText,
          style: type === 'high' ? 'energetic' : 'neutral'
        }),
      });

      if (!response.ok) throw new Error("Speech generation failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => setIsPlaying(null);
      audio.play();
      setIsPlaying(type);
      setAudioUrl(url);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate audio (Local TTS).",
        variant: "destructive",
      });
    } finally {
      setLoadingAudio(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4 h-[65px] flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <MobileNav />
              <h1 className="font-display text-2xl font-bold text-foreground">AI Voice Coach</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium border border-blue-200">
                <Sparkles className="h-3 w-3" />
                <span className="hidden sm:inline">Powered by Gemini</span>
                <span className="sm:hidden">Gemini</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-5xl mx-auto space-y-8">
          {/* Input Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Script / Caption</h2>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !script.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze & Improve
                  </>
                )}
              </Button>
            </div>
            <Textarea
              placeholder="Paste your script here (e.g., 'Today I'm going to explain productivity...')"
              className="min-h-[150px] text-lg p-4 resize-none bg-card"
              value={script}
              onChange={(e) => setScript(e.target.value)}
            />
          </section>

          {/* Results Section */}
          {results && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Average Hook */}
              <Card className="p-6 border-border bg-card/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-muted-foreground">Average Hook</h3>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-xl mb-6 min-h-[100px]">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    "{results.average_hook}"
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => playAudio(results.average_hook, 'average')}
                  disabled={loadingAudio === 'average'}
                >
                  {loadingAudio === 'average' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isPlaying === 'average' ? (
                    <Pause className="mr-2 h-4 w-4" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Hear Voice 1 (Neutral)
                </Button>
              </Card>

              {/* High Retention Hook */}
              <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded-full">
                    RECOMMENDED
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <Volume2 className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-primary">High-Retention Hook</h3>
                  </div>
                </div>

                <div className="bg-card p-4 rounded-xl mb-4 min-h-[80px] border border-primary/10 shadow-sm">
                  <p className="text-lg font-medium text-foreground leading-relaxed">
                    "{results.high_retention_hook}"
                  </p>
                </div>

                {/* Why it works */}
                <div className="mb-4 text-sm">
                  <p className="text-muted-foreground mb-1 font-medium">Why it works:</p>
                  <p className="text-muted-foreground/80 italic">
                    "{results.why_high_retention_works}"
                  </p>
                </div>

                {/* Retention Score */}
                <div className="mb-6 flex items-center gap-2 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                  <span className="text-xl">🔥</span>
                  <div>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      Retention Score: {results.retention_score} / 10
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {results.retention_score_reason}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => playAudio(results.high_retention_hook, 'high')}
                  disabled={loadingAudio === 'high'}
                >
                  {loadingAudio === 'high' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isPlaying === 'high' ? (
                    <Pause className="mr-2 h-4 w-4" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Hear Voice Coach (Energetic)
                </Button>
              </Card>
            </motion.section>
          )}
        </div>
      </main>
    </div>
  );
};

export default VoiceCoach;
