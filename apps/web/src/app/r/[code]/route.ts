import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code;
  
  // Redirect to waitlist page with referral code
  redirect(`/waitlist?ref=${code}&utm_source=referral&utm_medium=link&utm_campaign=waitlist`);
}
