
"use client";
import type { PlayerStats, StatKey } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Zap, Brain, Apple, Scissors, Users, Gauge, Axe, Sparkles, Coins, Star } from 'lucide-react'; // Using Scissors for Angulo, Users for Posicion, Heart for Resistencia
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface PlayerStatsProps {
  stats: PlayerStats;
}

const statIcons: Record<StatKey, React.ElementType | null> = {
  resistencia: Heart, // Changed from Shield to Heart
  fuerza: Zap,
  mente: Brain,
  alimentacion: Apple,
  angulo: Scissors, 
  posicion: Users, 
  velocidad: Gauge,
  materialCabeza: Axe,
  materialMango: Axe, 
  filo: Sparkles,
  oro: Coins,
  exp: Star,
};

const statDisplayName: Record<StatKey, string> = {
  resistencia: "Resistencia",
  fuerza: "Fuerza",
  mente: "Mente",
  alimentacion: "Alimentación",
  angulo: "Ángulo",
  posicion: "Posición",
  velocidad: "Velocidad (ms)",
  materialCabeza: "Mat. Cabeza",
  materialMango: "Mat. Mango",
  filo: "Filo",
  oro: "Oro",
  exp: "EXP",
};

const formatNumber = (num: number): string => {
  if (num === null || num === undefined) return "0";
  if (Math.abs(num) >= 1000000) {
    return num.toExponential(2);
  }
  return num.toLocaleString();
};

export function PlayerStatsDisplay({ stats }: PlayerStatsProps) {
  const [changedStats, setChangedStats] = useState<Partial<Record<StatKey, boolean>>>({});
  const prevStatsRef = useRef<PlayerStats>(stats);

  useEffect(() => {
    const changes: Partial<Record<StatKey, boolean>> = {};
    let hasChanges = false;
    for (const key in stats) {
      const statKey = key as StatKey;
      if (stats[statKey] !== prevStatsRef.current[statKey]) {
        changes[statKey] = true;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      setChangedStats(changes);
      prevStatsRef.current = stats;
      const timer = setTimeout(() => setChangedStats({}), 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [stats]);


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary-foreground bg-primary/80 p-2 rounded-t-md -m-6 mb-0">Estadísticas del Jugador</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 pt-6">
        {(Object.keys(stats) as StatKey[]).map((key) => {
          const Icon = statIcons[key];
          const value = stats[key];
          
          if (value === undefined || value === null) return null; 

          return (
            <div key={key} className="flex items-center space-x-2 p-2 bg-card-foreground/5 rounded-md" title={`${statDisplayName[key]}: ${formatNumber(value)}`}>
              {Icon && <Icon className="w-5 h-5 text-secondary" />}
              <span className="font-medium text-foreground/90">{statDisplayName[key]}:</span>
              <span 
                className={cn(
                  "font-semibold text-accent-foreground tabular-nums",
                  changedStats[key] && 'stat-value-increase'
                )}
              >
                {formatNumber(value)}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

