import { useServerTranslation } from '@/components/contexts/global.server.context';
import { WrapWithContexts } from '@/components/contexts/WrapAllContexts';
import { Sidebar } from '@/components/layout/sidebar';
import { InfoButtons } from '@/components/layout/InfoButtons';
import { Toaster } from '@/components/ui/toaster';
import { getPathname } from '@/helpers/request/getPathname';
import { checkAuth } from '@/server/actions/auth/check-auth';
import { ErrorCode } from '@/types/enums/error-code.enum';
import { Metadata } from 'next';
import localFont from 'next/font/local';
import { redirect } from 'next/navigation';
import './globals.css';
import { getCustomLayerGeoJson } from '@/server/actions/map/map.actions';

export const metadata: Metadata = {
  title: 'TOPS Archive',
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
        <WrapWithContexts
          locale={t}
          user={!auth.is_error ? auth.value.user : undefined}
          customLayerJson={customLayerJson.is_error ? {} : customLayerJson.value}
        >
            <main className="w-full overflow-y-auto">
              {children}
              <div className="absolute top-2 right-2 z-10">
                <InfoButtons />
              </div>
              <Toaster />
            </main>
            <Sidebar />
          </WrapWithContexts>
      </body>
    </html>
  );
}
