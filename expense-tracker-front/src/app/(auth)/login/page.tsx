import Link from 'next/link';
import cn from 'classnames/bind';
import { LoginForm } from '@/components/auth/LoginForm';
import styles from './page.module.scss';

const cx = cn.bind(styles);

export default function LoginPage() {
  return (
    <div className={cx('page')}>
      <div className={cx('container')}>
        <h1 className={cx('title')}>Sign in to Expense Tracker</h1>
        <div className={cx('card')}>
          <LoginForm />
        </div>
        <p className={cx('footer')}>
          Don&apos;t have an account?{' '}
          <Link href="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
