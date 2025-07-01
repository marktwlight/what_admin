/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:29:51
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { request } from '@/utils'

export default {
  create: data => request.post('/api/admin/user/create', data),
  read: (params = {}) => request.post('/api/admin/user/page', params),
  update: data => request.post(`/api/admin/user/update`, data),
  delete: id => request.delete(`/user/${id}`),

  changeStatus: data => request.post(`/api/admin/user/change_status`, data),

  getAllRoles: () => request.get('/api/admin/role/all'),
}
