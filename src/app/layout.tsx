import { useServerTranslation } from '@/components/contexts/global.server.context';
import { WrapWithContexts } from '@/components/contexts/WrapAllContexts';
import { Sidebar } from '@/components/layout/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { getPathname } from '@/helpers/request/getPathname';
import { checkAuth } from '@/server/actions/auth/check-auth';
import { ErrorCode } from '@/types/enums/error-code.enum';
import { Metadata } from 'next';
import localFont from 'next/font/local';
import { redirect } from 'next/navigation';
import './globals.css';
import { getCustomLayerGeoJson } from '@/server/actions/map/map.actions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'DnD Tracker',
};

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [auth, path, t, customLayerJson] = await Promise.all([
    checkAuth(),
    getPathname(),
    useServerTranslation(),
    getCustomLayerGeoJson(),
  ]);

  // if (
  //   auth.is_error &&
  //   auth.code === ErrorCode.NotAuthorized &&
  //   !(path?.includes('auth/sign-in') || path?.includes('auth/sign-up'))
  // ) {
  //   redirect('/auth/sign-in');
  // }

  return (
    <html lang="en" className="overflow-hidden h-screen dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-row-reverse h-full mt-12 md:mt-0`}
      >
        <TooltipProvider>
          <WrapWithContexts
            locale={t}
            user={!auth.is_error ? auth.value.user : undefined}
            customLayerJson={customLayerJson.is_error ? {} : customLayerJson.value}
          >
            <main className="w-full overflow-y-auto">
              {children}
              <div className="absolute top-2 right-2 z-10 flex flex-row gap-4">
                <Tooltip>
                  <TooltipTrigger className="px-2 rounded-sm bg-yellow-500 text-black">Legend</TooltipTrigger>
                  <TooltipContent>
                    <p>⭐ - Feature has updated since last time you visited (stored locally)</p>
                    <p>🖼️ - Feature has Photos or Screenshots. RMB =&gt; Inspect to access detailed information</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="bg-slate-800 px-2 rounded-sm">Info</TooltipTrigger>
                  <TooltipContent>
                    <p>This is a very much WORK IN PROGRESS</p>
                    <p>If you have any questions contact me in-game: `Sefian`</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Toaster />
            </main>
            <Sidebar />
          </WrapWithContexts>
        </TooltipProvider>
      </body>
    </html>
  );
}
