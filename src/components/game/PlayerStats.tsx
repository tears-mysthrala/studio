
"use client";
import type { PlayerStats, StatKey } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Brain, Apple, Scissors, Users, Gauge, Axe, Sparkles, Coins, Star } from 'lucide-react'; // Using Scissors for Angulo, Users for Posicion
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface PlayerStatsProps {
  stats: PlayerStats;
}

const statIcons: Record<StatKey, React.ElementType | null> = {
  resistencia: Shield,
  fuerza: Zap,
  mente: Brain,
  alimentacion: Apple,
  angulo: Scissors, // Placeholder for Angulo
  posicion: Users, // Placeholder for Posicion
  velocidad: Gauge,
  materialCabeza: Axe,
  materialMango: Axe, // Could use a different icon like Hand
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
          if (value === undefined) return null; // Don't display undefined stats like initial oro/exp if not set

          return (
            <div key={key} className="flex items-center space-x-2 p-2 bg-card-foreground/5 rounded-md" title={`${statDisplayName[key]}: ${value}`}>
              {Icon && <Icon className="w-5 h-5 text-secondary" />}
              <span className="font-medium text-foreground/90">{statDisplayName[key]}:</span>
              <span 
                className={cn(
                  "font-semibold text-accent-foreground tabular-nums",
                  changedStats[key] && 'stat-value-increase'
                )}
              >
                {value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
