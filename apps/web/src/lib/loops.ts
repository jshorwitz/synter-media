export async function sendWaitlistWelcomeEmail(
  email: string,
  position: number,
  total: number,
  checkUrl: string
) {
  if (!process.env.LOOPS_API_KEY) {
    console.warn('LOOPS_API_KEY not set, skipping email');
    return false;
  }

  try {
    // First, add contact to Loops
    await fetch('https://app.loops.so/api/v1/contacts/create', {
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

    // Send transactional email
    const response = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        transactionalId: process.env.LOOPS_WAITLIST_TEMPLATE_ID,
        dataVariables: {
          position: position.toString(),
          total_waiting: total.toString(),
          check_url: checkUrl,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Loops API error:', response.status, error);
      return false;
    }

    const data = await response.json();
    console.log('Loops email sent:', data);
    return true;
  } catch (error) {
    console.error('Error sending Loops email:', error);
    return false;
  }
}
