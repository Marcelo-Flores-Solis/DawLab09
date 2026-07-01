import api from './client'

function crudFor(resource) {
  return {
    list: () => api.get(`/${resource}/`).then((res) => res.data),
    get: (id) => api.get(`/${resource}/${id}/`).then((res) => res.data),
    create: (data) => api.post(`/${resource}/`, data).then((res) => res.data),
    update: (id, data) => api.put(`/${resource}/${id}/`, data).then((res) => res.data),
    patch: (id, data) => api.patch(`/${resource}/${id}/`, data).then((res) => res.data),
    remove: (id) => api.delete(`/${resource}/${id}/`),
  }
}

export const categoriesApi = crudFor('categorys')
export const productsApi = crudFor('products')
export const ordersApi = crudFor('orders')
export const orderDetailsApi = crudFor('order-details')
export const addressesApi = crudFor('adresses')
