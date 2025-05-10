
"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect, useRef } from 'react';

interface GameLogProps {
  logs: string[];
}

export function GameLog({ logs }: GameLogProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [logs]);

  return (
    <Card className="shadow-xl h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center text-primary-foreground bg-primary/70 p-2 rounded-t-md -m-6 mb-0">Registro de Sucesos</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center itaic">El registro está vacío.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {logs.map((log, index) => (
                <li key={index} className="text-foreground/80 leading-tight">
                  {log}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
