'use client';

import { useContextUser } from '@/components/contexts/global.client.context';
import { Button } from '@/components/ui/button';
import { logout } from '@/server/actions/auth/logout';
import { redirect } from 'next/navigation';

export default function Profile() {
  const user = useContextUser();
  if (!user) {
    redirect('/');
  }

  return (
    <div className="m-4">
      <Button onClick={logout}>LOGOUT</Button>
    </div>
  );
}
