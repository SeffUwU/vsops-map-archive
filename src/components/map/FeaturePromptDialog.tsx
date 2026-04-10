import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChangeEvent, useEffect, useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileUploadField } from '../fields/FileField';
import { deleteImageAction } from '@/server/actions/uploads/images';
import { MediaItem } from '@/types/map/vsmap';
import { User, X } from 'lucide-react';

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
        description: '',
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
            description: '',
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

  const bindValueHandler = (name: string) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

      const existingIndex = existingItems.findIndex((item) => item.id === mediaItem.id);
      if (existingIndex >= 0) {
        const updatedItems = [...existingItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          ...mediaItem,
          description: mediaItem.description ?? updatedItems[existingIndex].description,
        };
        return { ...prev, [fieldName]: updatedItems };
      }

      return { ...prev, [fieldName]: [...existingItems, mediaItem] };
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
                    <Label htmlFor={field.name} className="text-right">
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

              if (field.type === 'textarea') {
                return (
                  <div key={idx}>
                    <Label htmlFor={field.name} className="text-right">
                      {field.title}
                    </Label>
                    <Textarea
                      id={field.name}
                      value={value[field.name]}
                      onChange={bindValueHandler(field.name)}
                      className="col-span-3"
                      rows={field.rows ?? 3}
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
                            <SelectItem value={value as any} key={value}>
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

              if (field.type === 'members') {
                const members: string[] = value[field.name] || [];
                const [memberInput, setMemberInput] = useState('');

                const addMember = () => {
                  if (memberInput.trim() && !members.includes(memberInput.trim())) {
                    setValue((prev) => ({
                      ...prev,
                      [field.name]: [...(prev[field.name] || []), memberInput.trim()],
                    }));
                    setMemberInput('');
                  }
                };

                const removeMember = (member: string) => {
                  setValue((prev) => ({
                    ...prev,
                    [field.name]: (prev[field.name] || []).filter((m: string) => m !== member),
                  }));
                };

                return (
                  <div key={idx}>
                    <Label htmlFor={field.name}>{field.title}</Label>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {members.map((member) => (
                        <div key={member} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                          <User className="h-3 w-3" />
                          <span>{member}</span>
                          <button
                            onClick={() => removeMember(member)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={memberInput}
                        onChange={(e) => setMemberInput(e.target.value)}
                        placeholder="Add member..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addMember();
                          }
                        }}
                      />
                      <Button size="sm" onClick={addMember}>
                        Add
                      </Button>
                    </div>
                  </div>
                );
              }

              if (field.type === 'coordinate') {
                const coord: [number, number] = value[field.name] || [0, 0];

                return (
                  <div key={idx}>
                    <Label htmlFor={field.name}>{field.title}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={coord[0]}
                        onChange={(e) =>
                          setValue((prev) => ({
                            ...prev,
                            [field.name]: [parseInt(e.target.value) || 0, prev[field.name]?.[1] ?? 0],
                          }))
                        }
                        placeholder="X"
                      />
                      <Input
                        type="number"
                        value={coord[1]}
                        onChange={(e) =>
                          setValue((prev) => ({
                            ...prev,
                            [field.name]: [prev[field.name]?.[0] ?? 0, parseInt(e.target.value) || 0],
                          }))
                        }
                        placeholder="Y"
                      />
                    </div>
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
