'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import cn from 'classnames/bind';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import styles from './RegisterForm.module.scss';

const cx = cn.bind(styles);

const PASSWORD_RULES = [
  { label: 'lowercase', test: (v: string) => /[a-z]/.test(v) },
  { label: 'uppercase', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'special character', test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
];

function getPasswordHint(value: string): string | null {
  if (!value) return null;
  const missing: string[] = [];
  if (value.length < 8) missing.push(`${8 - value.length} more character${8 - value.length > 1 ? 's' : ''}`);
  PASSWORD_RULES.forEach((rule) => { if (!rule.test(value)) missing.push(rule.label); });
  return missing.length ? `Needs ${missing.join(', ')}` : null;
}

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9._]+$/, 'Only Latin letters, numbers, dots and underscores'),
  password: z.string()
    .min(8, 'Too short')
    .regex(/[a-z]/, 'Needs lowercase')
    .regex(/[A-Z]/, 'Needs uppercase')
    .regex(/[0-9]/, 'Needs number')
    .regex(/[^a-zA-Z0-9]/, 'Needs special character'),
});

type FormData = z.infer<typeof schema>;

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onChange' });

  const usernameValue = watch('username') || '';
  const passwordValue = watch('password') || '';
  const passwordHint = getPasswordHint(passwordValue);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (usernameValue.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const { available } = await authApi.checkUsername(usernameValue.toLowerCase());
        setUsernameStatus(available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [usernameValue]);

  const onSubmit = async (data: FormData) => {
    if (usernameStatus === 'taken') return;
    setError('');
    try {
      const { accessToken, refreshToken, user } = await authApi.register({
        ...data,
        username: data.username.toLowerCase(),
      });
      setAuth(user, accessToken, refreshToken);
      router.push('/dashboard/expenses?toast=registered');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 409) {
        setError('Username already taken');
      } else {
        setError('Could not create account. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cx('form')}>
      <div className={cx('field')}>
        <label className={cx('label')}>Name</label>
        <input
          {...register('name')}
          type="text"
          autoComplete="name"
          className={cx('input')}
        />
        {errors.name && <p className={cx('fieldError')}>{errors.name.message}</p>}
      </div>

      <div className={cx('field')}>
        <label className={cx('label')}>Username</label>
        <div className={cx('inputWrap')}>
          <input
            {...register('username')}
            type="text"
            autoComplete="username"
            className={cx('input', {
              inputError: usernameStatus === 'taken' || errors.username,
              inputLoading: usernameStatus === 'checking',
            })}
          />
          {usernameStatus === 'checking' && (
            <Loader2 size={14} className={cx('inputSpinner')} />
          )}
        </div>
        {errors.username && <p className={cx('fieldError')}>{errors.username.message}</p>}
        {usernameStatus === 'taken' && <p className={cx('fieldError')}>Username already taken</p>}
      </div>

      <div className={cx('field')}>
        <label className={cx('label')}>Password</label>
        <input
          {...register('password')}
          type="password"
          autoComplete="new-password"
          className={cx('input')}
        />
        {passwordHint && <p className={cx('fieldHint')}>{passwordHint}</p>}
      </div>

      {error && <p className={cx('globalError')}>{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || usernameStatus === 'taken'}
        className={cx('submit')}
      >
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
