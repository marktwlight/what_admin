<template>
  <CommonPage>
    <template #action>
      <NButton type="primary">
        <i class="i-material-symbols:add mr-4 text-18" />
        添加
      </NButton>
    </template>

    <div class="flex" :style="{ height: '100%' }">
      <div class="group-countainer w-240 shrink-0">
        <div class="group-header">
          <n-input size="small" style="width: 158px;" placeholder="请输入分组名称" />
          <n-tooltip trigger="hover">
            <template #trigger>
              <div class="ml-4 flex cursor-pointer items-center justify-center" @click="handleAdd()">
                <i class="i-material-symbols:add text-18" />
              </div>
            </template>
            添加分组
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <i class="i-tabler:arrows-down-up text-18" />
            </template>
            分组排序
          </n-tooltip>
        </div>
        <div class="group-list">
          <div v-for="(item, i) in tableData" :key="item" class="group-item">
            <div class="flex gap-10">
              <div class="flex cursor-pointer items-center justify-center">
                <i class="i-material-symbols:folder-outline text-18" />
              </div>
              <div>
                {{ item.name }}
              </div>
            </div>

            <div class="flex">
              <div>({{ item.totalNum }})</div>
              <div class="ml-4 flex cursor-pointer items-center justify-center" @click="handleDelete({ name: item.name })">
                <i class="i-ion:trash-outline text-18" />
              </div>
              <div class="ml-4 flex cursor-pointer items-center justify-center" @click="handleEdit(item)">
                <i class="i-material-symbols:edit text-18" />
              </div>
            </div>
          </div>
        </div>
        <div class="group-footer">
          <n-pagination v-model:page="pagination.page" :page-size="pagination.pageSize" simple />
        </div>
      </div>
      <div class="table-container flex-1" >
        <MeCrud></MeCrud>
      </div>
    </div>
    <MeModal ref="modalRef" width="520px">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
      >
        <n-form-item
          label="分组名称"
          path="name"

          :rule="{
            required: true,
            message: '请输入分组名称',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.name" />
        </n-form-item>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script lang="js" setup>
// import { GameControllerOutline } from '@vicons/ionicons5'
import { onMounted, reactive, ref } from 'vue'
import { MeCrud, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'
import api from './api'

const { modalRef, modalFormRef, modalAction, modalForm, handleAdd, handleDelete, handleEdit }
  = useCrud({
    name: '分组',
    doCreate: api.create,
    doDelete: api.delete,
    doUpdate: api.update,
    initForm: {},
  })
const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
})
const pageCount = ref(0)
async function getData(query) {
  const { data, totalCount } = await api.read({ ...query, pageNo: pagination.page, pageSize: pagination.pageSize })

  tableData.value = data
  pageCount.value = totalCount
}
onMounted(() => {
  getData()
})
</script>

<style>
.group-countainer {
  position: relative;
  border: 1px solid #f1f1f1;
}
.group-header {
  background-color: #f5f7fa;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.group-list {
}
.group-item {
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.group-item:hover {
  background-color: #f8f8f8;
}
.group-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background-color: #fff;
  display: flex;
  justify-content: center;
  width: 100%;
}
.table-container {
  border: 1px solid #f1f1f1;
}
</style>
