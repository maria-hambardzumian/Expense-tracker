import Link from 'next/link';
import cn from 'classnames/bind';
import { RegisterForm } from '@/components/auth/RegisterForm';
import styles from './page.module.scss';

const cx = cn.bind(styles);

export default function RegisterPage() {
  return (
    <div className={cx('page')}>
      <div className={cx('container')}>
        <h1 className={cx('title')}>Create your account</h1>
        <div className={cx('card')}>
          <RegisterForm />
        </div>
        <p className={cx('footer')}>
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
