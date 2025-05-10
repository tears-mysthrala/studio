
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { GameState, PlayerStats, Pet, StatKey } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const INITIAL_STATS: PlayerStats = {
  resistencia: 1,
  fuerza: 1,
  mente: 1,
  alimentacion: 0,
  angulo: 1,
  posicion: 1,
  velocidad: 1000, // ms per action
  materialCabeza: 1,
  materialMango: 1,
  filo: 1,
  oro: 0,
  exp: 0,
};

const INITIAL_PETS: Pet[] = [
  {
    id: 'bihurri',
    nombre: 'Bihurri',
    tipo: 'Entrenador',
    spriteUrl: '/sprites/pet-bihurri-sprite.png',
    dataAiHint: 'pixel art wise old dog',
    bonusText: '+1 Mente',
    bonusEffect: (stats) => ({ mente: (stats.mente || 0) + 1 }),
    isActive: true,
  },
  {
    id: 'mishi',
    nombre: 'Mishi',
    tipo: 'Gato Místico',
    spriteUrl: '/sprites/pet-mishi-sprite.png',
    dataAiHint: 'pixel art calico cat',
    bonusText: 'Aumenta eficiencia (temporal)',
    bonusEffect: (stats) => ({ }), // Placeholder, needs more complex logic for temp bonus
    isActive: false, 
  }
];

const GAME_STATE_KEY = 'haizkolariIdleGameState';

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>({
    playerStats: INITIAL_STATS,
    pets: INITIAL_PETS,
    gameLog: ['Bienvenido a Haizkolari Idle!'],
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  const addLog = useCallback((message: string) => {
    setGameState(prev => ({
      ...prev,
      gameLog: [...prev.gameLog.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`], // Keep last 10 logs
    }));
  }, []);

  const updateStats = useCallback((newStats: Partial<PlayerStats>) => {
    setGameState(prev => {
      const updatedPlayerStats = { ...prev.playerStats, ...newStats };
      // Apply pet bonuses
      prev.pets.forEach(pet => {
        if (pet.isActive) {
          const bonus = pet.bonusEffect(updatedPlayerStats);
          for (const key in bonus) {
            const statKey = key as StatKey;
            if (updatedPlayerStats[statKey] !== undefined && bonus[statKey] !== undefined) {
                 // This is a simple application, for multipliers or complex bonuses, logic would be different.
                 // For this example, Bihurri's +1 Mente is handled here if it were dynamic.
                 // The current pet setup is more for static additive bonuses or effects triggered elsewhere.
            }
          }
        }
      });
      return { ...prev, playerStats: updatedPlayerStats };
    });
  }, []);
  
  const trainStat = useCallback((stat: StatKey, amount = 1) => {
    if (stat === 'oro' || stat === 'exp') return; // Cannot train currency/exp directly this way

    const currentStatValue = gameState.playerStats[stat] || 0;
    let cost = 0;
    // Example cost scaling: Math.floor(Math.pow(currentStatValue, 1.1) + 5)
    if (stat === 'fuerza' || stat === 'resistencia') cost = Math.floor(Math.pow(currentStatValue, 1.1) + 5);
    
    if (gameState.playerStats.oro !== undefined && gameState.playerStats.oro < cost) {
        addLog(`No tienes suficiente oro para entrenar ${stat}. Necesitas ${cost} oro.`);
        toast({ title: "Sin Oro", description: `Necesitas ${cost} oro para entrenar ${stat}.`, variant: "destructive" });
        return false;
    }

    let increase = amount;
    if (stat === 'fuerza') increase = Math.max(1, Math.floor(amount * (gameState.playerStats.mente / 10)));
    if (stat === 'resistencia') increase = Math.max(1, Math.floor(amount * (gameState.playerStats.mente / 10)));


    updateStats({
      [stat]: currentStatValue + increase,
      oro: gameState.playerStats.oro !== undefined ? gameState.playerStats.oro - cost : undefined,
      exp: (gameState.playerStats.exp || 0) + Math.floor(increase / 2) // Gain some exp
    });
    addLog(`Entrenado ${stat}! (+${increase} ${stat}, -${cost} oro)`);
    toast({ title: "Entrenamiento Completo", description: `+${increase} ${stat}!`});
    return true;
  }, [gameState.playerStats, updateStats, addLog, toast]);

  const meditate = useCallback(() => {
    const menteIncrease = Math.max(1, Math.floor(gameState.playerStats.mente / 5) + 1);
    updateStats({ mente: gameState.playerStats.mente + menteIncrease, exp: (gameState.playerStats.exp || 0) + menteIncrease });
    addLog(`Meditación profunda. (+${menteIncrease} Mente)`);
    toast({ title: "Meditación", description: `+${menteIncrease} Mente.`});
  }, [gameState.playerStats.mente, updateStats, addLog, toast]);

  const improveBlade = useCallback(() => {
    const cost = Math.floor(Math.pow(gameState.playerStats.filo, 1.5) * 10 + 20);
    if (gameState.playerStats.oro !== undefined && gameState.playerStats.oro < cost) {
        addLog(`No tienes suficiente oro para mejorar el filo. Necesitas ${cost} oro.`);
        toast({ title: "Sin Oro", description: `Necesitas ${cost} oro para mejorar el filo.`, variant: "destructive" });
        return false;
    }
    updateStats({ 
        filo: gameState.playerStats.filo + 1,
        oro: gameState.playerStats.oro !== undefined ? gameState.playerStats.oro - cost : undefined,
        exp: (gameState.playerStats.exp || 0) + gameState.playerStats.filo * 2
    });
    addLog(`Filo mejorado! (+1 Filo, -${cost} oro)`);
    toast({ title: "Filo Mejorado", description: `Nuevo nivel de filo: ${gameState.playerStats.filo + 1}`});
    return true;
  }, [gameState.playerStats, updateStats, addLog, toast]);

  const buyMaterial = useCallback((materialType: 'materialCabeza' | 'materialMango') => {
    const currentLevel = gameState.playerStats[materialType];
    const cost = Math.floor(Math.pow(currentLevel, 2) * 50 + 100);
     if (gameState.playerStats.oro !== undefined && gameState.playerStats.oro < cost) {
        addLog(`No tienes suficiente oro para comprar ${materialType}. Necesitas ${cost} oro.`);
        toast({ title: "Sin Oro", description: `Necesitas ${cost} oro para comprar ${materialType}.`, variant: "destructive" });
        return false;
    }
    updateStats({ 
        [materialType]: currentLevel + 1,
        oro: gameState.playerStats.oro !== undefined ? gameState.playerStats.oro - cost : undefined,
    });
    const materialName = materialType === 'materialCabeza' ? 'Material de Cabeza' : 'Material de Mango';
    addLog(`${materialName} comprado! (+1 ${materialName}, -${cost} oro)`);
    toast({ title: `${materialName} Comprado!`, description: `Nuevo nivel de ${materialName}: ${currentLevel + 1}`});
    return true;
  }, [gameState.playerStats, updateStats, addLog, toast]);


  const saveGame = useCallback(() => {
    try {
      const serializedState = btoa(JSON.stringify({ ...gameState, lastSaveTime: Date.now() }));
      localStorage.setItem(GAME_STATE_KEY, serializedState);
      addLog('Juego guardado!');
      toast({ title: "Juego Guardado", description: "Tu progreso ha sido guardado."});
    } catch (error) {
      console.error("Error saving game:", error);
      addLog('Error al guardar el juego.');
      toast({ title: "Error al Guardar", description: "No se pudo guardar tu progreso.", variant: "destructive" });
    }
  }, [gameState, addLog, toast]);

  const loadGame = useCallback(() => {
    try {
      const serializedState = localStorage.getItem(GAME_STATE_KEY);
      if (serializedState) {
        const loadedState = JSON.parse(atob(serializedState)) as GameState;
        // Basic validation for loaded state structure
        if (loadedState.playerStats && loadedState.pets && loadedState.gameLog) {
            setGameState(loadedState);
            addLog('Juego cargado!');
            toast({ title: "Juego Cargado", description: "Tu progreso ha sido restaurado."});
        } else {
            throw new Error("Invalid game state structure in localStorage.");
        }
      } else {
        addLog('No hay partida guardada.');
        toast({ title: "Sin Partida Guardada", description: "Empezando una nueva aventura."});
      }
    } catch (error) {
      console.error("Error loading game:", error);
      addLog('Error al cargar el juego. Empezando de nuevo.');
      toast({ title: "Error al Cargar", description: "No se pudo cargar tu progreso. Empezando de nuevo.", variant: "destructive" });
      setGameState({ playerStats: INITIAL_STATS, pets: INITIAL_PETS, gameLog: ['Error al cargar. Empezando nueva partida.'] });
      localStorage.removeItem(GAME_STATE_KEY); // Clear corrupted save
    } finally {
      setIsLoaded(true);
    }
  }, [addLog, toast]);

  useEffect(() => {
    if (!isLoaded) {
        loadGame();
    }
  }, [isLoaded, loadGame]);
  
  // Auto-save every 5 minutes
  useEffect(() => {
    if (!isLoaded) return; // Don't auto-save if initial load hasn't happened

    const intervalId = setInterval(() => {
      saveGame();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [saveGame, isLoaded]);


  return {
    gameState,
    isLoaded,
    trainStat,
    meditate,
    improveBlade,
    buyMaterial,
    addLog,
    saveGame,
    loadGame,
  };
}
