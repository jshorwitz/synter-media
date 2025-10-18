import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getWaitlistPositionByEmail } from '@/lib/waitlist';

interface Props {
  params: { code: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = params;
  
  let position = 1332;
  let total = 1500;
  let referralsCount = 0;

  try {
    const lead = await db.waitlistLead.findFirst({
      where: { referral_code: code },
    });

    if (lead && lead.email) {
      const positionData = await getWaitlistPositionByEmail(lead.email);
      if (positionData) {
        position = positionData.position || position;
        total = positionData.total || total;
        referralsCount = positionData.lead?.referrals_count || 0;
      }
    }
  } catch (error) {
    console.error('Error fetching position for OG:', error);
  }

  const title = `I'm #${position} on the Synter waitlist`;
  const description = `Help me jump the line! Each invite = 7 spots up. ${referralsCount > 0 ? `${referralsCount} referrals so far.` : ''}`;
  const ogImageUrl = `https://syntermedia.ai/api/waitlist/og?code=${code}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
      url: `https://syntermedia.ai/r/${code}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function ReferralRedirect({ params }: Props) {
  const { code } = params;
  redirect(`/waitlist?ref=${code}&utm_source=referral&utm_medium=link&utm_campaign=waitlist`);
}
