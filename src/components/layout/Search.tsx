'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { useVirtualizer } from '@tanstack/react-virtual';

interface SearchDialogProps {
  data: any[];
  onSelect?: (center: [number, number], feature: any) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function SearchDialog({ data, onSelect, isOpen, setIsOpen }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const commandListRef = useRef<HTMLDivElement>(null);

  const allFeatures = useMemo(() => {
    return data.flatMap((collection) => collection?.features || []);
  }, [data]);

  const filteredFeatures = useMemo(() => {
    if (!query) return allFeatures.slice(0, 200);

    const s = query.toLowerCase();

    return allFeatures
      .filter((f) => {
        const props = f.properties || {};
        const searchableFields = [
          f?.id,
          f?.props?.id,
          props.name,
          props.label,
          props.description,
          props.creatorId,
          props.type,
          props.wares,
        ]
          .filter(Boolean)
          .map(String)
          .map((v) => v.toLowerCase());

        return searchableFields.some((text) => text.includes(s));
      })
      .slice(0, 200);
  }, [query, allFeatures]);

  const virtualizer = useVirtualizer({
    count: filteredFeatures.length,
    getScrollElement: () => commandListRef.current,
    estimateSize: () => 56,
    overscan: 5,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [filteredFeatures.length, virtualizer]);

  // reset scroll position when query changes
  useEffect(() => {
    if (commandListRef.current) {
      commandListRef.current.scrollTop = 0;
    }
    virtualizer.scrollToIndex(0, { align: 'start' });
  }, [query, virtualizer]);

  const handleSelect = (feature: any) => {
    const center = getFeatureCenter(feature);

    if (onSelect) onSelect(center, feature);

    setIsOpen(false);
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTitle className="sr-only">Search Map Features</DialogTitle>
      <CommandInput placeholder="Search landmarks or bases..." value={query} onValueChange={setQuery} />
      <CommandList ref={commandListRef} className="max-h-[400px]" cmdk-list-skip-native-filtering="true">
        <CommandEmpty>No results found.</CommandEmpty>
        {filteredFeatures.length > 0 && (
          <CommandGroup heading="Locations">
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const f = filteredFeatures[virtualRow.index];
                const i = virtualRow.index;
                const searchableText = [
                  f?.id,
                  f?.props?.id,
                  f.properties?.name,
                  f.properties?.label,
                  f.properties?.wares,
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div
                    key={f.id || i}
                    data-index={virtualRow.index}
                    ref={(node) => virtualizer.measureElement(node)}
                    className="absolute left-0 top-0 w-full"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <CommandItem
                      value={searchableText}
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
                          {f.properties?.type || f.properties?.wares || 'Landmark'} • {f?.geometry?.type}
                          {/* {f.properties?.creatorId && ` • by ${f.properties.creatorId}`} */}
                        </p>
                      </div>
                    </CommandItem>
                  </div>
                );
              })}
            </div>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
