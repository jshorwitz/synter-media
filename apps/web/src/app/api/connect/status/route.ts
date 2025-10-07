/**
 * Get connection status for all providers
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // TODO: Get authenticated user from session
    const userId = request.headers.get('x-user-id') || 'user-123'

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // TODO: Query database for connections
    // For now, return mock data
    const connections = {
      google: {
        connected: false,
        status: 'not_connected',
        displayName: null,
        accountCount: 0,
        lastSync: null,
      },
      reddit: {
        connected: false,
        status: 'not_connected',
        displayName: null,
        accountCount: 0,
        lastSync: null,
      },
      linkedin: {
        connected: false,
        status: 'not_connected',
        displayName: null,
        accountCount: 0,
        lastSync: null,
      },
      x: {
        connected: false,
        status: 'not_connected',
        displayName: null,
        accountCount: 0,
        lastSync: null,
      },
      meta: {
        connected: false,
        status: 'not_connected',
        displayName: null,
        accountCount: 0,
        lastSync: null,
      },
    }

    /*
    // Database query (uncomment when DB is ready):
    
    const { Pool } = require('pg')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    
    const result = await pool.query(`
      SELECT
        oc.provider,
        oc.display_name,
        oc.status,
        COUNT(DISTINCT aa.id) as account_count,
        MAX(aa.last_synced_at) as last_sync
      FROM oauth_connections oc
      LEFT JOIN ad_accounts aa ON aa.connection_id = oc.id
      WHERE oc.user_id = $1
      GROUP BY oc.provider, oc.display_name, oc.status
    `, [userId])
    
    result.rows.forEach(row => {
      connections[row.provider] = {
        connected: true,
        status: row.status,
        displayName: row.display_name,
        accountCount: parseInt(row.account_count),
        lastSync: row.last_sync,
      }
    })
    
    await pool.end()
    */

    return NextResponse.json({ connections })
  } catch (error: any) {
    console.error('[Connect] Status error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
