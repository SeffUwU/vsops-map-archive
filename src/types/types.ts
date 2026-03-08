namespace DialogBuilder {
  export type BaseField = { title: string; name: string; defaultValue: string };
  export type TextField = BaseField & { type: 'text' };
  export type SelectField = BaseField & { type: 'select'; values: { value: string; title: string }[] };

  export type FieldBuilderConfig = {
    title?: string;
    fields: readonly (TextField | SelectField)[];
  };

  export type MapFieldsToData<T extends FieldBuilderConfig> = {
    [K in T['fields'][number]['name']]: string;
  };

  export type Result<T extends FieldBuilderConfig> =
    | {
        cancelled: false;
        data: MapFieldsToData<T>; // The name: string object
      }
    | {
        cancelled: true;
        data: null;
      };
}
