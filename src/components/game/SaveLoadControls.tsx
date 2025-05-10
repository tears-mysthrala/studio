
"use client";
import { Button } from '@/components/ui/button';
import { Save, FolderOpen } from 'lucide-react';

interface SaveLoadControlsProps {
  onSave: () => void;
  onLoad: () => void;
  isLoaded: boolean;
}

export function SaveLoadControls({ onSave, onLoad, isLoaded }: SaveLoadControlsProps) {
  return (
    <div className="flex space-x-2 p-4 bg-card rounded-lg shadow-md justify-center">
      <Button onClick={onSave} disabled={!isLoaded} variant="secondary" className="shadow-sm">
        <Save className="mr-2 h-4 w-4" /> Guardar Juego
      </Button>
      <Button onClick={onLoad} disabled={!isLoaded} variant="secondary" className="shadow-sm">
        <FolderOpen className="mr-2 h-4 w-4" /> Cargar Juego
      </Button>
    </div>
  );
}
