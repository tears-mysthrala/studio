
"use client";
import type { Pet } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';

interface PetDisplayProps {
  pets: Pet[];
}

export function PetDisplay({ pets }: PetDisplayProps) {
  const activePets = pets.filter(pet => pet.isActive);

  if (activePets.length === 0) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary-foreground bg-primary/80 p-2 rounded-t-md -m-6 mb-0">Mascotas</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No tienes mascotas activas.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary-foreground bg-primary/80 p-2 rounded-t-md -m-6 mb-0">Mascotas Activas</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {activePets.map((pet) => (
          <div key={pet.id} className="flex items-center space-x-4 p-3 bg-card-foreground/5 rounded-lg shadow-sm">
            <div className="pet-sprite">
              <Image 
                src={pet.spriteUrl} 
                alt={pet.nombre} 
                width={64} 
                height={64} 
                className="rounded-md border border-border"
                data-ai-hint={pet.dataAiHint || "pixel art creature"}
                onError={(e) => { e.currentTarget.src = 'https://picsum.photos/64/64?grayscale'; }} // Fallback
              />
            </div>
            <div>
              <h4 className="font-semibold text-lg text-accent-foreground">{pet.nombre} <span className="text-sm text-muted-foreground">({pet.tipo})</span></h4>
              <p className="text-sm text-foreground/80">{pet.bonusText}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
