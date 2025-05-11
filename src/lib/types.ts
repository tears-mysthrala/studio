
export interface PlayerStats {
  resistencia: number; // Repeticiones base
  fuerza: number;      // Daño base
  mente: number;       // Multiplicador de Experiencia
  alimentacion: number; // Reduce tiempo de recuperación (Limite 8)
  angulo: number;      // Multiplicador fuerza (Limite 20)
  posicion: number;    // Multiplicador resistencia (Limite 50)
  velocidad: number;   // Tiempo entre repeticiones base
  materialCabeza: number; // Multiplicador infinito de fuerza
  materialMango: number; // Multiplicador infinito de resistencia
  filo: number;        // Exponente de fuerza (colores)
  
  // Currency or experience, if needed
  oro: number;
  exp: number;
}

export interface Pet {
  id: string;
  nombre: string;
  tipo: string;
  spriteUrl: string; // URL to the pet's sprite
  dataAiHint?: string; // For placeholder images
  bonusText: string; // Description of the bonus
  bonusEffect: (stats: PlayerStats) => Partial<PlayerStats>; // Function to apply bonus
  isActive: boolean;
}

export interface GameState {
  playerStats: PlayerStats;
  pets: Pet[];
  gameLog: string[];
  lastSaveTime?: number;
}

export type StatKey = keyof PlayerStats;

export interface ActionItem {
  id: StatKey | 'chopWood' | 'meditate' | 'improveBlade' | 'buyMaterialCabeza' | 'buyMaterialMango' | 'petAction';
  name: string;
  description: string;
  cost?: { oro?: number; exp?: number };
  icon?: React.ElementType;
  actionFn?: (currentStats?: PlayerStats) => Partial<PlayerStats> | void | boolean; // Made currentStats optional for actions like chopWood
  buttonVariant?: "default" | "secondary" | "accent" | "destructive" | "outline" | "ghost" | "link" | "primary";
}

