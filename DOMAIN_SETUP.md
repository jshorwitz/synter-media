# Domain Setup: syntermedia.ai

## 1. Configure DNS at GoDaddy

Go to GoDaddy DNS Management for `syntermedia.ai` and add these records:

```
Type    Name    Value                   TTL
A       @       76.76.21.21            600
CNAME   www     cname.vercel-dns.com   600
```

## 2. Add Domain in Vercel

1. Go to: https://vercel.com/your-team/synter-clean-web/settings/domains
2. Click "Add Domain"
3. Enter: `syntermedia.ai`
4. Click "Add"
5. Also add: `www.syntermedia.ai`
6. Set `www.syntermedia.ai` to redirect to `syntermedia.ai`

Vercel will verify DNS and issue SSL automatically (takes 5-30 minutes).

## 3. Set Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

```
LOOPS_API_KEY=<your_loops_api_key>
LOOPS_WAITLIST_TEMPLATE_ID=<template_id_from_loops>
NEXT_PUBLIC_APP_URL=https://syntermedia.ai
JWT_SECRET=<generate_a_random_secret>
```

To generate JWT_SECRET:
```bash
openssl rand -base64 32
```

## 4. Create Loops Template

1. Go to Loops.so → Transactional → New Template
2. Template Name: "Waitlist Welcome"
3. Subject: "You're #{{position}} on the Synter Waitlist!"
4. Body (example):

```
Hi there!

Thanks for joining the Synter waitlist. You're in!

Your Position: #{{position}} of {{total_waiting}}

You can check your position anytime here:
{{check_url}}

We're rolling out invites in batches, prioritizing teams with high ad spend and platform diversity.

What happens next?
• We'll review your application
• You'll receive an invite email when ready
• Once activated, you'll have full access to Synter

Questions? Just reply to this email.

— The Synter Team
```

5. Copy the Template ID and add it to Vercel env vars as `LOOPS_WAITLIST_TEMPLATE_ID`

## 5. Test

After DNS propagates and env vars are set:
1. Visit https://syntermedia.ai/waitlist
2. Sign up with a test email
3. Check that you receive the email with your position
4. Click the check URL to verify position lookup works

## Notes

- DNS propagation can take 5 minutes to 48 hours (usually ~30 mins)
- SSL certificate generation is automatic via Vercel
- Loops emails send immediately; check spam folder if not received
