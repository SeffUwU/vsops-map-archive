'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DialogTitle } from '../ui/dialog';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface SearchableItem {
  id: string | number;
  title: string;
  subtitle?: string;
  searchTags?: string[];
  icon?: React.ReactNode;
}

interface SearchDialogProps<T extends SearchableItem> {
  items: T[];
  onSelect?: (item: T) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  placeholder?: string;
  emptyMessage?: string;
  groupHeading?: string;
  renderIcon?: (item: T) => React.ReactNode;
  renderActions?: (item: T) => React.ReactNode;
  headerAction?: React.ReactNode;
  maxResults?: number;
}

export function SearchDialog<T extends SearchableItem>({
  items,
  onSelect,
  isOpen,
  setIsOpen,
  placeholder = 'Search...',
  emptyMessage = 'No results found.',
  groupHeading = 'Results',
  renderIcon,
  renderActions,
  headerAction,
  maxResults = 200,
}: SearchDialogProps<T>) {
  const [query, setQuery] = useState('');
  const commandListRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    if (!query) return items.slice(0, maxResults);

    const s = query.toLowerCase();

    return items
      .filter((item) => {
        const searchableText = [item.id, item.title, item.subtitle, ...(item.searchTags || [])]
          .filter(Boolean)
          .map(String)
          .map((v) => v.toLowerCase());

        return searchableText.some((text) => text.includes(s));
      })
      .slice(0, maxResults);
  }, [query, items, maxResults]);

  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => commandListRef.current,
    estimateSize: () => 56,
    overscan: 5,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [filteredItems.length, virtualizer]);

  useEffect(() => {
    if (commandListRef.current) {
      commandListRef.current.scrollTop = 0;
    }
    virtualizer.scrollToIndex(0, { align: 'start' });
  }, [query, virtualizer]);

  const handleSelect = (item: T) => {
    if (onSelect) onSelect(item);
    setIsOpen(false);
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTitle className="sr-only">Search</DialogTitle>
      <div className="relative">
        <CommandInput placeholder={placeholder} value={query} onValueChange={setQuery} />
        {headerAction}
      </div>
      <CommandList ref={commandListRef} className="max-h-[400px]" cmdk-list-skip-native-filtering="true">
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        {filteredItems.length > 0 && (
          <CommandGroup heading={groupHeading}>
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const item = filteredItems[virtualRow.index];

                return (
                  <div
                    key={item?.id || item?.title}
                    data-index={virtualRow.index}
                    ref={(node) => virtualizer.measureElement(node)}
                    className="absolute left-0 top-0 w-full"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <CommandItem
                      value={`${item.title} ${item.subtitle || ''} ${(item.searchTags || []).join(' ')}`}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center gap-3 p-2 cursor-pointer"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted">
                        {renderIcon ? renderIcon(item) : item.icon}
                      </div>
                      <div className="flex flex-col flex-1">
                        <p className="text-sm font-medium leading-none">{item.title}</p>
                        {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
                      </div>
                      {renderActions && <div onClick={(e) => e.stopPropagation()}>{renderActions(item)}</div>}
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
