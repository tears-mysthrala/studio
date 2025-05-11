
"use client";
import { PlayerStatsDisplay } from '@/components/game/PlayerStats';
import { PetDisplay } from '@/components/game/PetDisplay';
import { CharacterAnimation } from '@/components/game/CharacterAnimation';
import { ActionList } from '@/components/game/ActionList';
import { GameLog } from '@/components/game/GameLog';
import { SaveLoadControls } from '@/components/game/SaveLoadControls';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function HaizkolariIdlePage() {
  const {
    gameState,
    isLoaded,
    trainStat,
    meditate,
    improveBlade,
    buyMaterial,
    chopWood, // Added chopWood
    saveGame,
    loadGame,
  } = useGameEngine();

  const [isChopping, setIsChopping] = useState(false);

  const handleAction = (actionFn: () => boolean | void) => {
    const success = actionFn();
    if (success || success === undefined) { 
      setIsChopping(true);
      setTimeout(() => setIsChopping(false), 800); 
    }
  };
  
  const handleTrainStat = (stat: keyof typeof gameState.playerStats, amount?:number) => {
     handleAction(() => trainStat(stat, amount));
  }
  const handleMeditate = () => handleAction(meditate);
  const handleImproveBlade = () => handleAction(improveBlade);
  const handleBuyMaterial = (materialType: 'materialCabeza' | 'materialMango') => handleAction(() => buyMaterial(materialType));
  const handleChopWood = () => handleAction(chopWood); // Added handler for chopWood


  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-xl">Cargando Haizkolari Idle...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-2 sm:p-4 lg:p-6">
      <header className="mb-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary tracking-tight">Haizkolari Idle</h1>
        <p className="text-lg text-muted-foreground">Conviértete en el campeón intergaláctico de la corta de madera.</p>
      </header>
      
      <SaveLoadControls onSave={saveGame} onLoad={loadGame} isLoaded={isLoaded} />

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <CharacterAnimation isChopping={isChopping} />
          <PlayerStatsDisplay stats={gameState.playerStats} />
          <PetDisplay pets={gameState.pets} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 grid grid-rows-[auto_1fr] gap-4 sm:gap-6">
            <ActionList
                playerStats={gameState.playerStats}
                onTrainStat={handleTrainStat}
                onMeditate={handleMeditate}
                onImproveBlade={handleImproveBlade}
                onBuyMaterial={handleBuyMaterial}
                onChopWood={handleChopWood} // Passed chopWood handler
            />
            <GameLog logs={gameState.gameLog} />
        </div>
      </main>
      
      <footer className="mt-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Kalista. Inspirado en las tradiciones Haizkolari.</p>
        <p>Sitio Web: Haizko-idle.kalista.app (Próximamente)</p>
      </footer>
    </div>
  );
}

