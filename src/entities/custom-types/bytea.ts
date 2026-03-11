import { customType } from 'drizzle-orm/pg-core';

export const bytea = customType<{ data: Buffer }>({
  dataType() {
    return 'bytea';
  },
  fromDriver(value: unknown) {
    if (value instanceof Buffer) return value;
    return Buffer.from(value as string, 'binary');
  },
  toDriver(value: Buffer) {
    return value;
  },
});
