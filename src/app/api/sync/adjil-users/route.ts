import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET: Fetch all users from Adjil.BNPL
export async function GET(request: NextRequest) {
  try {
    // Fetch all users from Adjil.BNPL users table
    // Note: BNPL uses 'status' (active/inactive) not 'isActive'
    // BNPL uses 'created_at' not 'createdAt'
    const { data: adjilUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .in('status', ['active', 'inactive'])
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { error: `Failed to fetch Adjil users: ${fetchError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully synced Adjil.BNPL users',
        totalUsers: adjilUsers?.length || 0,
        users: adjilUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Sync specific users to admin portal
export async function POST(request: NextRequest) {
  try {
    const { userIds } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds array is required' },
        { status: 400 }
      );
    }

    // Fetch specific users from Adjil.BNPL
    const { data: adjilUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { error: `Failed to fetch Adjil users: ${fetchError.message}` },
        { status: 500 }
      );
    }

    // Create or update user mappings in admin_user_sync table
    if (adjilUsers && adjilUsers.length > 0) {
      const syncData = adjilUsers.map((user: any) => ({
        adjilUserId: user.id,
        email: user.email,
        firstName: user.name ? user.name.split(' ')[0] : '',
        lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
        name: user.name || '',
        phoneNumber: user.phone || user.phoneNumber || '',
        role: user.role === 'merchant' ? UserRole.MERCHANT : UserRole.CUSTOMER,
        isActive: user.status === 'active',
        adjilRole: user.role,
        adjilStatus: user.status,
        adjilBalance: user.balance,
        adjilCreditLimit: user.credit_limit,
        adjilData: user, // Store original Adjil data
        lastSyncedAt: new Date().toISOString(),
      }));

      const { error: upsertError } = await supabase
        .from('admin_user_sync')
        .upsert(syncData, {
          onConflict: 'adjilUserId',
        });

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        return NextResponse.json(
          { error: `Failed to sync users: ${upsertError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Users synced successfully',
        syncedCount: adjilUsers?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
