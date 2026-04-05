'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, BookOpen } from 'lucide-react';

export function InfoButtons() {
  const [legendOpen, setLegendOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="flex flex-row gap-2">
      <Dialog open={legendOpen} onOpenChange={setLegendOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="sm" className="px-2">
            <BookOpen className="h-4 w-4 mr-1" />
            Legend
          </Button>
        </DialogTrigger>
        <DialogContent
          className="max-w-md"
          style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
        >
          <DialogHeader>
            <DialogTitle>Map Legend</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--muted))' }}>
              <span className="text-xl ">⭐</span>
              <p className="text-muted-foreground">
                Feature has been <strong>updated</strong> since the last time you visited (stored locally in your
                browser)
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--muted))' }}>
              <span className="text-xl">🖼️</span>
              <p className="text-muted-foreground">
                Feature has <strong>Photos or Screenshots</strong>. Right-click → Inspect to access detailed information
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="px-2"
            style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
          >
            <Info className="h-4 w-4 mr-1" />
            Info
          </Button>
        </DialogTrigger>
        <DialogContent
          className="max-w-md"
          style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
        >
          <DialogHeader>
            <DialogTitle>About TOPS Archive</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              This is a <strong>work in progress</strong> project to create a community map archive for Vintage Story.
            </p>
            <p className="text-muted-foreground">
              If you have any questions or feedback, please contact me in-game: <strong>Sefian</strong> or thru discord{' '}
              <strong>@seffano</strong>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
