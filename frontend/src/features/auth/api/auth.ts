import { axiosInstance } from '@/shared/api/axiosInstance'

import type { LoginCredentials, MessageResponse, UserCreate, UserPublic } from '../types'

export async function login(credenciales: LoginCredentials): Promise<MessageResponse> {
  // El login del backend es un formulario OAuth2 (application/x-www-form-urlencoded).
  const formulario = new URLSearchParams({
    username: credenciales.username,
    password: credenciales.password,
  })
  const { data } = await axiosInstance.post<MessageResponse>('/auth/token', formulario, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export async function register(datos: UserCreate): Promise<UserPublic> {
  const { data } = await axiosInstance.post<UserPublic>('/auth/register', datos)
  return data
}

export async function logout(): Promise<MessageResponse> {
  const { data } = await axiosInstance.post<MessageResponse>('/auth/logout')
  return data
}

export async function getMe(): Promise<UserPublic> {
  const { data } = await axiosInstance.get<UserPublic>('/auth/me')
  return data
}
