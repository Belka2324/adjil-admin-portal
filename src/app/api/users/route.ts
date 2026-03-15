import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verify authorization header and extract user
 */
async function verifyAuth(request: NextRequest): Promise<{ authenticated: boolean; userId?: string; role?: string }> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false };
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { authenticated: false };
    }
    
    // Get user role from custom claims or metadata
    const role = user.user_metadata?.role || 'support';
    
    return { authenticated: true, userId: user.id, role };
  } catch (err) {
    console.error('Error verifying auth:', err);
    return { authenticated: false };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized - valid authentication required' }, { status: 401 });
    }
    
    // Only ceo, admin, partner can view users
    if (!['ceo', 'admin', 'partner', 'support'].includes(auth.role || '')) {
      return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 });
    }
    
    // Fetch all users from shared users table (Adjil.BNPL schema)
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized - valid authentication required' }, { status: 401 });
    }
    
    // Only CEO can change roles, activate/suspend users
    // Admin can only edit basic user info (names, etc.)
    const body = await request.json();
    const { userId, first_name, last_name, status, role } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    // If trying to change role, only CEO is allowed
    if (role !== undefined && auth.role !== 'ceo') {
      return NextResponse.json({ error: 'Forbidden - only CEO can change user roles' }, { status: 403 });
    }
    
    // If trying to change status (activate/suspend), only CEO is allowed
    if (status !== undefined && auth.role !== 'ceo') {
      return NextResponse.json({ error: 'Forbidden - only CEO can activate/suspend users' }, { status: 403 });
    }
    
    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    if (first_name !== undefined) {
      updateData.first_name = first_name;
      // Also update name if first_name or last_name is provided
      if (last_name !== undefined) {
        updateData.name = `${first_name} ${last_name}`;
      } else {
        // Get existing last_name if not provided
        const { data: existingUser } = await supabase
          .from('users')
          .select('last_name')
          .eq('id', userId)
          .single();
        if (existingUser?.last_name) {
          updateData.name = `${first_name} ${existingUser.last_name}`;
        }
      }
    }
    
    if (last_name !== undefined) {
      updateData.last_name = last_name;
      if (first_name !== undefined) {
        updateData.name = `${first_name} ${last_name}`;
      } else {
        // Get existing first_name if not provided
        const { data: existingUser } = await supabase
          .from('users')
          .select('first_name')
          .eq('id', userId)
          .single();
        if (existingUser?.first_name) {
          updateData.name = `${existingUser.first_name} ${last_name}`;
        }
      }
    }
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    if (role !== undefined) {
      // Validate role is valid
      if (!['admin', 'partner', 'support', 'ceo'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      updateData.role = role;
    }
    
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized - valid authentication required' }, { status: 401 });
    }
    
    // Only CEO can delete users
    if (auth.role !== 'ceo') {
      return NextResponse.json({ error: 'Forbidden - only CEO can delete users' }, { status: 403 });
    }
    
    // Get userId from URL query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
    }
    
    // Prevent CEO from deleting themselves
    if (userId === auth.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }
    
    // Delete user from database (soft delete by setting status to deleted)
    const { error: updateError } = await supabase
      .from('users')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
