'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

const MESSAGES: Record<string, string> = {
  registered: 'Successfully registered!',
};

export function DashboardToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const key = searchParams.get('toast');
    if (!key || !MESSAGES[key]) return;

    toast.success(MESSAGES[key], { id: key });

    const params = new URLSearchParams(searchParams.toString());
    params.delete('toast');
    const next = params.size ? `${pathname}?${params}` : pathname;
    router.replace(next);
  }, []);

  return null;
}
