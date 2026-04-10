import { ISettlement } from '@/entities';
import type { LocaleType } from '@/locale/text/en';

export enum FeatureSubTypeEnum {
  BASE = 'base',
  SMITHERY = 'smithery',
  TRADER = 'trader',
  POINT_OF_INTEREST = 'poi',
  LIBRARY = 'library',
  FARM = 'farm',
  DISTRICT = 'district',
  BODY_OF_WATER = 'bow',
  TOWN_HALL = 'town_hall',
  MILL = 'mill',
  RUIN = 'ruin',
  OTHER = 'other',
}

export const getFeatureDialogConfig = (t: LocaleType, settlements: ISettlement[]) => {
  const proxySettlement = [null, ...settlements];
  return {
    fields: [
      { name: 'name', title: t.dialog.feature.nameTitle, defaultValue: 'Building', type: 'text' },
      { name: 'description', title: t.dialog.feature.descriptionTitle, defaultValue: '', type: 'textarea', rows: 4 },
      {
        name: 'type',
        title: t.dialog.feature.descriptionTitle,
        defaultValue: FeatureSubTypeEnum.BASE,
        values: Object.values(FeatureSubTypeEnum).map((val) => ({
          value: val,
          title: t.dialog.feature.selectValues[val],
        })),
        type: 'select',
      },
      {
        name: 'settlement',
        title: t.dialog.feature.settlement,
        defaultValue: null,
        values: proxySettlement.map((val) => {
          if (val === null) {
            return {
              value: null,
              title: 'None',
            };
          }
          return {
            value: val.id,
            title: val.name,
          };
        }),
        type: 'select',
      },
      { title: '[OPTIONAL] Upload photos', name: 'images', type: 'file', defaultValue: [] as any[] },
    ],
  } as const;
};
