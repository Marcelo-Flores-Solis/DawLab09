import { useMutation } from '@tanstack/react-query'
import { login } from '../api/auth'

// Inicio de sesión como mutación: expone isPending / isError sin manejar estado a mano.
export function useLogin() {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
  })
}
