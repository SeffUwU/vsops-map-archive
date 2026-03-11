'use client';

import React, { useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { getFeatureCenter } from '@/lib/map/map.utils';
import { DialogTitle } from '../ui/dialog';

interface SearchDialogProps {
  data: any[];
  onSelect?: (center: [number, number], feature: any) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function SearchDialog({ data, onSelect, isOpen, setIsOpen }: SearchDialogProps) {
  const [query, setQuery] = useState('');

  const allFeatures = useMemo(() => {
    return data.flatMap((collection) => collection.features || []);
  }, [data]);

  const filteredResults = useMemo(() => {
    if (!query) return allFeatures.slice(0, 10);

    const s = query.toLowerCase();

    return allFeatures
      .filter((f) => {
        const name = f.properties?.name?.toLowerCase() || '';
        const label = f.properties?.label?.toLowerCase() || '';

        return name.includes(s) || label.includes(s);
      })
      .slice(0, 10);
  }, [query, allFeatures]);

  const handleSelect = (feature: any) => {
    const center = getFeatureCenter(feature);

    if (onSelect) onSelect(center, feature);

    setIsOpen(false);
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTitle className="sr-only">Search Map Features</DialogTitle>
      <CommandInput placeholder="Search landmarks or bases..." value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {filteredResults.length > 0 && (
          <CommandGroup heading="Locations">
            {filteredResults.map((f, i) => (
              <CommandItem
                key={f.id || i}
                value={f.id || i}
                onSelect={() => handleSelect(f)}
                className="flex items-center gap-3 p-2 cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none">
                    {f.properties?.name || f.properties?.label || '%NO NAME%'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {f.properties?.type || 'Landmark'} • {f?.geometry?.type}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
