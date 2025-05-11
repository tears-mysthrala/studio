
"use client";
import type { PlayerStats, StatKey } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, ShieldCheck, Brain, Droplets, TrendingUp, Crosshair, Gauge, Sparkles, Scissors, DollarSign, Star, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';

interface PlayerStatsDisplayProps {
  stats: PlayerStats;
}

const statIcons: Record<StatKey, React.ElementType> = {
  fuerza: Zap,
  resistencia: ShieldCheck,
  mente: Brain,
  alimentacion: Droplets,
  angulo: TrendingUp,
  posicion: Crosshair,
  velocidad: Gauge,
  materialCabeza: Sparkles,
  materialMango: Sparkles,
  filo: Scissors,
  oro: DollarSign,
  exp: Star,
};

const statDisplayNames: Record<StatKey, string> = {
  fuerza: 'Fuerza',
  resistencia: 'Resistencia',
  mente: 'Mente',
  alimentacion: 'Alimentación',
  angulo: 'Ángulo de Corte',
  posicion: 'Posición',
  velocidad: 'Velocidad (ms)',
  materialCabeza: 'Material (Cabeza)',
  materialMango: 'Material (Mango)',
  filo: 'Filo del Hacha',
  oro: 'Oro',
  exp: 'Experiencia',
};

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  if (Math.abs(num) >= 1_000_000) {
    return num.toExponential(2);
  }
  return num.toLocaleString();
}

export function PlayerStatsDisplay({ stats }: PlayerStatsDisplayProps) {
  const [previousStats, setPreviousStats] = useState<PlayerStats>(stats);
  const [changedStats, setChangedStats] = useState<Partial<Record<StatKey, boolean>>>({});

  useEffect(() => {
    const newChangedStats: Partial<Record<StatKey, boolean>> = {};
    let hasChanges = false;
    for (const key in stats) {
      const statKey = key as StatKey;
      if (stats[statKey] !== previousStats[statKey] && typeof stats[statKey] === 'number' && typeof previousStats[statKey] === 'number') {
        if (stats[statKey] > previousStats[statKey]) {
          newChangedStats[statKey] = true;
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      setChangedStats(newChangedStats);
      const timer = setTimeout(() => {
        setChangedStats({});
      }, 500); // Duration of the flash animation
      setPreviousStats(stats); 
      return () => clearTimeout(timer);
    } else {
      setPreviousStats(stats);
    }

  }, [stats, previousStats]);


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary-foreground bg-primary/80 p-2 rounded-t-md -m-6 mb-0">Estadísticas del Jugador</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 grid grid-cols-2 gap-x-4 gap-y-3">
        {(Object.keys(stats) as StatKey[]).map((key) => {
          const Icon = statIcons[key] || HelpCircle;
          const value = stats[key];
          const displayValue = formatNumber(value as number); // Added "as number" for safety, though type should be correct

          return (
            <div key={key} className="flex items-center justify-between text-sm border-b border-border/50 pb-1">
              <div className="flex items-center">
                <Icon className="w-4 h-4 mr-2 text-accent" aria-hidden="true" />
                <span className="font-medium text-foreground/90">{statDisplayNames[key] || key}:</span>
              </div>
              <span
                className={cn(
                  "font-semibold text-accent-foreground",
                  changedStats[key] && "stat-value-increase"
                )}
              >
                {displayValue}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
