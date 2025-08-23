import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { query } from './postgresql'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface AuthUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'super_admin'
  is_active: boolean
}

export interface JWTPayload {
  userId: string
  username: string
  role: string
  iat?: number
  exp?: number
}

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Password verification
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

// JWT token generation
export const generateToken = (user: AuthUser): string => {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: user.role
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

// JWT token verification
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Get user by credentials
export const authenticateUser = async (username: string, password: string): Promise<AuthUser | null> => {
  try {
    console.log('🔍 Auth Debug: Authenticating user:', username)
    
    const result = await query(
      'SELECT id, username, password_hash, full_name, is_active FROM admin_users WHERE username = $1',
      [username]
    )

    if (result.rows.length === 0) {
      console.log('❌ Auth Debug: User not found')
      return null
    }

    const user = result.rows[0]
    console.log('🔍 Auth Debug: User found:', {
      id: user.id,
      username: user.username,
      is_active: user.is_active,
      hash_length: user.password_hash?.length,
      hash_preview: user.password_hash?.substring(0, 20) + '...'
    })

    if (!user.is_active) {
      console.log('❌ Auth Debug: Account deactivated')
      throw new Error('Account is deactivated')
    }

    const trimmedHash = user.password_hash.trim()
    console.log('🔍 Auth Debug: Comparing passwords:', {
      provided_password: password,
      hash_trimmed_length: trimmedHash.length,
      hash_starts_with: trimmedHash.substring(0, 7)
    })

    const isValidPassword = await verifyPassword(password, trimmedHash)
    console.log('🔍 Auth Debug: Password verification result:', isValidPassword)
    
    if (!isValidPassword) {
      console.log('❌ Auth Debug: Invalid password')
      return null
    }

    // Update last login (add columns if needed later)
    await query(
      'UPDATE admin_users SET updated_at = NOW() WHERE id = $1',
      [user.id]
    )

    return {
      id: user.id,
      username: user.username,
      email: user.username + '@admin.local', // temporary email since schema doesn't have email
      role: 'admin', // default role since schema doesn't have role
      is_active: user.is_active
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Get user by ID
export const getUserById = async (userId: string): Promise<AuthUser | null> => {
  try {
    const result = await query(
      'SELECT id, username, full_name, is_active FROM admin_users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const user = result.rows[0]
    return {
      id: user.id,
      username: user.username,
      email: user.username + '@admin.local',
      role: 'admin',
      is_active: user.is_active
    }
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

// Extract token from request
export const extractTokenFromRequest = (request: NextRequest): string | null => {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check cookie
  const tokenFromCookie = request.cookies.get('auth-token')?.value
  if (tokenFromCookie) {
    return tokenFromCookie
  }

  return null
}

// Middleware helper for protected routes
export const requireAuth = async (request: NextRequest): Promise<{ user: AuthUser; token: string } | null> => {
  const token = extractTokenFromRequest(request)
  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  const user = await getUserById(payload.userId)
  if (!user) {
    return null
  }

  return { user, token }
}

// Admin role check
export const requireAdmin = (user: AuthUser): boolean => {
  return user.role === 'admin' || user.role === 'super_admin'
}

// Super admin role check
export const requireSuperAdmin = (user: AuthUser): boolean => {
  return user.role === 'super_admin'
}

// Create admin user (for initial setup)
export const createAdmin = async (
  username: string,
  email: string,
  password: string,
  role: 'admin' | 'super_admin' = 'admin'
): Promise<AuthUser> => {
  const hashedPassword = await hashPassword(password)
  
  const result = await query(
    `INSERT INTO admins (username, email, password_hash, role) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, username, email, role, is_active`,
    [username, email, hashedPassword, role]
  )

  return result.rows[0] as AuthUser
}

// Password reset
export const updatePassword = async (userId: string, newPassword: string): Promise<boolean> => {
  try {
    const hashedPassword = await hashPassword(newPassword)
    await query(
      'UPDATE admins SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    )
    return true
  } catch (error) {
    console.error('Password update error:', error)
    return false
  }
}

// Session blacklist (for logout)
const blacklistedTokens = new Set<string>()

export const blacklistToken = (token: string): void => {
  blacklistedTokens.add(token)
  
  // Clean up expired tokens periodically
  setTimeout(() => {
    blacklistedTokens.delete(token)
  }, 7 * 24 * 60 * 60 * 1000) // 7 days
}

export const isTokenBlacklisted = (token: string): boolean => {
  return blacklistedTokens.has(token)
}
