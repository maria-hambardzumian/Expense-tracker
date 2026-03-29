'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import cn from 'classnames/bind';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardToast } from '@/components/layout/DashboardToast';
import styles from './layout.module.scss';

const cx = cn.bind(styles);

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, user, router, pathname]);

  if (!hydrated || !user) return <div className={cx('loader')} />;

  return (
    <div className={cx('layout')}>
      <Sidebar />
      <main className={cx('content')}>{children}</main>
      <DashboardToast />
    </div>
  );
}
