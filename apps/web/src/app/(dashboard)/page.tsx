import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to PPC dashboard as the default landing page
  redirect('/ppc');
}
