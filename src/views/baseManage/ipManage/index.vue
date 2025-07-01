<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2024/04/01 15:52:40
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <template #action>
      <div class="flex items-center">
        <NButton type="primary" @click="handleAdd()">
          <i class="i-material-symbols:add mr-4 text-18" />
          新增分组
        </NButton>
        <NButton class="ml-12" type="success" @click="handleUpload()">
          IP上传
          <i class="i-material-symbols:add mr-4 text-18" />
        </NButton>
        <NButton :disabled="names.length === 0" class="ml-12" type="info" @click="handleCheck">
          批量检测
        </NButton>
      </div>
    </template>

    <MeCrud ref="$table" v-model:query-items="queryItems" :scroll-x="1200" :columns="columns" :get-data="api.read" @on-checked="onChecked">
      <MeQueryItem label="分组名称" :label-width="100">
        <n-input v-model:value="queryItems.name" type="text" placeholder="请输入分组名称" clearable />
      </MeQueryItem>
    </MeCrud>
    <MeModal ref="modalRef" width="520px">
      <n-form ref="modalFormRef" label-placement="left" label-align="left" :label-width="80" :model="modalForm">
        <n-form-item
          v-if="['add', 'edit'].includes(modalAction)" label="分组名称" path="name" :rule="{
            required: true,
            message: '请输入分组名称',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.name" :disabled="modalAction !== 'add'" />
        </n-form-item>

        <n-form-item
          v-if="['upload'].includes(modalAction)" label="分组名称" path="name" :rule="{
            required: true,
            message: '请选择分组',
            trigger: ['blur'],
          }"
        >
          <n-select
            v-model:value="modalForm.name" :options="allGroups" label-field="name" value-field="name" clearable
            filterable
          />
        </n-form-item>
        <n-form-item
          v-if="['upload'].includes(modalAction)" label="代理类型" path="proxyType" :rule="{
            required: true,
            message: '请选择代理类型',
            trigger: ['blur'],
          }"
        >
          <n-select
            v-model:value="modalForm.proxyType" :options="proxyTypeList"
            label-field="proxyType"
            value-field="proxyType"
            clearable filterable
          />
        </n-form-item>
        <n-form-item
          v-if="['upload'].includes(modalAction)" label="格式" path="format" :rule="{
            required: true,
            message: '请选择格式',
            trigger: ['blur'],
          }"
        >
          <n-select
            v-model:value="modalForm.format" :options="formatList" label-field="format" value-field="format"
            clearable filterable
          />
        </n-form-item>
        <n-form-item
          v-if="['upload'].includes(modalAction)" label="txt文本" path="file" :rule="{
            required: true,
            message: '请上传文件',
            trigger: ['change'],
            validator: validateFile,
          }"
        >
          <n-upload :show-file-list="true" :custom-request="customUploadRequest" accept=".txt" :max="1">
            <NButton>上传文件</NButton>
          </n-upload>
        </n-form-item>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NButton, NSwitch, NTag } from 'naive-ui'
import { MeCrud, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'
import { formatDateTime } from '@/utils'
import api from './api'

defineOptions({ name: 'IpMgt' })

const router = useRouter()
const proxyTypeList = ref([{ proxyType: 'socks5' }, { proxyType: 'http' }])
const formatList = ref([{ format: 'user:password:host:port' }, { format: 'host:port:user:password' }, { format: 'user:password@host:port' }])
const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})
const allGroups = ref([])
async function getAllGroup() {
  const res = await api.getAllGroup()
  allGroups.value = res
}
onMounted(() => {
  $table.value?.handleSearch()

  getAllGroup()
})

const { modalRef, modalFormRef, modalAction, modalForm, handleAdd, handleDelete, handleEdit, handleUpload }
    = useCrud({
      name: '分组',
      doCreate: api.create,
      doDelete: api.delete,
      doUpdate: api.update,
      doUpload: api.upload,
      refresh: (_, keepCurrentPage) => $table.value?.handleSearch(keepCurrentPage),
    })

const columns = [
  { type: 'selection', fixed: 'left' },
  { title: '分组名称', width: 100, key: 'name' },
  { title: '有效数量', width: 180, key: 'totalNum' },
  { title: '总数量', width: 180, key: 'validNum' },
  { title: '无效数量', width: 180, key: 'invalidNum' },
  { title: '未检测数量', width: 180, key: 'uncheckNum' },
  { title: '已分配数量', width: 180, key: 'allocateNum' },
  {
    title: '上次检测时间',
    key: 'latestCheckTime',
    width: 180,
    render(row) {
      return h('span', row.latestCheckTime === 0 ? '' : formatDateTime(row.latestCheckTime * 1000))
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
  { title: '状态', key: 'status', width: 100, render: (row) => {
    const statusMap = new Map([
      [1, { text: '未检测', color: 'default' }],
      [2, { text: '队列中', color: 'warning' }],
      [3, { text: '检测中', color: 'primary' }],
      [4, { text: '已检测', color: 'success' }],
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
    width: 320,
    align: 'right',
    fixed: 'right',
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () =>
              router.push({ path: `/baseManage/ipManage/ip/${row.name}`, query: { name: row.name } }),
          },
          {
            default: () => '查看IP',
          },
        ),
        // h(
        //   NButton,
        //   {
        //     size: 'small',
        //     type: 'primary',
        //     style: 'margin-left: 12px;',
        //     disabled: row.code === 'SUPER_ADMIN',
        //     onClick: () => handleEdit(row),
        //   },
        //   {
        //     default: () => '编辑',
        //     icon: () => h('i', { class: 'i-material-symbols:edit-outline text-14' }),
        //   },
        // ),

        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            disabled: row.code === 'SUPER_ADMIN',
            onClick: () => handleDelete({ name: row.name }),
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

function validateFile(rule, value, callback) {
  if (!value || value.length === 0) {
    callback(new Error('请上传必要文件'))
  }
  else {
    callback()
  }
}

function customUploadRequest({ file }) {
  modalForm.value.file = file.file
}
const names = ref([])
function onChecked(rowKeys) {
  names.value = rowKeys || []
}

async function handleCheck() {
  const d = $dialog.warning({
    content: '确定开始检测？',
    title: '提示',
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        d.loading = true
        const data = await api.groupCheck({ names: names.value })
        $message.success('检测已开始，请稍候')
        d.loading = false
        $table.value?.handleSearch()
      }
      catch (error) {
        console.error(error)
        d.loading = false
      }
    },
  })
}
</script>
