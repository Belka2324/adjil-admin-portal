import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phoneNumber } = await request.json();

    // Validate input
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate phone number format (must be numeric, minimum 8 digits)
    const phoneRegex = /^\d{8,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Must be at least 8 digits.' },
        { status: 400 }
      );
    }

    // Create auth user with email confirmation required
    const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Require email verification
    });

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'User creation failed - no user ID returned' },
        { status: 500 }
      );
    }

    // Validate user.id is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) {
      console.error('Invalid UUID returned from Supabase Auth:', user.id);
      return NextResponse.json(
        { error: 'Invalid user ID returned from authentication provider' },
        { status: 500 }
      );
    }

    // Create user profile in shared users table (Adjil.BNPL schema)
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`,
        phone_number: phoneNumber,
        role: 'support', // Default role for admin portal users
        status: 'active',
      });

    if (profileError) {
      // Delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(user.id);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Registration successful. Please check your email to verify your account.',
        email,
        user: {
          id: user.id,
          email,
          firstName,
          lastName,
          phoneNumber,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
