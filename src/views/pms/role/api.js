/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:29:27
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { request } from '@/utils'

export default {
  create: data => request.post('/api/admin/role/create', data),
  read: (data = {}) => request.post('/api/admin/role/page', data),
  update: data => request.post(`/api/admin/role/update`, data),
  detail: data => request.post(`/api/admin/role/detail`, data),
  delete: data => request.post(`/api/admin/role/delete`, data),

  getAllPermissionTree: () => request.get('/api/admin/menu/permissions'),
  getAllUsers: (params = {}) => request.get('/user', { params }),
  addRoleUsers: (roleId, data) => request.patch(`/role/users/add/${roleId}`, data),
  removeRoleUsers: (roleId, data) => request.patch(`/role/users/remove/${roleId}`, data),
}
