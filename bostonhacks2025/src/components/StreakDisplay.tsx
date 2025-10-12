"use client";

import { useState, useEffect } from "react";

type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastChecked: string;
  monthlyResetDate: string;
};

type StreakDisplayProps = {
  userId: string;
  size?: 'small' | 'medium' | 'large';
};

export default function StreakDisplay({ userId, size = 'medium' }: StreakDisplayProps) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreak();
    // Check streak every hour
    const interval = setInterval(loadStreak, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadStreak = async () => {
    try {
      const response = await fetch(`/api/streak/check?userId=${userId}`);
      
      if (!response.ok) {
        console.error("Failed to load streak:", response.status);
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setStreak(data.streak);
      }
    } catch (err) {
      console.error("Error loading streak:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !streak) {
    return null;
  }

  const sizeClasses = {
    small: {
      container: 'w-16 h-16',
      emoji: 'text-3xl',
      number: 'text-xs font-bold',
      label: 'text-xs',
    },
    medium: {
      container: 'w-24 h-24',
      emoji: 'text-5xl',
      number: 'text-sm font-bold',
      label: 'text-sm',
    },
    large: {
      container: 'w-32 h-32',
      emoji: 'text-7xl',
      number: 'text-lg font-bold',
      label: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className="flex flex-col items-center">
      <div className={`${classes.container} relative flex items-center justify-center`}>
        {/* Fire Emoji */}
        <span className={`${classes.emoji} absolute`} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
          🔥
        </span>
        
        {/* Streak Number */}
        <div className="absolute flex items-center justify-center w-full h-full">
          <span 
            className={`${classes.number} text-white`}
            style={{ 
              textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5)',
              marginTop: '8px' 
            }}
          >
            {streak.currentStreak}
          </span>
        </div>
      </div>
      
      {/* Label */}
      <div className="mt-2 text-center">
        <p className={`${classes.label} font-semibold text-slate-900`}>
          {streak.currentStreak === 1 ? '1 Day' : `${streak.currentStreak} Days`}
        </p>
        <p className="text-xs text-slate-600">Streak</p>
        {streak.longestStreak > streak.currentStreak && (
          <p className="text-xs text-slate-500 mt-1">
            Best: {streak.longestStreak}
          </p>
        )}
      </div>
    </div>
  );
}
