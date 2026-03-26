import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

export default defineConfig({
  dialect: 'sqlite',
  out: './src/entities/drizzle',
  schema: './src/entities',
  dbCredentials: {
    url: 'data.db',
  },
});
