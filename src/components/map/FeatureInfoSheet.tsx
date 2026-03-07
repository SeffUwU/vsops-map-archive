import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Dispatch, SetStateAction } from 'react';

interface FeatureInfoSheetProps {
  data: Record<string, string> | null;
  setInspectData: Dispatch<SetStateAction<Record<string, string> | null>>;
}
export function FeatureInfoSheet({ data, setInspectData }: FeatureInfoSheetProps) {
  return (
    <Sheet
      open={!!data}
      onOpenChange={(open) => {
        if (!open) {
          setInspectData(null);
        }
      }}
      modal={false}
    >
      <SheetContent
        className="flex flex-col justify-between"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle>{data?.name || data?.label || 'Info'}</SheetTitle>
          <SheetDescription>{data?.description}</SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          {data &&
            Object.entries(data)
              .filter(([k]) => !['name', 'description', 'label'].includes(k))
              .map(([k, v]) => {
                console.log(k, v);
                return (
                  <div key={k}>
                    <Label>{k}</Label>
                    <p>{v}</p>
                  </div>
                );
              })}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
