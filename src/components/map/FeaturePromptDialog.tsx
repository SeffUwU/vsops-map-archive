import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChangeEvent, useEffect, useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileUploadField } from '../fields/FileField';
import { deleteImageAction } from '@/server/actions/uploads/images';
import { MediaItem } from '@/types/map/vsmap';

// helper function to extract MediaItem objects from differemt formats
function extractMediaItems(value: any): MediaItem[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'object' && item !== null && 'id' in item) {
        return item as MediaItem;
      }
      return {
        id: typeof item === 'string' ? item : String(item),
        mimeType: '',
        used: false,
        createdAt: new Date(),
      } as MediaItem;
    });
  }

  if (typeof value === 'string') {
    // Old format: comma-separated IDs - convert to MediaItem array
    return value
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .map(
        (id) =>
          ({
            id,
            mimeType: '',
            used: false,
            createdAt: new Date(),
          }) as MediaItem,
      );
  }

  return [];
}

interface PromptProps {
  isOpen: boolean;
  onClose: (name: DialogBuilder.Result<any>) => void;
  config: DialogBuilder.FieldBuilderConfig;
  currentValues?: Record<string, any>;
}

export function FeaturePromptDialog({ isOpen, onClose, config, currentValues }: PromptProps) {
  const [value, setValue] = useState(
    config.fields.reduce(
      (acc, field) => {
        acc[field.name] = currentValues ? currentValues[field.name] : field.defaultValue;
        return acc;
      },
      {} as Record<string, any>,
    ),
  );
  const [sessionUploadedIds, setSessionUploadedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentValues?.images) {
      const existingItems = extractMediaItems(currentValues.images);
      setSessionUploadedIds(new Set(existingItems.map((item) => item.id)));
    }
  }, [currentValues]);

  const bindValueHandler = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setValue((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleCancel = async () => {
    const currentImages = extractMediaItems(value.images);
    const existingIds = currentValues?.images ? extractMediaItems(currentValues.images).map((item) => item.id) : [];
    const idsToDelete = Array.from(sessionUploadedIds).filter(
      (id) => !existingIds.includes(id) || !currentImages.find((item) => item.id === id),
    );

    if (idsToDelete.length > 0) {
      await Promise.all(idsToDelete.map(deleteImageAction));
    }

    onClose({ cancelled: true, data: null });
  };

  const onUploadSuccessHandler = (fieldName: string, mediaItem: MediaItem) => {
    setValue((prev) => {
      const currentValue = prev[fieldName];
      const existingItems = extractMediaItems(currentValue);

      if (!existingItems.find((item) => item.id === mediaItem.id)) {
        const updatedItems = [...existingItems, mediaItem];
        return { ...prev, [fieldName]: updatedItems };
      }

      return prev;
    });

    setSessionUploadedIds((prev) => new Set(prev).add(mediaItem.id));
  };

  const onManualDeleteHandler = (fieldName: string, idToRemove: string) => {
    setValue((prev) => {
      const currentItems = extractMediaItems(prev[fieldName]).filter((item) => item.id !== idToRemove);
      return { ...prev, [fieldName]: currentItems };
    });
    setSessionUploadedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(idToRemove);
      return newSet;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{config.title ?? 'Dialog'}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex-1 flex flex-col gap-2">
            {config.fields.map((field, idx) => {
              if (field.type === 'text') {
                return (
                  <div key={idx}>
                    <Label htmlFor="name" className="text-right">
                      {field.title}
                    </Label>
                    <Input
                      id={field.name}
                      value={value[field.name]}
                      onChange={bindValueHandler(field.name)}
                      className="col-span-3"
                      autoFocus={idx === 0}
                    />
                  </div>
                );
              }

              if (field.type === 'select') {
                return (
                  <div key={idx}>
                    <Label htmlFor="name" className="text-right">
                      {field.title}
                    </Label>
                    <Select
                      value={value[field.name]}
                      onValueChange={(v) => setValue((prev) => ({ ...prev, [field.name]: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {field.values.map(({ title, value }) => (
                            <SelectItem value={value} key={value}>
                              {title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              if (field.type === 'file') {
                return (
                  <div key={idx}>
                    <FileUploadField
                      label={field.title}
                      value={value[field.name] || []}
                      onUploadSuccess={(mediaItem) => onUploadSuccessHandler(field.name, mediaItem)}
                      onManualDelete={(id) => onManualDeleteHandler(field.name, id)}
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={() => onClose({ cancelled: false, data: value })}>Save Feature</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
