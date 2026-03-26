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
}

export const getFeatureDialogConfig = (t: LocaleType) => {
  return {
    fields: [
      { name: 'name', title: t.dialog.feature.nameTitle, defaultValue: 'Building', type: 'text' },
      { name: 'description', title: t.dialog.feature.descriptionTitle, defaultValue: '', type: 'text' },
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
      { title: '[OPTIONAL] Upload photos (Max 10)', name: 'images', type: 'file', defaultValue: '' },
    ],
  } as const;
};
