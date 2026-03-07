import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChangeEvent, useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface PromptProps {
  isOpen: boolean;
  onClose: (name: DialogBuilder.Result<any>) => void;
  config: DialogBuilder.FieldBuilderConfig;
}

export function FeaturePromptDialog({ isOpen, onClose, config }: PromptProps) {
  const [value, setValue] = useState(
    config.fields.reduce(
      (acc, field) => {
        acc[field.name] = field.defaultValue;
        return acc;
      },
      {} as Record<string, string>,
    ),
  );

  const bindValueHandler = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setValue((prev) => ({ ...prev, [name]: e.target.value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose({ cancelled: true, data: null })}>
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
                    <Select value={value[field.name]}>
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
              return null;
            })}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose({ cancelled: true, data: null })}>
            Cancel
          </Button>
          <Button onClick={() => onClose({ cancelled: false, data: value })}>Save Feature</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
