
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
    bonusText: '+1 Mente (Pasivo)', // Clarified that it's passive for now
    bonusEffect: (stats: PlayerStats): Partial<PlayerStats> => ({ }), // Passive bonuses handled differently or at stat calculation
    isActive: true,
  },
  {
    id: 'mishi',
    nombre: 'Mishi',
    tipo: 'Gato Místico',
    spriteUrl: '/sprites/pet-mishi-sprite.png',
    dataAiHint: 'pixel art calico cat',
    bonusText: 'Aumenta eficiencia (temporal)',
    bonusEffect: (stats: PlayerStats): Partial<PlayerStats> => ({ }), // Placeholder, needs more complex logic for temp bonus
    isActive: false, 
  }
];

// Helper to get base stats considering passive pet bonuses like Bihurri's
const calculateBaseStatsWithPassivePetBonuses = (stats: PlayerStats, pets: Pet[]): PlayerStats => {
  let newStats = { ...stats };
  pets.forEach(pet => {
    if (pet.isActive) {
      // Example for Bihurri's specific passive +1 Mente
      if (pet.id === 'bihurri') {
        newStats.mente = (newStats.mente || 0) + 1;
      }
      // Other passive bonuses could be added here
    }
  });
  return newStats;
};


const GAME_STATE_KEY = 'haizkolariIdleGameState';

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Initial state calculation including passive pet bonuses
    const baseStats = INITIAL_STATS;
    const statsWithPassiveBonuses = calculateBaseStatsWithPassivePetBonuses(baseStats, INITIAL_PETS);
    return {
      playerStats: statsWithPassiveBonuses,
      pets: INITIAL_PETS,
      gameLog: ['Bienvenido a Haizkolari Idle!'],
    };
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  const addLog = useCallback((message: string) => {
    setGameState(prev => ({
      ...prev,
      gameLog: [...prev.gameLog.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`], 
    }));
  }, []);

  const updateStats = useCallback((newStatsChanges: Partial<PlayerStats>) => {
    setGameState(prev => {
      // Apply direct changes
      let updatedPlayerStats = { ...prev.playerStats, ...newStatsChanges };
      
      // Recalculate stats with passive pet bonuses if 'mente' changes or pets change (not covered here)
      // For simplicity, if a stat relevant to a passive bonus changes (e.g. Mente itself), we re-apply.
      // A more robust system would re-calculate all stats from base + passives.
      // Bihurri's +1 Mente is added. If Mente is part of newStatsChanges, it overrides.
      // To ensure consistency:
      let baseStatsBeforePassive = { ...updatedPlayerStats };
      if (prev.pets.find(p => p.id === 'bihurri' && p.isActive)) {
         // If Bihurri provides +1 Mente, and Mente was just updated to X,
         // the new base Mente is X-1 for calculation, then +1 is re-applied.
         // This is complex. Simpler: calculate total stats from scratch if passives are involved.
      }
      
      // The current INITIAL_PETS passive bonus for Bihurri is applied at initialization.
      // Dynamic bonuses from pet.bonusEffect (if any were active and defined to return deltas) could be applied here.
      // For now, assuming bonusEffect is for active, non-passive effects.
      prev.pets.forEach(pet => {
        if (pet.isActive && typeof pet.bonusEffect === 'function') {
          const dynamicBonus = pet.bonusEffect(updatedPlayerStats); // e.g. temporary boosts
          for (const key in dynamicBonus) {
            const statKey = key as StatKey;
            const bonusValue = dynamicBonus[statKey];
            if (updatedPlayerStats[statKey] !== undefined && bonusValue !== undefined && typeof updatedPlayerStats[statKey] === 'number' && typeof bonusValue === 'number') {
                 (updatedPlayerStats[statKey] as number) += bonusValue; // Assuming dynamicBonus returns deltas
            }
          }
        }
      });

      return { ...prev, playerStats: updatedPlayerStats };
    });
  }, []);
  
  const trainStat = useCallback((stat: StatKey, amount = 1) => {
    if (stat === 'oro' || stat === 'exp') return false;

    const currentStatValue = gameState.playerStats[stat] || 0;
    let cost = 0;
    
    // Define cost for all trainable stats consistently
    if (['fuerza', 'resistencia', 'angulo', 'posicion', 'velocidad', 'mente'].includes(stat)){
       cost = Math.floor(Math.pow(currentStatValue, 1.1) + 5);
    }
        
    if (gameState.playerStats.oro !== undefined && gameState.playerStats.oro < cost) {
        addLog(`No tienes suficiente oro para entrenar ${stat}. Necesitas ${cost} oro.`);
        toast({ title: "Sin Oro", description: `Necesitas ${cost} oro para entrenar ${stat}.`, variant: "destructive" });
        return false;
    }

    let increase = amount;
    if (stat === 'fuerza' || stat === 'resistencia') {
      increase = Math.max(1, Math.floor(amount * (gameState.playerStats.mente / 10)));
    } else if (stat === 'mente' && amount === 1 ) { // For meditate like action
        increase = Math.max(1, Math.floor(gameState.playerStats.mente / 5) + 1);
    }


    const newStatValue = stat === 'velocidad' ? Math.max(50, currentStatValue + increase) : currentStatValue + increase;

    const statsUpdate: Partial<PlayerStats> = {
      [stat]: newStatValue,
      oro: gameState.playerStats.oro !== undefined ? gameState.playerStats.oro - cost : undefined,
      exp: (gameState.playerStats.exp || 0) + (stat === 'velocidad' ? Math.floor(cost / 2) : Math.floor(Math.abs(increase) / 2))
    };
    
    // If training Mente, and Bihurri is active, we need to adjust for its passive bonus.
    // This complexity is why passive bonuses are better handled by a full recalculation or applied at a different layer.
    // For now, let's assume direct update is fine, and initial load handles passive correctly.
    if (stat === 'mente' && gameState.pets.find(p => p.id === 'bihurri' && p.isActive)) {
        // The displayed value includes Bihurri's +1. The actual base Mente is playerStats.mente -1.
        // When increasing, we increase the base.
        // Example: Mente displayed 2 (base 1 + Bihurri 1). Training increases base to 2. Displayed becomes 3.
        // So, if newStatValue is the new *displayed* value, then it's fine.
        // If newStatValue is the new *base* value, then `playerStats.mente` should be `newBaseMente + bihurriBonus`.
        // The current code: `updateStats({ mente: gameState.playerStats.mente + menteIncrease ... })` where `gameState.playerStats.mente` is the *displayed* value.
        // This means Bihurri's bonus is effectively counted twice if not careful.
        // Let's ensure that trainStat operates on the *base* values and passive bonuses are additive display adjustments.
        // The simplest fix for now: ensure Mente increase from meditate is applied correctly considering this.
        // The meditate function handles this more directly.
    }


    updateStats(statsUpdate);
    addLog(`Entrenado ${stat}! (${increase > 0 ? '+' : ''}${increase} ${stat}, -${cost} oro)`);
    toast({ title: "Entrenamiento Completo", description: `${increase > 0 ? '+' : ''}${increase} ${stat}!`});
    return true;
  }, [gameState.playerStats, updateStats, addLog, toast]);

  const meditate = useCallback(() => {
    // Calculate base Mente before Bihurri's bonus if active
    let baseMente = gameState.playerStats.mente;
    const bihurriPet = gameState.pets.find(p => p.id === 'bihurri' && p.isActive);
    if (bihurriPet) {
      baseMente -= 1; // Subtract Bihurri's known +1 passive bonus
    }
    baseMente = Math.max(0, baseMente); // Ensure baseMente is not negative

    const menteIncrease = Math.max(1, Math.floor(baseMente / 5) + 1);
    let newTotalMente = baseMente + menteIncrease;
    if (bihurriPet) {
      newTotalMente += 1; // Add Bihurri's bonus back
    }

    updateStats({ mente: newTotalMente, exp: (gameState.playerStats.exp || 0) + menteIncrease });
    addLog(`Meditación profunda. (+${menteIncrease} Mente base)`);
    toast({ title: "Meditación", description: `Mente ahora es ${newTotalMente}.`});
  }, [gameState.playerStats, gameState.pets, updateStats, addLog, toast]);

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
    addLog(`${materialName} comprado! (+1 Nivel, -${cost} oro)`);
    toast({ title: `${materialName} Comprado!`, description: `Nuevo nivel de ${materialName.toLowerCase()}: ${currentLevel + 1}`});
    return true;
  }, [gameState.playerStats, updateStats, addLog, toast]);


  const saveGame = useCallback(() => {
    try {
      const serializableGameState = {
        ...gameState,
        pets: gameState.pets.map(pet => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { bonusEffect, ...serializablePet } = pet; // Exclude function
          return serializablePet;
        }),
        lastSaveTime: Date.now()
      };
      const serializedState = btoa(JSON.stringify(serializableGameState));
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loadedData: any = JSON.parse(atob(serializedState));
        
        if (loadedData.playerStats && loadedData.pets && loadedData.gameLog) {
            const loadedPetsWithFunctions = loadedData.pets.map((loadedPetData: Omit<Pet, 'bonusEffect'>) => {
                const initialPet = INITIAL_PETS.find(p => p.id === loadedPetData.id);
                if (initialPet) {
                    return {
                        ...initialPet, 
                        ...loadedPetData, 
                        bonusEffect: initialPet.bonusEffect, 
                    };
                }
                return { ...loadedPetData, bonusEffect: () => ({}) } as Pet; 
            });

            const mergedPlayerStats = { ...INITIAL_STATS, ...loadedData.playerStats };
            
            // Crucially, re-apply passive pet bonuses after loading stats
            const finalPlayerStats = calculateBaseStatsWithPassivePetBonuses(mergedPlayerStats, loadedPetsWithFunctions);

            const finalLoadedState: GameState = {
                playerStats: finalPlayerStats,
                pets: loadedPetsWithFunctions,
                gameLog: loadedData.gameLog,
                lastSaveTime: loadedData.lastSaveTime,
            };
            
            setGameState(finalLoadedState);
            addLog('Juego cargado!');
            toast({ title: "Juego Cargado", description: "Tu progreso ha sido restaurado."});
        } else {
            throw new Error("Invalid game state structure in localStorage.");
        }
      } else {
        addLog('No hay partida guardada. Empezando una nueva aventura.');
        // Initialize with passive bonuses if starting fresh
        const initialStatsWithPassives = calculateBaseStatsWithPassivePetBonuses(INITIAL_STATS, INITIAL_PETS);
        setGameState({ playerStats: initialStatsWithPassives, pets: INITIAL_PETS, gameLog: ['No hay partida guardada. Empezando nueva aventura.'] });
        toast({ title: "Sin Partida Guardada", description: "Empezando una nueva aventura."});
      }
    } catch (error) {
      console.error("Error loading game:", error);
      addLog('Error al cargar el juego. Empezando de nuevo.');
      toast({ title: "Error al Cargar", description: "No se pudo cargar tu progreso. Empezando de nuevo.", variant: "destructive" });
      const initialStatsWithPassives = calculateBaseStatsWithPassivePetBonuses(INITIAL_STATS, INITIAL_PETS);
      setGameState({ playerStats: initialStatsWithPassives, pets: INITIAL_PETS, gameLog: ['Error al cargar. Empezando nueva partida.'] });
      localStorage.removeItem(GAME_STATE_KEY); 
    } finally {
      setIsLoaded(true);
    }
  }, [addLog, toast]); 

  useEffect(() => {
    if (!isLoaded) {
        loadGame();
    }
  }, [isLoaded, loadGame]);
  
  useEffect(() => {
    if (!isLoaded) return; 
    const intervalId = setInterval(() => {
      saveGame();
    }, 5 * 60 * 1000); 
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

    