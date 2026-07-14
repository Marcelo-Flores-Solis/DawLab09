import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi, type ProductPayload } from '../api/resources'
import { queryKeys } from './queryKeys'



export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: productsApi.list,
  })
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => productsApi.get(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductPayload) => productsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductPayload }) =>
      productsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  })
}
