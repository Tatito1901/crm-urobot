'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

import { buildErrorState, buildSuccessState, buildLoginSuccessState, initialAuthState, type AuthFormState } from './state'

type Credentials = {
  email: string
  password: string
}

function getCredentials(formData: FormData): Credentials | { error: string } {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()

  if (!email || !password) {
    return { error: 'Correo y contraseña son obligatorios' } as const
  }

  return { email, password }
}

export async function signUpAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const supabase = await createClient()
  const credentials = getCredentials(formData)

  if ('error' in credentials) {
    return buildErrorState(credentials.error)
  }

  const { email, password } = credentials
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return buildErrorState(error.message)
  }

  redirect('/dashboard')
  return initialAuthState
}

export async function signInAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const supabase = await createClient()
  const credentials = getCredentials(formData)

  if ('error' in credentials) {
    return buildErrorState(credentials.error)
  }

  const { email, password } = credentials
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return buildErrorState(error.message)
  }

  // Retornar estado de éxito para que el cliente maneje la animación y redirect
  return buildLoginSuccessState()
}

export async function resetPasswordAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const supabase = await createClient()
  const email = String(formData.get('email') ?? '').trim()

  if (!email) {
    return buildErrorState('Ingresa el correo registrado')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/reset`,
  })

  if (error) {
    return buildErrorState(error.message)
  }

  return buildSuccessState('Te enviamos un enlace para restablecer tu contraseña.')
}

export async function updatePasswordAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const supabase = await createClient()
  const password = String(formData.get('password') ?? '').trim()

  if (password.length < 8) {
    return buildErrorState('La nueva contraseña debe tener al menos 8 caracteres')
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return buildErrorState(error.message)
  }

  redirect('/dashboard')
  return initialAuthState
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/auth')
}
