import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function RootPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has('isLoggedIn');
  redirect(isAuthenticated ? '/dashboard/expenses' : '/login');
}
