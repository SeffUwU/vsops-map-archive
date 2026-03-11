import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChangeEvent, useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileUploadField } from '../fields/FileField';
import { deleteImageAction } from '@/server/actions/uploads/images';

interface PromptProps {
  isOpen: boolean;
  onClose: (name: DialogBuilder.Result<any>) => void;
  config: DialogBuilder.FieldBuilderConfig;
  currentValues?: Record<string, string>;
}

export function FeaturePromptDialog({ isOpen, onClose, config, currentValues }: PromptProps) {
  const [value, setValue] = useState(
    config.fields.reduce(
      (acc, field) => {
        acc[field.name] = currentValues ? currentValues[field.name] : field.defaultValue;
        return acc;
      },
      {} as Record<string, string>,
    ),
  );
  const [sessionUploadedIds, setSessionUploadedIds] = useState<string[]>([]);

  const bindValueHandler = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setValue((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleCancel = async () => {
    if (sessionUploadedIds.length > 0) {
      await Promise.all(sessionUploadedIds.map(deleteImageAction));
    }

    onClose({ cancelled: true, data: null });
  };

  const onUploadSuccessHandler = (fieldName: string, newId: string) => {
    setValue((prev) => {
      const currentRawValue = prev[fieldName] || '';
      const updatedValue = currentRawValue ? `${currentRawValue},${newId}` : newId;

      return { ...prev, [fieldName]: updatedValue };
    });

    setSessionUploadedIds((prev) => [...prev, newId]);
  };

  const onManualDeleteHandler = (fieldName: string, idToRemove: string) => {
    setValue((prev) => {
      const currentIds = prev[fieldName].split(',').filter((id) => id !== idToRemove);
      return { ...prev, [fieldName]: currentIds.join(',') };
    });
    setSessionUploadedIds((prev) => prev.filter((i) => i !== idToRemove));
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
                      value={value[field.name] || ''}
                      onUploadSuccess={(id) => onUploadSuccessHandler(field.name, id)}
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
