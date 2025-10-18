export async function sendWaitlistEmail(
  email: string,
  position: number,
  total: number,
  checkUrl?: string,
  referralCode?: string
) {
  const url = checkUrl || `https://syntermedia.ai/waitlist/check?email=${encodeURIComponent(email)}`;
  return sendWaitlistWelcomeEmail(email, position, total, url, referralCode);
}

export async function sendWaitlistWelcomeEmail(
  email: string,
  position: number,
  total: number,
  checkUrl: string,
  referralCode?: string
) {
  if (!process.env.LOOPS_API_KEY) {
    console.warn('LOOPS_API_KEY not set, skipping email');
    return false;
  }

  // Use hardcoded template ID if env var not set
  const templateId = process.env.LOOPS_WAITLIST_TEMPLATE_ID || 'cmgvgka1o1y52zt0i2ksq7mmo';

  try {
    // First, add contact to Loops
    const contactResponse = await fetch('https://app.loops.so/api/v1/contacts/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        userGroup: 'Waitlist',
        source: 'Waitlist Signup',
      }),
    });

    if (!contactResponse.ok) {
      const contactError = await contactResponse.text();
      console.error('Loops contact creation error:', contactResponse.status, contactError);
    } else {
      console.log('Contact added to Loops:', email);
    }

    // Send transactional email
    const emailData: any = {
      email,
      transactionalId: templateId,
      dataVariables: {
        position: position.toString(),
        total_waiting: total.toString(),
        check_url: checkUrl,
      },
    };

    if (referralCode) {
      emailData.dataVariables.referral_code = referralCode;
      emailData.dataVariables.referral_url = `https://syntermedia.ai/r/${referralCode}`;
    }

    console.log('Sending email to Loops:', emailData);

    const response = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Loops API error:', response.status, error);
      return false;
    }

    const data = await response.json();
    console.log('Loops email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending Loops email:', error);
    return false;
  }
}
