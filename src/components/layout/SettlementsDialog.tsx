'use client';

import { useState, useMemo, useRef } from 'react';
import { useGlobalContext } from '../contexts/global.client.context';
import { ISettlement } from '@/entities/settlement';
import { SearchDialog, SearchableItem } from './Search';
import { Globe, Pencil, Trash2, Plus, Eye } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { updateSettlement, deleteSettlement, createSettlement } from '@/server/actions/settlements/settlements.actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FeaturePromptDialog } from '../map/FeaturePromptDialog';
import { getSettlementDialogConfig } from '@/types/map/settlement-dialog.config';
import { useTranslation } from '../contexts/global.client.context';
import { InfoSheet, InfoSheetData } from '../map/FeatureInfoSheet';

interface SettlementsDialogProps {
  settlements: ISettlement[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCreateSuccess?: () => void;
}

export function SettlementsDialog({ settlements, isOpen, setIsOpen, onCreateSuccess }: SettlementsDialogProps) {
  const {
    map: { mapRef },
    user,
  } = useGlobalContext();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslation();
  const settlementDialogConfig = useRef(getSettlementDialogConfig(t));
  const [promptConfig, setPromptConfig] = useState<{
    isOpen: boolean;
    resolve: (val: any) => void;
    config: DialogBuilder.FieldBuilderConfig;
    currentValues?: Record<string, any>;
  } | null>(null);
  const [viewingSettlement, setViewingSettlement] = useState<ISettlement | null>(null);
  const [infoSheetData, setInfoSheetData] = useState<InfoSheetData | null>(null);

  function asyncPrompt<T extends DialogBuilder.FieldBuilderConfig>(
    fieldConfig: T,
    currentValues?: DialogBuilder.MapFieldsToData<T>,
  ): Promise<DialogBuilder.Result<T>> {
    return new Promise((resolve) => {
      setPromptConfig({ isOpen: true, resolve, config: fieldConfig, currentValues });
    });
  }

  const items: SearchableItem[] = useMemo(() => {
    return settlements.map((s) => ({
      id: s.id,
      title: s.name,
      subtitle: `Leader: ${s.leader} • Members: ${s.members.length}`,
      searchTags: [s.name, s.description, s.leader, ...s.members],
    }));
  }, [settlements]);

  const handleSelect = (item: SearchableItem) => {
    const settlement = settlements.find((s) => s.id === item.id);
    if (settlement) {
      mapRef.current?.getView().animate({
        center: [settlement.location[0], -settlement.location[1]],
        duration: 700,
      });
    }
  };

  const handleEdit = async (settlement: ISettlement) => {
    const result = await asyncPrompt(settlementDialogConfig.current, {
      name: settlement.name,
      description: settlement.description,
      leader: settlement.leader,
      members: [...settlement.members],
      location: [...settlement.location],
    } as any);

    if (!result.cancelled) {
      const response = await updateSettlement(settlement.id, {
        name: result.data.name,
        description: result.data.description,
        leader: result.data.leader,
        members: result.data.members,
        location: result.data.location,
      });

      if (!response.is_error) {
        toast({
          title: 'Settlement updated',
          description: 'The settlement has been successfully updated.',
        });
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update settlement.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDelete = async (settlementId: string) => {
    const confirmed = confirm('This will delete this settlement, are you sure?');

    if (!confirmed) {
      return;
    }

    const response = await deleteSettlement(settlementId);

    if (!response.is_error) {
      toast({
        title: 'Settlement deleted',
        description: 'The settlement has been successfully deleted.',
      });
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete settlement.',
        variant: 'destructive',
      });
    }
  };

  const handleViewInfo = (settlement: ISettlement) => {
    setViewingSettlement(settlement);
    setInfoSheetData({
      title: settlement.name,
      description: settlement.description,
      fields: [
        { key: 'leader', label: 'Leader', value: settlement.leader },
        {
          key: 'members',
          label: 'Members',
          value: (
            <div className="flex flex-wrap gap-1">
              {settlement.members.map((member) => (
                <span key={member} className="bg-muted px-2 py-1 rounded text-xs">
                  {member}
                </span>
              ))}
            </div>
          ),
        },
        {
          key: 'location',
          label: 'Location',
          value: `X: ${settlement.location[0]}, Y: ${settlement.location[1]}`,
        },
      ],
    });
  };

  const handleCreate = async () => {
    const result = await asyncPrompt(settlementDialogConfig.current);
    if (!result.cancelled) {
      const response = await createSettlement({
        name: result.data.name,
        description: result.data.description,
        leader: result.data.leader,
        members: result.data.members,
        location: result.data.location,
      });

      if (!response.is_error) {
        toast({
          title: 'Settlement created',
          description: 'The settlement has been successfully created.',
        });
        router.refresh();
        if (onCreateSuccess) onCreateSuccess();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create settlement.',
          variant: 'destructive',
        });
      }
    }
  };

  const renderIcon = (item: SearchableItem) => {
    return <Globe className="h-4 w-4 text-muted-foreground" />;
  };

  const renderActions = (item: SearchableItem) => {
    const settlement = settlements.find((s) => s.id === item.id);
    if (!settlement) return null;

    return (
      <div className="flex gap-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewInfo(settlement);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
        {user ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(settlement);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(settlement.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <SearchDialog
        items={items}
        onSelect={handleSelect}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        placeholder="Search settlements..."
        emptyMessage="No settlements found."
        groupHeading="Settlements"
        renderIcon={renderIcon}
        renderActions={renderActions}
        headerAction={
          user ? (
            <Button variant="ghost" size="sm" onClick={handleCreate} className="absolute right-12 top-2 h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          ) : null
        }
      />
      {promptConfig && (
        <FeaturePromptDialog
          isOpen={promptConfig.isOpen}
          onClose={(val) => {
            promptConfig.resolve(val);
            setPromptConfig(null);
          }}
          config={promptConfig.config}
          currentValues={promptConfig.currentValues}
        />
      )}
      <InfoSheet
        data={infoSheetData}
        open={!!viewingSettlement}
        onOpenChange={(open) => {
          if (!open) {
            setViewingSettlement(null);
            setInfoSheetData(null);
          }
        }}
      />
    </>
  );
}
