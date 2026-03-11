'use client';

import React from 'react';
import { GlobalContextProvider } from './global.client.context';
import type { EnglishLocale } from '@/locale/text/en';
import { TokenPayload } from '@/types/jwt/token.payload.type';

export function WrapWithContexts({
  children,
  locale,
  user,
  customLayerJson,
  // TODO: types
}: React.PropsWithChildren & { locale: typeof EnglishLocale; user?: TokenPayload; customLayerJson: any }) {
  return (
    <GlobalContextProvider locale={locale} user={user} customLayerJson={customLayerJson}>
      {children}
    </GlobalContextProvider>
  );
}
