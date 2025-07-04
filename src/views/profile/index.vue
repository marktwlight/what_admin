<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:30:11
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <AppPage show-footer>
    <n-card>
      <n-space align="center">
        <n-avatar round :size="100" :src="userInfo.avatar" />
        <div class="ml-20">
          <div class="flex items-center text-16">
            <span>用户名:</span>
            <span class="ml-12 opacity-80">{{ userInfo.username }}</span>
            <n-button class="ml-32" type="primary" text @click="pwdModalRef.open()">
              <i class="i-fe:edit mr-4" />
              修改密码
            </n-button>
          </div>
          <div class="mt-16 flex items-center">
            <n-button type="primary" ghost @click="avatarModalRef.open()">
              更改头像
            </n-button>
            <span class="ml-12 opacity-60">
              修改头像只支持在线链接，不提供上传图片功能，如有需要可自行对接！
            </span>
          </div>
        </div>
      </n-space>
    </n-card>

    <n-card class="mt-20" title="个人资料信息">
      <template #header-extra>
        <n-button type="primary" text @click="profileModalRef.open()">
          <i class="i-fe:edit mr-4" />
          修改资料
        </n-button>
      </template>

      <n-descriptions
        label-placement="left"
        :label-style="{ width: '200px', textAlign: 'center' }"
        :column="1"
        bordered
      >
        <n-descriptions-item label="昵称">
          {{ userInfo.nickname }}
        </n-descriptions-item>
        <n-descriptions-item label="性别">
          {{ genders.find((item) => item.value === userInfo?.gender)?.label ?? '未知' }}
        </n-descriptions-item>
        <n-descriptions-item label="电话">
          {{ userInfo?.phone }}
        </n-descriptions-item>
        <n-descriptions-item label="邮箱">
          {{ userInfo?.email }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <MeModal ref="avatarModalRef" width="420px" title="更改头像" @ok="handleProfileSave()">
      <n-input v-model:value="profileForm.avatar" placeholder="头像链接" />
    </MeModal>

    <MeModal ref="pwdModalRef" title="修改密码" width="420px" @ok="handlePwdSave()">
      <n-form
        ref="pwdFormRef"
        :model="pwdForm"
        label-placement="left"
        require-mark-placement="left"
      >
        <n-form-item label="原密码" path="oldPassword" :rule="required">
          <n-input v-model:value="pwdForm.oldPassword" type="password" placeholder="请输入原密码" show-password-on="mousedown" />
        </n-form-item>
        <n-form-item label="新密码" path="newPassword" :rule="required">
          <n-input v-model:value="pwdForm.newPassword" type="password" placeholder="请输入新密码" show-password-on="mousedown" />
        </n-form-item>
      </n-form>
    </MeModal>

    <MeModal ref="profileModalRef" title="修改资料" width="420px" @ok="handleProfileSave()">
      <n-form ref="profileFormRef" :model="profileForm" label-placement="left">
        <n-form-item label="昵称" path="nickname">
          <n-input v-model:value="profileForm.nickname" placeholder="请输入昵称" />
        </n-form-item>
        <n-form-item label="性别" path="gender">
          <n-select
            v-model:value="profileForm.gender"
            :options="genders"
            placeholder="请选择性别"
          />
        </n-form-item>
        <n-form-item label="号码" path="phone">
          <n-input v-model:value="profileForm.phone" placeholder="请输入号码" />
        </n-form-item>
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="profileForm.email" placeholder="请输入邮箱" />
        </n-form-item>
      </n-form>
    </MeModal>
  </AppPage>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { MeModal } from '@/components'
import { useForm, useModal } from '@/composables'
import { useUserStore } from '@/store'
import { getUserInfo } from '@/store/helper'
import api from './api'

const userStore = useUserStore()
const required = {
  required: true,
  message: '此为必填项',
  trigger: ['blur', 'change'],
}

const [pwdModalRef] = useModal()
const [pwdFormRef, pwdForm, pwdValidation] = useForm()

async function handlePwdSave() {
  await pwdValidation()
  await api.changePassword(pwdForm.value)
  $message.success('密码修改成功')
  refreshUserInfo()
}
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')))

const newAvatar = ref(userStore.avatar)
const [avatarModalRef] = useModal()
const genders = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
]

const [profileModalRef] = useModal()
const [profileFormRef, profileForm, profileValidation] = useForm({
  nickname: userInfo.value.nickname,
  gender: userInfo.value.gender,
  email: userInfo.value.email,
  phone: userInfo.value.phone,
  avatar: userInfo.value.avatar,
})
async function handleProfileSave() {
  await profileValidation()
  localStorage.setItem('userInfo', JSON.stringify(profileForm.value))
  await api.updateProfile(profileForm.value)
  $message.success('资料修改成功')
  refreshUserInfo()
}

async function refreshUserInfo() {
  userInfo.value = JSON.parse(localStorage.getItem('userInfo'))
}
</script>
