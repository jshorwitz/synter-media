export async function sendMagicLinkEmail(email: string, magicUrl: string, firstName?: string) {
  if (!process.env.LOOPS_API_KEY) {
    console.warn('LOOPS_API_KEY not set, skipping magic link email');
    return false;
  }

  const templateId = process.env.LOOPS_MAGIC_LINK_TEMPLATE_ID || 'cmlw8qyx201i7rh0icuby5hq3';

  try {
    const emailData = {
      email,
      transactionalId: templateId,
      dataVariables: {
        FirstName: firstName || email.split('@')[0],
        magic_url: magicUrl,
      },
    };

    console.log('Sending magic link email to Loops:', {
      email,
      firstName,
      magicUrl,
      templateId,
      dataVariables: emailData.dataVariables,
    });

    const response = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const responseText = await response.text();
    console.log('Loops magic link response:', response.status, responseText);

    if (!response.ok) {
      console.error('Loops API error:', response.status, responseText);
      throw new Error(`Loops API error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending magic link email via Loops:', error);
    return false;
  }
}

export async function sendWaitlistEmail(
  email: string,
  position: number,
  total: number,
  checkUrl?: string,
  referralCode?: string,
  firstName?: string
) {
  const url = checkUrl || `https://syntermedia.ai/waitlist/check?email=${encodeURIComponent(email)}`;
  return sendWaitlistWelcomeEmail(email, position, total, url, referralCode, firstName);
}

export async function sendWaitlistWelcomeEmail(
  email: string,
  position: number,
  total: number,
  checkUrl: string,
  referralCode?: string,
  firstName?: string
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
        FirstName: firstName || 'there',
        position: position.toString(),
        total_waiting: total.toString(),
        check_url: checkUrl,
      },
    };

    if (referralCode) {
      emailData.dataVariables.referral_code = referralCode;
      emailData.dataVariables.referral_url = `https://syntermedia.ai/r/${referralCode}`;
    }

    console.log('Sending email to Loops:', JSON.stringify(emailData, null, 2));

    const response = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const responseText = await response.text();
    console.log('Loops response status:', response.status);
    console.log('Loops response body:', responseText);

    if (!response.ok) {
      console.error('Loops API error:', response.status, response.statusText, responseText);
      throw new Error(`Loops API error: ${response.status} ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('Loops email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending Loops email:', error);
    return false;
  }
}
