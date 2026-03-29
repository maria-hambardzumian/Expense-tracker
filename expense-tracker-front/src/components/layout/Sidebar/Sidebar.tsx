'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CircleUserRound, LogOut, LayoutDashboard, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import cn from 'classnames/bind';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth.api';
import styles from './Sidebar.module.scss';

const cx = cn.bind(styles);

const NAV_ITEMS = [
  { label: 'Expenses', href: '/dashboard/expenses', icon: LayoutDashboard },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    const refreshToken = useAuthStore.getState().getRefreshToken();
    if (refreshToken) await authApi.logout(refreshToken).catch(() => null);
    queryClient.clear();
    clearAuth();
    router.push('/login');
  };

  return (
    <aside className={cx('sidebar', { collapsed })}>
      <div className={cx('logo')}>
        {!collapsed && <span>Expense Tracker</span>}
        <button
          className={cx('toggleBtn')}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className={cx('nav')}>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cx('navLink', { active: pathname === href })}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className={cx('navIcon')} />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      <div className={cx('footer')}>
        <div className={cx('user')} title={collapsed ? `@${user?.username}` : undefined}>
          <CircleUserRound size={32} className={cx('userIcon')} />
          {!collapsed && (
            <div className={cx('userInfo')}>
              {user?.name && <p className={cx('userName')}>{user.name}</p>}
              <p className={cx('userHandle')}>@{user?.username}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={cx('logoutBtn')}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
