export type AuthFormState = {
  error: string | null
  message: string | null
}

export const initialAuthState: AuthFormState = {
  error: null,
  message: null,
}

export function buildErrorState(message: string): AuthFormState {
  return { error: message, message: null }
}

export function buildSuccessState(message: string): AuthFormState {
  return { error: null, message }
}
