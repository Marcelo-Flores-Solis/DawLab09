import { useMutation } from '@tanstack/react-query'
import { login, register } from '../api/auth'

// Inicio de sesión como mutación: expone isPending / isError sin manejar estado a mano.
export function useLogin() {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
  })
}

// Registro + inicio de sesión automático: tras crear la cuenta, autenticamos al
// usuario con las mismas credenciales para que entre directo a la tienda.
export function useRegister() {
  return useMutation({
    mutationFn: async ({
      username,
      password,
      email,
    }: {
      username: string
      password: string
      email?: string
    }) => {
      await register(username, password, email)
      await login(username, password)
    },
  })
}
