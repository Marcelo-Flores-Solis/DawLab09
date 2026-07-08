import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi, type CategoryPayload } from '../api/resources'
import { queryKeys } from './queryKeys'

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoriesApi.list,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CategoryPayload) => categoriesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => categoriesApi.remove(id),
    onSuccess: () => {
      // Borrar una categoría arrastra sus productos: refrescamos ambos.
      qc.invalidateQueries({ queryKey: queryKeys.categories })
      qc.invalidateQueries({ queryKey: queryKeys.products })
    },
  })
}
