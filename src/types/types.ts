namespace DialogBuilder {
  export type BaseField = { title: string; name: string; defaultValue: string };
  export type TextField = BaseField & { type: 'text' };
  export type SelectField = BaseField & { type: 'select'; values: { value: string; title: string }[] };
  export type FileField = BaseField & {
    type: 'file';
    maxFiles?: number;
  };

  export type FieldBuilderConfig = {
    title?: string;
    fields: readonly (TextField | SelectField | FileField)[];
  };

  export type MapFieldsToData<T extends FieldBuilderConfig> = {
    [K in T['fields'][number]['name']]: string;
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
