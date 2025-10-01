"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos' }
  }

  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: { [key: string]: any }) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      console.error('Login error:', error)
      return { error: mapAuthError(error) }
    }

    if (data.user) {
      console.log('Login successful:', data.user.email)
      // Redirect será manejado por el middleware
      redirect('/dashboard')
    }

    return { error: 'Error desconocido en el login' }
  } catch (error) {
    console.error('Login exception:', error)
    return { error: 'Error de conexión. Verifica tu conexión a internet.' }
  }
}

function mapAuthError(error: { message?: string }): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Email o contraseña incorrectos'
    case 'Email not confirmed':
      return 'Debes confirmar tu email antes de iniciar sesión'
    case 'Too many requests':
      return 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente'
    case 'User not found':
      return 'No existe una cuenta con este email'
    default:
      return error.message || 'Error al iniciar sesión'
  }
}