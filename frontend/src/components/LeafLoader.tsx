import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LeafLoaderProps {
  onComplete: () => void;
  duration?: number; // in milliseconds
  message?: string;
}

const LeafLoader = ({ onComplete, duration = 5000, message = "Setting up your workspace..." }: LeafLoaderProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(newProgress);

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(onComplete, 200);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-hero z-50">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          {/* SocialLeaf Icon Animation */}
          <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
            {/* Pulsing glow behind the icon */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
            />

            {/* Rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-2 rounded-full border-2 border-dashed border-primary/30"
            />

            {/* Main leaf icon - scaling up as progress increases */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: 0.5 + (progress / 200), // Scale from 0.5 to 1
                rotate: 0,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10"
            >
              {/* SocialLeaf Brand Icon SVG */}
              <svg
                width="80"
                height="80"
                viewBox="0 0 100 100"
                fill="none"
              >
                {/* Background circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="url(#bgGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />

                {/* Leaf shape */}
                <motion.path
                  d="M50 25C35 25 25 40 25 55C25 70 35 80 50 80C50 80 45 65 50 55C55 65 50 80 50 80C65 80 75 70 75 55C75 40 65 25 50 25Z"
                  fill="white"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />

                {/* Leaf vein/stem */}
                <motion.path
                  d="M50 35V70"
                  stroke="rgba(34, 197, 94, 0.5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progress / 100 }}
                  transition={{ duration: 0.5 }}
                />

                <defs>
                  <linearGradient id="bgGradient" x1="0" y1="0" x2="100" y2="100">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* Sparkle particles appearing as progress increases */}
            {progress > 40 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                className="absolute top-2 right-4 w-2 h-2 bg-yellow-400 rounded-full"
              />
            )}
            {progress > 60 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-4 left-2 w-1.5 h-1.5 bg-emerald-300 rounded-full"
              />
            )}
            {progress > 80 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                className="absolute top-8 left-0 w-1 h-1 bg-green-300 rounded-full"
              />
            )}
          </div>

          {/* Progress Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-lg font-medium text-foreground mb-4">{message}</p>

            {/* Progress Bar */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-56 h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
              {/* Percentage */}
              <span className="text-sm font-mono text-primary font-bold w-12 text-left">
                {progress}%
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LeafLoader;
