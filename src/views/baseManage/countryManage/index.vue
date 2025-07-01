<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:29:56
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增国家
      </NButton>
    </template>

    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1200"
      :columns="columns"
      :get-data="api.read"
    >
      <MeQueryItem label="中文名" :label-width="50">
        <n-input
          v-model:value="queryItems.cnName"
          type="text"
          placeholder="请输入中文名"
          clearable
        />
      </MeQueryItem>
      <MeQueryItem label="英文名" :label-width="50">
        <n-input
          v-model:value="queryItems.enName"
          type="text"
          placeholder="请输入英文名"
          clearable
        />
      </MeQueryItem>
      <MeQueryItem label="手机代码" :label-width="50">
        <n-input
          v-model:value="queryItems.phoneCode"
          type="text"
          placeholder="请输入手机代码"
          clearable
        />
      </MeQueryItem>
      <MeQueryItem label="国家代码" :label-width="50">
        <n-input
          v-model:value="queryItems.iso"
          type="text"
          placeholder="请输入国家代码"
          clearable
        />
      </MeQueryItem>
    </MeCrud>

    <MeModal ref="modalRef" width="520px">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
        :disabled="modalAction === 'view'"
      >
        <n-form-item
          v-if="['add', 'edit'].includes(modalAction)"
          label="中文名"
          path="cnName"
          :rule="{
            required: true,
            message: '请输入中文名',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.cnName" />
        </n-form-item>
        <n-form-item
          v-if="['add', 'edit'].includes(modalAction)"
          label="英文名"
          path="enName"
          :rule="{
            required: true,
            message: '请输入英文名',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.enName" />
        </n-form-item>
        <n-form-item
          v-if="['add', 'edit'].includes(modalAction)"
          label="Iso"
          path="cnName"
          :rule="{
            required: true,
            message: '请输入Iso',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.iso" />
        </n-form-item>
        <n-form-item
          v-if="['add', 'edit'].includes(modalAction)"
          label="手机代码"
          path="phoneCode"
          :rule="{
            required: true,
            message: '请输入中文名',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.phoneCode" />
        </n-form-item>
      </n-form>

    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NAvatar, NButton, NSwitch, NTag } from 'naive-ui'
import { MeCrud, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'
import { withPermission } from '@/directives'
import { formatDateTime } from '@/utils'
import api from './api'

defineOptions({ name: 'UserMgt' })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})

onMounted(() => {
  $table.value?.handleSearch()
})

const roles = ref([])
api.getAllRoles().then(res => (roles.value = res))

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleOpen,
  handleSave,
} = useCrud({
  name: '用户',
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  refresh: () => $table.value?.handleSearch(),
})

const columns = [

  { title: '中文名', key: 'cnName', width: 150, ellipsis: { tooltip: true } },
  { title: '英文名', key: 'enName', width: 150, ellipsis: { tooltip: true } },
  { title: '国家代码', key: 'iso', width: 150, ellipsis: { tooltip: true } },
  { title: '手机代码', key: 'phoneCode', width: 150, ellipsis: { tooltip: true } },
  {
    title: '操作',
    key: 'actions',
    width: 300,
    align: 'right',
    fixed: 'right',
    hideInExcel: true,
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            class: 'ml-12px',
            secondary: true,
            onClick: () => handleEdit(row),
          },
          {
            default: () => '编辑',
          },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            onClick: () => handleDelete({ iso: row.iso }),
          },
          {
            default: () => '删除',
            icon: () => h('i', { class: 'i-material-symbols:delete-outline text-14' }),
          },
        ),
      ]
    },
  },
]

function handleEdit(item = {}) {
  handleOpen({
    action: 'edit',
    title: `编辑用户`,
    row: item,
    okText: '保存',
  })
  $table.value?.handleSearch()
}
function onSave() {
  if (modalAction.value === 'setRole') {
    return handleSave({
      api: () => api.update(modalForm.value),
      cb: () => $message.success('分配成功'),
    })
  }
  else if (modalAction.value === 'reset') {
    return handleSave({
      api: () => api.resetPwd({ id: modalForm.value.id, newPassword: modalForm.value.newPassword, oldPassword: modalForm.value.oldPassword }),
      cb: () => $message.success('密码重置成功'),
    })
  }
  handleSave()
}
</script>
