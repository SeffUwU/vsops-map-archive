'use client';

import { useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { getFeatureCenter } from '@/lib/map/map.utils';
import { SearchDialog, SearchableItem } from './Search';

interface FeatureSearchDialogProps {
  data: any[];
  onSelect?: (center: [number, number], feature: any) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function FeatureSearchDialog({ data, onSelect, isOpen, setIsOpen }: FeatureSearchDialogProps) {
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  const allFeatures = useMemo(() => {
    return data.flatMap((collection) => collection?.features || []);
  }, [data]);

  const items: SearchableItem[] = useMemo(() => {
    return allFeatures.map((f) => ({
      id: f.id || Math.random().toString(),
      title: f.properties?.name || f.properties?.label || '%NO NAME%',
      subtitle: `${f.properties?.type || f.properties?.wares || 'Landmark'} • ${f?.geometry?.type}`,
      searchTags: [f?.id, f?.props?.id, f.properties?.name, f.properties?.label, f.properties?.description, f.properties?.creatorId, f.properties?.type, f.properties?.wares].filter(Boolean).map(String),
    }));
  }, [allFeatures]);

  const handleSelect = (item: SearchableItem) => {
    const feature = allFeatures.find((f) => (f.id || Math.random().toString()) === item.id);
    if (feature) {
      const center = getFeatureCenter(feature);
      if (onSelect) onSelect(center, feature);
    }
  };

  return (
    <SearchDialog
      items={items}
      onSelect={handleSelect}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      placeholder="Search landmarks or bases..."
      emptyMessage="No results found."
      groupHeading="Locations"
      renderIcon={() => <MapPin className="h-4 w-4 text-muted-foreground" />}
    />
  );
}
