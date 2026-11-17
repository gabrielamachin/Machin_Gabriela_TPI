// Interfaces con los mismos nombres de campo que los schemas del backend.

export type Rol = 'user' | 'admin'

export interface UserPublic {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

export interface UserCreate {
  username: string
  full_name: string
  email: string
  password: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface MessageResponse {
  message: string
}

/** Lo único del usuario que se guarda en el navegador (nunca el token). */
export type UsuarioSesion = Pick<UserPublic, 'id' | 'username' | 'full_name' | 'email' | 'role'>
