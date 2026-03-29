'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import cn from 'classnames/bind';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import styles from './LoginForm.module.scss';

const cx = cn.bind(styles);

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(timeout);
  }, [error]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const { accessToken, refreshToken, user } = await authApi.login({
        ...data,
        username: data.username.toLowerCase(),
      });
      setAuth(user, accessToken, refreshToken);
      const from = searchParams.get('from') || '/dashboard/expenses';
      router.push(from);
    } catch {
      setError('Invalid username or password');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cx('form')}>
      <div className={cx('field')}>
        <label className={cx('label')}>Username</label>
        <input
          {...register('username')}
          type="text"
          autoComplete="username"
          className={cx('input')}
        />
        {errors.username && (
          <p className={cx('fieldError')}>{errors.username.message}</p>
        )}
      </div>

      <div className={cx('field')}>
        <label className={cx('label')}>Password</label>
        <input
          {...register('password')}
          type="password"
          autoComplete="current-password"
          className={cx('input')}
        />
        {errors.password && (
          <p className={cx('fieldError')}>{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className={cx('toast')} role="alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7.25" stroke="#ef4444" strokeWidth="1.5" />
            <path d="M8 4.5V8.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11" r="0.75" fill="#ef4444" />
          </svg>
          {error}
        </div>
      )}
      <button type="submit" disabled={isSubmitting} className={cx('submit')}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
