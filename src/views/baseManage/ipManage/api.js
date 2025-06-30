/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:29:27
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { request } from '@/utils'

export default {
  create: data => request.post('/api/admin/ws_proxy_group/create', data),
  read: (data = {}) => request.post('/api/admin/ws_proxy_group/page', data),
  update: data => request.post(`/api/admin/role/update`, data),
  detail: data => request.post(`/api/admin/role/detail`, data),
  delete: data => request.post(`/api/admin/ws_proxy_group/delete`, data),
  upload: data => request.post(`/api/admin/ws_proxy_group/upload`, data),

  detailPageInfo: data => request.post(`/api/admin/ws_proxy_info/page`, data),

}
