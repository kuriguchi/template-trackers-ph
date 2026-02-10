import { NextResponse } from 'next/server';

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'noreply@template-trackers-ph.vercel.app';

    if (!resendApiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    // Send welcome email to subscriber
    const welcomeHtml = `
      <div style="font-family: system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial; color:#0b4f78;">
        <h2>Thanks for subscribing!</h2>
        <p>You're now on the list for updates, discounts, and new templates from Template Trackers PH.</p>
        <p>If you'd like to contact us directly, reply to this email or reach us at templatetrackersph@gmail.com.</p>
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `Template Trackers PH <${fromEmail}>`,
        to: email,
        subject: 'Welcome — Template Trackers PH',
        html: welcomeHtml,
      }),
    });

    const body = await resp.json();
    if (!resp.ok) {
      console.error('Resend subscribe error:', { status: resp.status, body });
      return NextResponse.json(
        { error: 'Failed to send welcome email', providerStatus: resp.status, providerBody: body },
        { status: 500 }
      );
    }

    // Optionally, notify site owner
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `Template Trackers PH <${fromEmail}>`,
          to: process.env.EMAIL_FROM || 'templatetrackersph@gmail.com',
          subject: `New subscriber: ${email}`,
          html: `<p>New subscriber: <strong>${email}</strong></p>`,
        }),
      });
    } catch (e) {
      console.warn('Failed to notify owner about new subscriber', e?.message || e);
    }

    return NextResponse.json({ success: true, id: body?.id || null });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
