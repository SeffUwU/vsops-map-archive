namespace DialogBuilder {
  export type BaseField = { title: string; name: string; defaultValue: string | null };
  export type TextField = BaseField & { type: 'text' };
  export type TextareaField = BaseField & { type: 'textarea'; rows?: number };
  export type SelectField = BaseField & { type: 'select'; values: { value: string | null; title: string }[] };
  export type FileField = {
    title: string;
    name: string;
    defaultValue: any[]; // MediaItem[] but avoiding circular dependency
    type: 'file';
    maxFiles?: number;
  };
  export type MembersField = {
    title: string;
    name: string;
    defaultValue: string[];
    type: 'members';
  };
  export type CoordinateField = {
    title: string;
    name: string;
    defaultValue: [number, number];
    type: 'coordinate';
  };

  export type FieldBuilderConfig = {
    title?: string;
    fields: readonly (TextField | TextareaField | SelectField | FileField | MembersField | CoordinateField)[];
  };

  export type MapFieldsToData<T extends FieldBuilderConfig> = {
    [K in T['fields'][number] as K['name']]: K extends { type: 'file' }
      ? any[]
      : K extends { type: 'members' }
        ? string[]
        : K extends { type: 'coordinate' }
          ? [number, number]
          : string;
  };

  export type Result<T extends FieldBuilderConfig> =
    | {
        cancelled: false;
        data: MapFieldsToData<T>;
      }
    | {
        cancelled: true;
        data: null;
      };
}
