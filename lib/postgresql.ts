import { Pool, PoolClient } from 'pg'

// Client-side'da PostgreSQL kullanımına karşı uyarı
if (typeof window !== 'undefined') {
  console.warn('⚠️ PostgreSQL client client-side\'da kullanılıyor!')
}

// PostgreSQL bağlantı havuzu - DATABASE_URL kullan
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/elt_arena',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  client_encoding: 'utf8',
})

// Connection test
pool.on('connect', () => {
  console.log('✅ PostgreSQL bağlantısı başarılı')
})

pool.on('error', (err: Error) => {
  console.error('❌ PostgreSQL bağlantı hatası:', err)
})

// Database query helper
export const query = async (text: string, params?: any[]) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log(`🔍 Query executed: ${text.substring(0, 50)}... (${duration}ms)`)
    return res
  } catch (error) {
    console.error('❌ Database query error:', error)
    throw error
  }
}

// Transaction helper
export const transaction = async (callback: (client: PoolClient) => Promise<any>) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Database connection close (for graceful shutdown)
export const closePool = () => {
  return pool.end()
}

// Database types (Supabase'den taşınan)
export interface Database {
  public: {
    Tables: {
      grades: {
        Row: {
          id: string
          title: string
          category: "İlkokul" | "Ortaokul" | "Lise" | "Yabancı Dil"
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          category: "İlkokul" | "Ortaokul" | "Lise" | "Yabancı Dil"
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: "İlkokul" | "Ortaokul" | "Lise" | "Yabancı Dil"
          order_index?: number
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          grade_id: string
          title: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          grade_id: string
          title: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          grade_id?: string
          title?: string
          order_index?: number
          updated_at?: string
        }
      }
      units: {
        Row: {
          id: number
          grade_id: string
          title: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          grade_id: string
          title: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          grade_id?: string
          title?: string
          order_index?: number
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          unit_id: number
          title: string
          description: string | null
          file_url: string | null
          resource_type: "video" | "pdf" | "image" | "audio" | "document"
          order_index: number
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          unit_id: number
          title: string
          description?: string | null
          file_url?: string | null
          resource_type: "video" | "pdf" | "image" | "audio" | "document"
          order_index?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          unit_id?: number
          title?: string
          description?: string | null
          file_url?: string | null
          resource_type?: "video" | "pdf" | "image" | "audio" | "document"
          order_index?: number
          updated_at?: string
          created_by?: string | null
        }
      }
      announcements: {
        Row: {
          id: number
          title: string
          content: string
          image_url: string | null
          is_active: boolean
          display_once_per_session: boolean | null
          created_by: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title?: string
          content?: string
          image_url?: string | null
          is_active?: boolean
          display_once_per_session?: boolean | null
          created_by?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          content?: string
          image_url?: string | null
          is_active?: boolean
          display_once_per_session?: boolean | null
          created_by?: number | null
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          username: string
          email: string
          password_hash: string
          role: "admin" | "super_admin"
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          password_hash: string
          role?: "admin" | "super_admin"
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          password_hash?: string
          role?: "admin" | "super_admin"
          is_active?: boolean
          last_login?: string | null
          updated_at?: string
        }
      }
    }
  }
}

export default pool
