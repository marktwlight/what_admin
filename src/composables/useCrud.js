/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/12 09:03:00
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { cloneDeep } from 'lodash-es'
import { useForm, useModal } from '.'

const ACTIONS = {
  view: '查看',
  edit: '编辑',
  add: '新增',
}

export function useCrud({ name, initForm = {}, doCreate, doDelete, doUpdate, doUpload, refresh }) {
  const modalAction = ref('')
  const [modalRef, okLoading] = useModal()
  const [modalFormRef, modalForm, validation] = useForm(initForm)

  /** 新增 */
  function handleAdd(row = {}, title) {
    handleOpen({ action: 'add', title, row: Object.assign({}, cloneDeep(initForm), cloneDeep(row)) })
  }

  /** 修改 */
  function handleEdit(row, title) {
    handleOpen({ action: 'edit', title, row })
  }

  /** 上传 */
  function handleUpload(row, title) {
    handleOpen({ action: 'upload', title, row })
  }

  /** 查看 */
  function handleView(row, title) {
    handleOpen({ action: 'view', title, row })
  }

  /** 打开modal */
  function handleOpen(options = {}) {
    const { action, row, title, onOk } = options
    modalAction.value = action
    modalForm.value = { ...row }
    modalRef.value?.open({
      ...options,
      async onOk() {
        if (typeof onOk === 'function') {
          return await onOk()
        }
        else {
          return await handleSave()
        }
      },
      title: title ?? (ACTIONS[modalAction.value] || '') + name,
    })
  }

  /** 保存 */
  async function handleSave(action) {
    await validation()
    if (!action && !['edit', 'add', 'upload'].includes(modalAction.value)) {
      return false
    }

    const formData = new FormData()
    if (['upload'].includes(modalAction.value)) {
      Object.entries(modalForm.value).forEach(([key, value]) => {
        formData.append(key, value) // 添加自定义数据
      })
    }

    const actions = {
      add: {
        api: () => doCreate(modalForm.value),
        cb: () => $message.success('新增成功'),
      },
      edit: {
        api: () => doUpdate(modalForm.value),
        cb: () => $message.success('保存成功'),
      },
      upload: {

        api: () => doUpload(formData),
        cb: () => $message.success('上传成功'),
      },
    }

    action = action || actions[modalAction.value]

    try {
      okLoading.value = true
      await action.api()
      action.cb()
      okLoading.value = false

      refresh()
    }
    catch (error) {
      console.error(error)
      okLoading.value = false
      return false
    }
  }

  /** 删除 */
  function handleDelete(params, confirmOptions) {
    if (!params)
      return
    const d = $dialog.warning({
      content: '确定删除？',
      title: '提示',
      positiveText: '确定',
      negativeText: '取消',
      async onPositiveClick() {
        try {
          d.loading = true
          const data = await doDelete(params)
          $message.success('删除成功')
          d.loading = false
          refresh(data, true)
        }
        catch (error) {
          console.error(error)
          d.loading = false
        }
      },
      ...confirmOptions,
    })
  }

  return {
    modalRef,
    modalFormRef,
    modalAction,
    modalForm,
    okLoading,
    validation,
    handleAdd,
    handleUpload,
    handleDelete,
    handleEdit,
    handleView,
    handleOpen,
    handleSave,
  }
}
