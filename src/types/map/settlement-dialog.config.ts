import type { LocaleType } from '@/locale/text/en';

export const getSettlementDialogConfig = (t: LocaleType) => {
  return {
    title: 'Settlement',
    fields: [
      { name: 'name', title: 'Name', defaultValue: 'New Settlement', type: 'text' as const },
      { name: 'description', title: 'Description', defaultValue: '', type: 'textarea' as const, rows: 4 },
      { name: 'leader', title: 'Leader', defaultValue: '', type: 'text' as const },
      { name: 'members', title: 'Members', defaultValue: [] as string[], type: 'members' as const },
      { name: 'location', title: 'Location (X, Y)', defaultValue: [0, 0] as [number, number], type: 'coordinate' as const },
    ],
  } as const;
};
