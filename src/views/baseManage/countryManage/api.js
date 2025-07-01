/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:29:51
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { request } from '@/utils'

export default {
  create: data => request.post('/api/admin/country/create', data),
  read: (params = {}) => request.post('/api/admin/country/page', params),
  update: data => request.post(`/api/admin/country/update`, data),
  delete: data => request.post(`/api/admin/country/delete`, data),

  changeStatus: data => request.post(`/api/admin/user/change_status`, data),

  getAllRoles: () => request.get('/api/admin/role/all'),
}
