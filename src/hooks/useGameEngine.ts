
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
    bonusText: '+1 Mente (Pasivo)',
    bonusEffect: (stats: PlayerStats): Partial<PlayerStats> => ({ }), 
    isActive: true,
  },
  {
    id: 'mishi',
    nombre: 'Mishi',
    tipo: 'Gato Místico',
    spriteUrl: '/sprites/pet-mishi-sprite.png',
    dataAiHint: 'pixel art calico cat',
    bonusText: 'Aumenta eficiencia (temporal)',
    bonusEffect: (stats: PlayerStats): Partial<PlayerStats> => ({ }), 
    isActive: false, 
  }
];

const calculateBaseStatsWithPassivePetBonuses = (stats: PlayerStats, pets: Pet[]): PlayerStats => {
  let newStats = { ...stats };
  pets.forEach(pet => {
    if (pet.isActive) {
      if (pet.id === 'bihurri' && typeof newStats.mente === 'number') {
        newStats.mente = (newStats.mente || 0) + 1;
      }
    }
  });
  return newStats;
};


const GAME_STATE_KEY = 'haizkolariIdleGameState';

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const baseStats = INITIAL_STATS;
    const statsWithPassiveBonuses = calculateBaseStatsWithPassivePetBonuses(baseStats, INITIAL_PETS);
    return {
      playerStats: statsWithPassiveBonuses,
      pets: INITIAL_PETS.map(pet => ({
        ...pet,
        // Ensure bonusEffect is a function, even if it's a no-op from loaded data
        bonusEffect: typeof pet.bonusEffect === 'function' ? pet.bonusEffect : () => ({}),
      })),
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
      let updatedPlayerStats = { ...prev.playerStats, ...newStatsChanges };
      
      prev.pets.forEach(pet => {
        if (pet.isActive && typeof pet.bonusEffect === 'function') {
          const dynamicBonus = pet.bonusEffect(updatedPlayerStats); 
          for (const key in dynamicBonus) {
            const statKey = key as StatKey;
            const bonusValue = dynamicBonus[statKey];
            if (updatedPlayerStats[statKey] !== undefined && bonusValue !== undefined && typeof updatedPlayerStats[statKey] === 'number' && typeof bonusValue === 'number') {
                 (updatedPlayerStats[statKey] as number) += bonusValue; 
            }
          }
        }
      });

      return { ...prev, playerStats: updatedPlayerStats };
    });
  }, []);
  
  const trainStat = useCallback((stat: StatKey, amount = 1) => {
    if (stat === 'oro' || stat === 'exp') return false;

    if (stat === 'alimentacion' && gameState.playerStats.alimentacion >= 8) {
      addLog(`Alimentación ya está al máximo (8).`);
      toast({ title: "Límite Alcanzado", description: "Tu alimentación ya está al máximo.", variant: "destructive" });
      return false;
    }

    const currentStatValue = gameState.playerStats[stat] || 0;
    let cost = 0;
    
    if (['fuerza', 'resistencia', 'angulo', 'posicion', 'velocidad', 'mente', 'alimentacion'].includes(stat)){
       cost = Math.floor(Math.pow(currentStatValue, 1.1) + 5);
    }
        
    if (gameState.playerStats.oro < cost) {
        addLog(`No tienes suficiente oro para entrenar ${stat}. Necesitas ${cost} oro.`);
        toast({ title: "Sin Oro", description: `Necesitas ${cost} oro para entrenar ${stat}.`, variant: "destructive" });
        return false;
    }

    let increase = amount;
    if ((stat === 'fuerza' || stat === 'resistencia') && typeof gameState.playerStats.mente === 'number') {
      increase = Math.max(1, Math.floor(amount * (gameState.playerStats.mente / 10)));
    } else if (stat === 'mente' && amount === 1 && typeof gameState.playerStats.mente === 'number') { 
        increase = Math.max(1, Math.floor(gameState.playerStats.mente / 5) + 1);
    }

    const newStatValue = stat === 'velocidad' ? Math.max(50, currentStatValue + increase) : currentStatValue + increase;

    const statsUpdate: Partial<PlayerStats> = {
      [stat]: newStatValue,
      oro: gameState.playerStats.oro - cost,
      exp: gameState.playerStats.exp + (stat === 'velocidad' ? Math.floor(cost / 2) : Math.floor(Math.abs(increase) / 2))
    };
    
    updateStats(statsUpdate);
    addLog(`Entrenado ${stat}! (${increase > 0 ? '+' : ''}${increase} ${stat}, -${cost} oro)`);
    toast({ title: "Entrenamiento Completo", description: `${increase > 0 ? '+' : ''}${increase} ${stat}!`});
    return true;
  }, [gameState.playerStats, updateStats, addLog, toast]);

  const meditate = useCallback(() => {
    let baseMente = gameState.playerStats.mente;
    const bihurriPet = gameState.pets.find(p => p.id === 'bihurri' && p.isActive);
    if (bihurriPet && typeof baseMente === 'number') {
      baseMente -= 1; 
    }
    baseMente = Math.max(0, typeof baseMente === 'number' ? baseMente : 0); 

    const menteIncrease = Math.max(1, Math.floor(baseMente / 5) + 1);
    let newTotalMente = baseMente + menteIncrease;
    if (bihurriPet && typeof newTotalMente === 'number') {
      newTotalMente += 1; 
    }

    updateStats({ mente: newTotalMente, exp: gameState.playerStats.exp + menteIncrease });
    addLog(`Meditación profunda. (+${menteIncrease} Mente base)`);
    toast({ title: "Meditación", description: `Mente ahora es ${newTotalMente}.`});
  }, [gameState.playerStats, gameState.pets, updateStats, addLog, toast]);

  const improveBlade = useCallback(() => {
    const cost = Math.floor(Math.pow(gameState.playerStats.filo, 1.5) * 10 + 20);
    if (gameState.playerStats.oro < cost) {
        addLog(`No tienes suficiente oro para mejorar el filo. Necesitas ${cost} oro.`);
        toast({ title: "Sin Oro", description: `Necesitas ${cost} oro para mejorar el filo.`, variant: "destructive" });
        return false;
    }
    updateStats({ 
        filo: gameState.playerStats.filo + 1,
        oro: gameState.playerStats.oro - cost,
        exp: gameState.playerStats.exp + gameState.playerStats.filo * 2
    });
    addLog(`Filo mejorado! (+1 Filo, -${cost} oro)`);
    toast({ title: "Filo Mejorado", description: `Nuevo nivel de filo: ${gameState.playerStats.filo + 1}`});
    return true;
  }, [gameState.playerStats, updateStats, addLog, toast]);

  const buyMaterial = useCallback((materialType: 'materialCabeza' | 'materialMango') => {
    const currentLevel = gameState.playerStats[materialType];
    const cost = Math.floor(Math.pow(currentLevel, 2) * 50 + 100);
     if (gameState.playerStats.oro < cost) {
        addLog(`No tienes suficiente oro para comprar ${materialType}. Necesitas ${cost} oro.`);
        toast({ title: "Sin Oro", description: `Necesitas ${cost} oro para comprar ${materialType}.`, variant: "destructive" });
        return false;
    }
    updateStats({ 
        [materialType]: currentLevel + 1,
        oro: gameState.playerStats.oro - cost,
    });
    const materialName = materialType === 'materialCabeza' ? 'Material de Cabeza' : 'Material de Mango';
    addLog(`${materialName} comprado! (+1 Nivel, -${cost} oro)`);
    toast({ title: `${materialName} Comprado!`, description: `Nuevo nivel de ${materialName.toLowerCase()}: ${currentLevel + 1}`});
    return true;
  }, [gameState.playerStats, updateStats, addLog, toast]);

  const chopWood = useCallback(() => {
    const { fuerza, filo, angulo, materialCabeza, exp: currentExp, oro: currentOro } = gameState.playerStats;
    
    const effectiveStrength = fuerza * (1 + angulo / 100) * materialCabeza * Math.pow(1.1, filo -1);
    
    const goldGained = Math.max(1, Math.floor(effectiveStrength / 2));
    const expGained = Math.max(1, Math.floor(effectiveStrength / 10));

    updateStats({
      oro: currentOro + goldGained,
      exp: currentExp + expGained,
    });

    addLog(`Madera cortada! (+${goldGained} Oro, +${expGained} EXP)`);
    toast({ title: "Madera Cortada", description: `+${goldGained} Oro, +${expGained} EXP` });
    return true;
  }, [gameState.playerStats, updateStats, addLog, toast]);


  const saveGame = useCallback(() => {
    try {
      const serializableGameState = {
        ...gameState,
        pets: gameState.pets.map(pet => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { bonusEffect, ...serializablePet } = pet; 
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
                const initialPetTemplate = INITIAL_PETS.find(p => p.id === loadedPetData.id);
                return {
                    ...initialPetTemplate, // Provides the bonusEffect function and other defaults
                    ...loadedPetData, // Overwrites with loaded data like isActive, nombre, etc.
                    bonusEffect: initialPetTemplate && typeof initialPetTemplate.bonusEffect === 'function' 
                                 ? initialPetTemplate.bonusEffect 
                                 : () => ({}), // Ensure bonusEffect is always a function
                };
            });

            const mergedPlayerStats = { ...INITIAL_STATS, ...loadedData.playerStats };
            const finalPlayerStats = calculateBaseStatsWithPassivePetBonuses(mergedPlayerStats, loadedPetsWithFunctions as Pet[]);


            const finalLoadedState: GameState = {
                playerStats: finalPlayerStats,
                pets: loadedPetsWithFunctions as Pet[],
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
        const initialStatsWithPassives = calculateBaseStatsWithPassivePetBonuses(INITIAL_STATS, INITIAL_PETS.map(p => ({...p, bonusEffect: typeof p.bonusEffect === 'function' ? p.bonusEffect : () => ({})})));
        setGameState({ playerStats: initialStatsWithPassives, pets: INITIAL_PETS.map(p => ({...p, bonusEffect: typeof p.bonusEffect === 'function' ? p.bonusEffect : () => ({})})), gameLog: ['No hay partida guardada. Empezando nueva aventura.'] });
        toast({ title: "Sin Partida Guardada", description: "Empezando una nueva aventura."});
      }
    } catch (error) {
      console.error("Error loading game:", error);
      addLog('Error al cargar el juego. Empezando de nuevo.');
      toast({ title: "Error al Cargar", description: "No se pudo cargar tu progreso. Empezando de nuevo.", variant: "destructive" });
      const initialStatsWithPassives = calculateBaseStatsWithPassivePetBonuses(INITIAL_STATS, INITIAL_PETS.map(p => ({...p, bonusEffect: typeof p.bonusEffect === 'function' ? p.bonusEffect : () => ({})})));
      setGameState({ playerStats: initialStatsWithPassives, pets: INITIAL_PETS.map(p => ({...p, bonusEffect: typeof p.bonusEffect === 'function' ? p.bonusEffect : () => ({})})), gameLog: ['Error al cargar. Empezando nueva partida.'] });
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
    chopWood,
    addLog,
    saveGame,
    loadGame,
  };
}

