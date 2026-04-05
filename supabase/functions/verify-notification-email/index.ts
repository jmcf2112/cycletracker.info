import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateCode(): string {
  const chars = '0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify the user from the JWT
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action, email, code } = await req.json()

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    if (action === 'send') {
      // Validate email
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return new Response(JSON.stringify({ error: 'Invalid email address' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const verificationCode = generateCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

      // Upsert the notification preferences with code
      const { error: upsertError } = await adminClient
        .from('email_notification_preferences')
        .upsert({
          user_id: user.id,
          email,
          email_verified: false,
          verification_code: verificationCode,
          verification_expires_at: expiresAt,
        }, { onConflict: 'user_id' })

      if (upsertError) {
        console.error('Upsert error:', upsertError)
        return new Response(JSON.stringify({ error: 'Failed to save verification code' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Send the verification email via Resend
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
      if (!RESEND_API_KEY) {
        return new Response(JSON.stringify({ error: 'Email service not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Cycle Tracker <notifications@cycletracker.info>',
          to: [email],
          subject: 'Verify your notification email',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
              <h2 style="color: #1a1a1a; margin-bottom: 16px;">Verify your email</h2>
              <p style="color: #555; line-height: 1.6; margin-bottom: 24px;">
                Use the code below to verify this email address for Cycle Tracker notifications.
                This code expires in 10 minutes.
              </p>
              <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #FB7185;">${verificationCode}</span>
              </div>
              <p style="color: #999; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        }),
      })

      if (!resendRes.ok) {
        const errBody = await resendRes.text()
        console.error('Resend error:', resendRes.status, errBody)
        return new Response(JSON.stringify({ error: 'Failed to send verification email' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'verify') {
      if (!code || typeof code !== 'string' || code.length !== 6) {
        return new Response(JSON.stringify({ error: 'Invalid verification code' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Get the user's preferences
      const { data: prefs, error: fetchError } = await adminClient
        .from('email_notification_preferences')
        .select('verification_code, verification_expires_at')
        .eq('user_id', user.id)
        .single()

      if (fetchError || !prefs) {
        return new Response(JSON.stringify({ error: 'No pending verification found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (!prefs.verification_code || !prefs.verification_expires_at) {
        return new Response(JSON.stringify({ error: 'No pending verification' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (new Date(prefs.verification_expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: 'Verification code expired' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (prefs.verification_code !== code) {
        return new Response(JSON.stringify({ error: 'Incorrect verification code' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Mark as verified, clear the code
      const { error: updateError } = await adminClient
        .from('email_notification_preferences')
        .update({
          email_verified: true,
          verification_code: null,
          verification_expires_at: null,
        })
        .eq('user_id', user.id)

      if (updateError) {
        return new Response(JSON.stringify({ error: 'Failed to verify email' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true, verified: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('verify-notification-email error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
