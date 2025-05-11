
"use client";
import type { PlayerStats, StatKey, ActionItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Shield, Brain, Sparkles, ShoppingCart, ArrowUpCircle, Mountain, Logs, Axe, Apple } from 'lucide-react'; // Mountain for meditate, Logs for Chop Wood, Apple for Alimentacion
import React from 'react';

interface ActionListProps {
  playerStats: PlayerStats;
  onTrainStat: (stat: StatKey, amount?: number) => boolean;
  onMeditate: () => void;
  onImproveBlade: () => boolean;
  onBuyMaterial: (materialType: 'materialCabeza' | 'materialMango') => boolean;
  onChopWood: () => boolean;
}

export function ActionList({ playerStats, onTrainStat, onMeditate, onImproveBlade, onBuyMaterial, onChopWood }: ActionListProps) {
  
  const actions: ActionItem[] = [
    { id: 'chopWood', name: 'Cortar Madera', description: 'Corta madera para ganar oro y EXP.', icon: Logs, actionFn: onChopWood, buttonVariant: 'primary' },
    { id: 'fuerza', name: 'Entrenar Fuerza', description: 'Aumenta tu daño base.', icon: Zap, actionFn: () => onTrainStat('fuerza'), buttonVariant: 'default' },
    { id: 'resistencia', name: 'Entrenar Resistencia', description: 'Aumenta tus repeticiones base.', icon: Shield, actionFn: () => onTrainStat('resistencia'), buttonVariant: 'default' },
    { id: 'alimentacion', name: 'Entrenar Alimentación', description: 'Reduce tiempo de recuperación. Límite 8.', icon: Apple, actionFn: () => onTrainStat('alimentacion'), buttonVariant: 'default' },
    { id: 'angulo', name: 'Entrenar Ángulo', description: 'Mejora multiplicador de fuerza.', icon: Axe, actionFn: () => onTrainStat('angulo'), buttonVariant: 'default' },
    { id: 'posicion', name: 'Entrenar Posición', description: 'Mejora multiplicador de resistencia.', icon: ArrowUpCircle, actionFn: () => onTrainStat('posicion'), buttonVariant: 'default' },
    { id: 'velocidad', name: 'Entrenar Velocidad', description: 'Reduce tiempo entre acciones.', icon: ArrowUpCircle, actionFn: () => onTrainStat('velocidad', -50), buttonVariant: 'default' }, 
    { id: 'meditate', name: 'Meditar', description: 'Aumenta tu Mente y EXP.', icon: Mountain, actionFn: onMeditate, buttonVariant: 'secondary' },
    { id: 'improveBlade', name: 'Mejorar Filo', description: 'Aumenta el exponente de fuerza.', icon: Sparkles, actionFn: onImproveBlade, buttonVariant: 'accent' },
    { id: 'buyMaterialCabeza', name: 'Comprar Mat. Cabeza', description: 'Mejora multiplicador de fuerza.', icon: ShoppingCart, actionFn: () => onBuyMaterial('materialCabeza'), buttonVariant: 'accent' },
    { id: 'buyMaterialMango', name: 'Comprar Mat. Mango', description: 'Mejora multiplicador de resistencia.', icon: ShoppingCart, actionFn: () => onBuyMaterial('materialMango'), buttonVariant: 'accent' },
  ];

  const getActionCost = (action: ActionItem): string => {
    if (action.id === 'fuerza' || action.id === 'resistencia' || action.id === 'angulo' || action.id === 'posicion' || action.id === 'velocidad' || action.id === 'alimentacion') {
        const cost = Math.floor(Math.pow(playerStats[action.id as StatKey] || 0, 1.1) + 5);
        return `Costo: ${cost} Oro`;
    }
    if (action.id === 'improveBlade') {
        const cost = Math.floor(Math.pow(playerStats.filo, 1.5) * 10 + 20);
        return `Costo: ${cost} Oro`;
    }
    if (action.id === 'buyMaterialCabeza' || action.id === 'buyMaterialMango') {
        const currentLevel = playerStats[action.id === 'buyMaterialCabeza' ? 'materialCabeza' : 'materialMango'];
        const cost = Math.floor(Math.pow(currentLevel, 2) * 50 + 100);
        return `Costo: ${cost} Oro`;
    }
    return "";
  }


  return (
    <Card className="shadow-xl h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary-foreground bg-primary p-2 rounded-t-md -m-6 mb-0">Acciones Disponibles</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          const costText = getActionCost(action);
          const isDisabled = action.id === 'alimentacion' && playerStats.alimentacion >= 8;
          return (
            <Button
              key={action.id}
              onClick={() => action.actionFn && action.actionFn()}
              variant={action.buttonVariant || "default"}
              className="w-full h-auto py-3 flex flex-col items-start text-left shadow-md hover:shadow-lg transition-shadow"
              aria-label={action.name}
              disabled={isDisabled}
            >
              <div className="flex items-center space-x-2">
                {Icon && <Icon className="w-5 h-5" />}
                <span className="font-semibold text-base">{action.name}</span>
              </div>
              <p className="text-xs opacity-80 mt-1">{action.description}</p>
              {costText && <p className="text-xs opacity-70 mt-1">{costText}</p>}
              {isDisabled && <p className="text-xs text-destructive mt-1">Límite alcanzado</p>}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

