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
        创建新用户
      </NButton>
    </template>

    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1200"
      :columns="columns"
      :get-data="api.read"
    >
      <MeQueryItem label="用户名" :label-width="50">
        <n-input
          v-model:value="queryItems.username"
          type="text"
          placeholder="请输入用户名"
          clearable
        />
      </MeQueryItem>

      <MeQueryItem label="状态" :label-width="50">
        <n-select
          v-model:value="queryItems.status"
          clearable
          :options="[
            { label: '全部', value: 0 },
            { label: '启用', value: 1 },
            { label: '禁用', value: 2 },

          ]"
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
          v-if="['add','edit'].includes(modalAction)"
          label="用户名"
          path="username"
          :rule="{
            required: true,
            message: '请输入用户名',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.username" :disabled="modalAction !== 'add'" />
        </n-form-item>
        <n-form-item
          v-if="['add'].includes(modalAction)"
          label="初始密码"
          path="password"
          :rule="{
            required: true,
            message: '请输入密码',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.password" type="password" show-password-on="mousedown" />
        </n-form-item>
        <n-form-item
          v-if="['reset'].includes(modalAction)"
          label="旧密码"
          path="oldPassword"
          :rule="{
            required: true,
            message: '请输入密码',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.oldPassword" type="password" show-password-on="mousedown" />
        </n-form-item>
        <n-form-item
          v-if="['reset'].includes(modalAction)"
          label="新密码"
          path="newPassword"
          :rule="{
            required: true,
            message: '请输入密码',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.newPassword" type="password" show-password-on="mousedown" />
        </n-form-item>
        <n-form-item v-if="['add', 'edit'].includes(modalAction)" label="角色" path="role">
          <n-select
            v-model:value="modalForm.role"
            :options="roles"
            label-field="name"
            value-field="name"
            clearable
            filterable
          />
        </n-form-item>
        <!-- <n-form-item v-if="modalAction === 'add'" label="状态" path="status">
          <NSwitch v-model:value="modalForm.status">
            <template #checked>
              启用
            </template>
            <template #unchecked>
              停用
            </template>
          </NSwitch>
        </n-form-item> -->
      </n-form>
      <n-alert v-if="modalAction === 'add'" type="warning" closable>
        详细信息需由用户本人补充修改
      </n-alert>
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

  { title: '用户名', key: 'username', width: 150, ellipsis: { tooltip: true } },
  {
    title: '角色',
    key: 'role',
    width: 200,
    ellipsis: { tooltip: true },
    render: ({ role }) => {
      if (role) {
        return h(
          NTag,
          { type: 'success' },
          { default: () => role },
        )
      }

      return '暂无角色'
    },
  },
  // { title: '邮箱', key: 'email', width: 150, ellipsis: { tooltip: true } },
  {
    title: '创建时间',
    key: 'createDate',
    width: 180,
    render(row) {
      return h('span', formatDateTime(row.createTime * 1000))
    },
  },
  {
    title: '更新时间',
    key: 'updateTime',
    width: 180,
    render(row) {
      return h('span', row.updateTime === 0 ? '' : formatDateTime(row.updateTime * 1000))
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 120,
    render: row =>
      h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: row.status === 1,
          disabled: row.status === 2, // 当状态为禁用时禁用开关
          loading: !!row.enableLoading,
          onUpdateValue: () => handleEnable(row),
        },
        {
          checked: () => '启用',
          unchecked: () => '停用',
        },
      ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 300,
    align: 'right',
    fixed: 'right',
    hideInExcel: true,
    render(row) {
      return [
        withPermission(
          h(NButton, {
            size: 'small',
            type: 'primary',
            secondary: true,
          }, {
            default: () => '超管专属',
            icon: () => h('i', { class: 'i-carbon:user-role text-14' }),
          }),
          'SuperAdmin',
        ),
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
            default: () => '编辑用户',
            icon: () => h('i', { class: 'i-carbon:user-role text-14' }),
          },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            style: 'margin-left: 12px;',
            onClick: () => handleOpen({ action: 'reset', title: '修改密码', row, onOk: onSave }),
          },
          {
            default: () => '修改密码',
            icon: () => h('i', { class: 'i-radix-icons:reset text-14' }),
          },
        ),

        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            onClick: () => handleDelete(row.id),
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

async function handleEnable(row) {
  row.enableLoading = true
  try {
    await api.update({ id: row.id, status: !row.status })
    row.enableLoading = false
    $message.success('操作成功')
    $table.value?.handleSearch()
  }
  catch (error) {
    console.error(error)
    row.enableLoading = false
  }
}

// function handleOpenRolesSet(row) {
//   const roleIds = row.roles.map(item => item.id)
//   handleOpen({
//     action: 'setRole',
//     title: '分配角色',
//     row: { id: row.id, username: row.username, roleIds },
//     onOk: onSave,
//   })
// }

function handleEdit(item = {}) {
  handleOpen({
    action: 'edit',
    title: `编辑用户`,
    row: item,
    okText: '保存',
  })
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
