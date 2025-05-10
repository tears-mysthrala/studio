
"use client";
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CharacterAnimationProps {
  isChopping: boolean; // To control animation state, e.g., play only when an action is performed
}

export function CharacterAnimation({ isChopping }: CharacterAnimationProps) {
  return (
    <Card className="shadow-xl overflow-hidden">
      <CardContent className="p-2 flex justify-center items-center bg-secondary/30 aspect-square">
        {/* 
          The character-sprite-chopping class applies a background image and animation.
          The Image component here is a fallback or could be styled to be invisible
          if the background CSS animation is the primary visual.
          For a simpler setup, we can just use a div with the CSS class.
        */}
        <div 
          className={cn(
            "character-sprite",
            isChopping ? "character-sprite-chopping" : ""
          )}
          style={!isChopping ? { backgroundImage: `url(/sprites/character-idle-sprite.png)`} : {}}
          role="img"
          aria-label="Character Animation"
          data-ai-hint={isChopping ? "pixel art woodcutter sprite sheet" : "pixel art woodcutter idle"}
        >
           {/* If character-sprite uses background-image, this Image can be a fallback or removed */}
           {/* Fallback static image if CSS animation/sprite sheet is complex */}
           <Image 
                src={isChopping ? "https://picsum.photos/128/128?random=1" : "https://picsum.photos/128/128?random=2&grayscale"}
                alt="Character" 
                width={128} 
                height={128}
                className={cn("rounded-md opacity-0", { /* Make it invisible if CSS bg is preferred */})}
                data-ai-hint={isChopping ? "pixel art woodcutter sprite sheet" : "pixel art woodcutter idle"}
            />
        </div>
      </CardContent>
    </Card>
  );
}
