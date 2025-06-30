/**********************************
 * @FilePath: interceptors.js
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023-12-07 15:30:00
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { useAuthStore } from '@/store'
import { resolveResError } from './helpers'

// 成功状态码
const SUCCESS_CODE = 0 // 根据实际后端成功码调整
const JSON_CONTENT_TYPE = 'application/json'

export function setupInterceptors(axiosInstance) {
  // 请求拦截
  axiosInstance.interceptors.request.use(
    handleRequestSuccess,
    handleRequestError,
  )

  // 响应拦截
  axiosInstance.interceptors.response.use(
    handleResponseSuccess,
    handleResponseError,
  )
}

/**
 * 请求成功处理
 * @param {import('axios').AxiosRequestConfig} config
 */
function handleRequestSuccess(config) {
  if (config.needToken === false)
    return config

  const { accessToken } = useAuthStore()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
}

/**
 * 请求失败处理
 * @param {Error} error
 */
function handleRequestError(error) {
  return Promise.reject(error)
}

/**
 * 响应成功处理
 * @param {import('axios').AxiosResponse} response
 */
function handleResponseSuccess(response) {
  const { data, headers } = response
  const contentType = headers['content-type'] || ''

  // 非JSON响应直接返回
  if (!contentType.includes(JSON_CONTENT_TYPE)) {
    return data ?? response
  }

  // 处理后端返回的 { Code, Data, Msg } 结构
  if (data.code === SUCCESS_CODE) {
    return data.data // 直接返回业务数据
  }

  // 业务错误处理
  const errorMsg = resolveResError(data.code, data.msg)
  return Promise.reject({
    code: data.code,
    message: errorMsg,
    error: data,
  })
}

/**
 * 响应失败处理
 * @param {Error} error
 */
async function handleResponseError(error) {
  // 网络错误或无响应
  if (!error.response) {
    const message = resolveResError(error.code, error.message)
    return Promise.reject({
      code: error.code || -1,
      message,
      error,
    })
  }

  // HTTP错误处理
  const { data, status } = error.response
  if (data && data.Code !== undefined) {
    // 处理后端返回的错误结构 { Code, Msg }
    const errorMsg = resolveResError(data.Code, data.Msg)
    return Promise.reject({
      code: data.Code,
      message: errorMsg,
      error: data,
    })
  }

  // 其他HTTP错误
  const errorMsg = resolveResError(status, error.message)
  return Promise.reject({
    code: status,
    message: errorMsg,
    error: error.response,
  })
}
