<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:29:43
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage back>
    <template #title-suffix>
      <NTag class="ml-12" type="warning">
        {{ route.query.name }}
      </NTag>
    </template>
    <!-- <template #action>
      <div class="flex items-center">
        <NButton :disabled="!userIds.length" type="error" @click="handleBatchRemove()">
          <i v-if="userIds.length" class="i-material-symbols:delete-outline mr-4 text-18" />
          批量取消授权
        </NButton>
        <NButton
          class="ml-12"
          :disabled="!userIds.length"
          type="primary"
          @click="handleBatchAdd()"
        >
          <i v-if="userIds.length" class="i-line-md:confirm-circle mr-4 text-18" />
          批量授权
        </NButton>
      </div>
    </template> -->

    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1200"
      :columns="columns"
      :group-name="groupName"
      :get-data="api.readIp"
      @on-checked="onChecked"
    >
      <MeQueryItem label="代理类型" :label-width="100">
        <n-select
          v-model:value="queryItems.proxyType" clearable :options="proxyTypeList" label-field="proxyType"
          value-field="proxyType"
        />
      </MeQueryItem>

      <MeQueryItem label="分配" :label-width="50">
        <n-select v-model:value="queryItems.allocate" clearable :options="allocateList" />
      </MeQueryItem>

      <MeQueryItem label="状态" :label-width="50">
        <n-select
          v-model:value="queryItems.status"
          clearable
          :options="statusList"
        />
      </MeQueryItem>
    </MeCrud>
  </CommonPage>
</template>

<script setup>
import { NAvatar, NButton, NSwitch, NTag } from 'naive-ui'
import { h } from 'vue'
import { MeCrud, MeQueryItem } from '@/components'
import { formatDateTime } from '@/utils'
import api from './api'

defineOptions({ name: 'RoleUser' })
const route = useRoute()

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({ groupName: route.query.name })
const groupName = route.query.name
onMounted(() => {
  $table.value?.handleSearch()
})

const allocateList = [
  { label: '全部', value: 0 },
  { label: '未分配', value: 1 },
  { label: '已分配', value: 2 },
]
const statusList = [
  { label: '全部', value: 0 },
  { label: '正常', value: 1 },
  { label: '异常', value: 2 },
  { label: '未检测', value: 3 },
]
const proxyTypeList = ref([{ proxyType: 'socks5' }, { proxyType: 'http' }])

const columns = [
  { type: 'selection', fixed: 'left' },
  { title: 'ID', key: 'id', width: 20, ellipsis: { tooltip: true } },
  { title: '分组名称', key: 'groupName', width: 100, ellipsis: { tooltip: true } },
  { title: '代理信息', key: 'proxy', width: 150, ellipsis: { tooltip: true } },
  { title: '代理类型', key: 'proxyType', width: 150, ellipsis: { tooltip: true } },
  { title: '状态', key: 'status', width: 100, render: (row) => {
    const statusMap = new Map([
      [1, { text: '正常', color: 'success' }],
      [2, { text: '异常', color: 'warning' }],
      [3, { text: '未检测', color: 'primary' }],
    ])
    const statusConfig = statusMap.get(row.status)
    if (!statusConfig) {
      return h('span', `未知状态: ${row.status}`)
    }

    // 创建 NTag 组件
    return h(
      NTag,
      {
        type: statusConfig.color,
        size: 'small',
        round: true,
        bordered: false,
        style: { minWidth: '60px', textAlign: 'center' },
      },
      { default: () => statusConfig.text },
    )
  } },

  {
    title: '操作',
    key: 'actions',
    width: 100,
    align: 'right',
    fixed: 'right',
    hideInExcel: true,
    render(row) {
      return row.roles?.some(item => item.id === +route.params.roleId)
        ? h(
            NButton,
            {
              size: 'small',
              type: 'error',
              secondary: true,
              onClick: () => handleBatchRemove([row.id]),
            },
            {
              default: () => '取消授权',
              icon: () => h('i', { class: 'i-material-symbols:delete-outline text-14' }),
            },
          )
        : h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              secondary: true,
              onClick: () => handleBatchAdd([row.id]),
            },
            {
              default: () => '授权',
              icon: () => h('i', { class: 'i-line-md:confirm-circle text-14' }),
            },
          )
    },
  },
]

const userIds = ref([])
function onChecked(rowKeys) {
  userIds.value = rowKeys || []
}

function handleBatchAdd(ids = userIds.value) {
  const roleId = route.params.roleId
  if (!roleId)
    return $message.error('角色异常，请重新选择角色')
  if (!ids.length)
    return $message.error('请先选择用户')
  $dialog.confirm({
    content: `确认分配【${route.query.roleName}】？`,
    async confirm() {
      await api.addRoleUsers(roleId, { userIds: ids })
      $table.value?.handleSearch()
    },
  })
}
function handleBatchRemove(ids = userIds.value) {
  const roleId = route.params.roleId
  if (!roleId)
    return $message.error('角色异常，请重新选择角色')
  if (!ids.length)
    return $message.error('请先选择用户')
  $dialog.confirm({
    content: `确认取消分配【${route.query.roleName}】？`,
    async confirm() {
      await api.removeRoleUsers(roleId, { userIds: ids })
      $table.value?.handleSearch()
    },
  })
}
</script>
