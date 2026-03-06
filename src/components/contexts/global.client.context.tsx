'use client';

import { EnglishLocale } from '@/locale/text/en';
import { TokenPayload } from '@/types/jwt/token.payload.type';
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { LoadingSpinner } from '../ui/loader';
import { VSMap } from '@/types/map/vsmap';

const globalContextValue = {
  ui: {
    sidebar: {
      expanded: false,
      setExpanded: (() => {}) as Dispatch<SetStateAction<boolean>>,
    },
    locale: {} as typeof EnglishLocale,
    loading: false,
  },
  user: {} as TokenPayload,
  map: {
    toggleState: {} as VSMap.TogglesState,
    bindMapLayerToggle: (name: keyof VSMap.TogglesState) => () => {},
  },
};

const GlobalContext = createContext(globalContextValue);

export function GlobalContextProvider({
  children,
  locale = EnglishLocale,
  user,
}: React.PropsWithChildren & { locale: typeof EnglishLocale; user?: TokenPayload }) {
  const [expanded, setExpanded] = useLocalStorageState('_ui.sidebarExpanded', {
    storageSync: true,
    defaultValue: false,
  });
  const [toggleState, setTogglesState] = useState<VSMap.TogglesState>({
    chunks: false,
    landmarks: true,
    traders: false,
    translocators: false,
  });

  const [loading, setLoading] = useState(true);

  const bindMapLayerToggle = (name: keyof VSMap.TogglesState) => (): void =>
    setTogglesState((prev) => ({ ...prev, [name]: !prev[name] }));

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center dark">
        <LoadingSpinner />
        <p>{locale.ui.initializingContexts}</p>
      </div>
    );
  }

  return (
    <GlobalContext.Provider
      value={{
        ui: {
          sidebar: {
            expanded,
            setExpanded,
          },
          locale,
          loading,
        },
        map: { toggleState, bindMapLayerToggle },
        user: user ?? ({} as TokenPayload),
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

/**
 * Use Global context values.
 */
export function useGlobalContext() {
  return useContext(GlobalContext);
}

/**
 * Use cached translation dictionary.
 * @returns
 */
export function useTranslation() {
  return useContext(GlobalContext).ui.locale;
}

/**
 * Use token values. (NOT THIS IS NOT A REAL USER BUT JWT TOKEN VALUE)
 */
export function useContextUser() {
  return useContext(GlobalContext).user;
}
