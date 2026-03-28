'use client';

import useDarkMode from '@/hooks/useDarkMode';
import { cn } from '@/lib/utils';
import { updateUiLanguage } from '@/server/actions/users/updateUserUiLanguage';
import { AllowedLocale } from '@/types/enums/allowed-locale.enum';
import { Separator } from '@radix-ui/react-separator';
import {
  ChevronLeft,
  ChevronRight,
  House,
  Languages,
  LogIn,
  Map,
  Menu,
  Moon,
  Search,
  Store,
  Sun,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import useLocalStorageState from 'use-local-storage-state';
import { useContextUser, useGlobalContext, useTranslation } from '../contexts/global.client.context';
import { Button } from '../ui/button';
import { SideBarButton } from './SideBarButton';

import { useState } from 'react';
import { SearchDialog } from './Search';
import { useFetchJson } from '@/hooks/use-fetch-json';

export function Sidebar() {
  const {
    ui: {
      sidebar: { expanded, setExpanded },
      loading,
      locale,
    },
    map: { bindMapLayerToggle, mapRef, customLayerJson },
  } = useGlobalContext();
  const t = useTranslation();
  const user = useContextUser();
  const router = useRouter();
  const { toggleTheme, isDarkModeEnabled } = useDarkMode();
  const className = cn('w-full flex flex-row', { 'justify-start': expanded });
  const pathname = usePathname();
  const [localLang, setLocalLang] = useLocalStorageState<'en' | 'ru'>('en');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: traders, isLoading: tradersLoading } = useFetchJson('/traders.geojson');
  const { data: landmarks, isLoading: landmarksLoading } = useFetchJson('/landmarks.geojson');
  if (loading || landmarksLoading || tradersLoading) {
    return loading;
  }

  return (
    <>
      <div
        className={cn(
          'h-screen dark:bg-slate-800 w-12 border-r-2  items-start flex-col justify-between animate-in duration-200 hidden md:flex',
          {
            'w-40': expanded,
          },
        )}
        style={{
          transition: 'width 0.2s',
        }}
      >
        <div className="flex flex-col px-2 gap-2 w-full pt-2">
          {/* <Link href={'/'} className="w-full flex items-center justify-center">
            <Image src={'/globe.svg'} alt="Main Page" className="dark:hidden" width={48} height={48} />
            <Image src={'/globe.svg'} alt="Main Page" className="hidden dark:block" width={48} height={48} />
          </Link> */}

          <Separator orientation="horizontal" />
          <SideBarButton
            {...{
              expanded,
              className,
              title: t.sidebar.home,
              isActive: pathname === '/',
            }}
          >
            <Map />
          </SideBarButton>
          {/* <SideBarButton
            {...{
              expanded,
              className,
              title: t.sidebar.users,
              href: '/users',
              isActive: pathname.includes('users'),
            }}
          >
            <Users />
          </SideBarButton> */}

          <Separator orientation="horizontal" className="h-2" />
          <SideBarButton
            {...{
              expanded,
              className,
              title: t.sidebar.landmarks,
              onClick: bindMapLayerToggle('landmarks'),
            }}
          >
            <House />
          </SideBarButton>

          <SideBarButton
            {...{
              expanded,
              className,
              title: t.sidebar.traders,
              onClick: bindMapLayerToggle('traders'),
            }}
          >
            <Store />
          </SideBarButton>
          <SideBarButton
            {...{
              expanded,
              className,
              title: t.sidebar.translocators,
              onClick: bindMapLayerToggle('translocators'),
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 20h16" />
              <path d="M7 20v-2c0-.6.4-1 1-1h8c.6 0 1 .4 1 1v2" />
              <circle cx="12" cy="11" r="3" />
              <path d="M8 6l4-4 4 4" /> <path d="M12 2v6" /> <path d="M5 11c0-3.3 2.7-6 6-6" />
              <path d="M19 11c0-3.3-2.7-6-6-6" />
            </svg>
          </SideBarButton>
          <SideBarButton
            {...{
              expanded,
              className,
              title: t.sidebar.custom,
              onClick: bindMapLayerToggle('custom'),
            }}
          >
            <Wrench />
          </SideBarButton>
        </div>
        <div className="flex flex-col px-2 gap-2 w-full">
          {/* <DebugButtons className={className} /> */}
          <SideBarButton
            {...{
              expanded,
              className,
              title: t.sidebar.theme,
              href: '#',
              onClick: () => {
                setIsSearchOpen((p) => !p);
              },
            }}
          >
            <Search />
          </SideBarButton>
          <SideBarButton
            {...{
              expanded,
              className,
              title: t.sidebar.theme,
              href: '#',
              onClick: () => {
                toggleTheme();
              },
            }}
          >
            {isDarkModeEnabled ? <Sun /> : <Moon />}
          </SideBarButton>
          <SideBarButton
            {...{
              expanded,
              className,
              title: t.sidebar.language,
              href: '#',
              onClick: () => {
                // TODO: Dropdown
                user &&
                  updateUiLanguage(
                    (user?.uiLocale ?? localLang) === AllowedLocale.en ? AllowedLocale.ru : AllowedLocale.en,
                  ).then(router.refresh);
              },
            }}
          >
            <Languages />
          </SideBarButton>
          {!user && (
            <SideBarButton
              {...{
                expanded,
                className,
                title: t.capitalizedWords.login,
                href: '/auth/sign-in',
                isActive: pathname.includes('/auth/sign-in'),
              }}
            >
              <LogIn />
            </SideBarButton>
          )}
          {user && (
            <SideBarButton
              {...{
                expanded,
                className,
                title: user.login,
                href: '/profile',
                isActive: pathname.includes('profile'),
              }}
            >
              <User className="text-green-500" />
            </SideBarButton>
          )}

          <Button variant="ghost" className={className} onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </div>
      </div>
      <div className="md:hidden absolute top-0 w-full h-12 bg-white dark:bg-slate-950">
        <div className="absolute top-4 left-2">
          <Menu />
        </div>
      </div>
      {isSearchOpen && (
        <SearchDialog
          data={[customLayerJson, traders, landmarks]}
          isOpen={isSearchOpen}
          onSelect={(center) => {
            mapRef.current?.getView().animate({
              center: [center[0], center[1]],
              duration: 700,
            });
          }}
          setIsOpen={setIsSearchOpen}
        />
      )}
    </>
  );
}
