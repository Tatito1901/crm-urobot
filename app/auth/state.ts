export type AuthFormState = {
  error: string | null
  message: string | null
  success: boolean
}

export const initialAuthState: AuthFormState = {
  error: null,
  message: null,
  success: false,
}

export function buildErrorState(message: string): AuthFormState {
  return { error: message, message: null, success: false }
}

export function buildSuccessState(message: string): AuthFormState {
  return { error: null, message, success: false }
}

export function buildAuthSuccessState(): AuthFormState {
  return { error: null, message: null, success: true }
}
