<template>
  <div class="admin-layout">
    <header class="header">
      <div class="brand">
        <img
          class="logo"
          :src="logoUrl"
          alt="NestOwl"
        />
        <span class="title">NestOwl 管理后台</span>
      </div>
      <router-link
        to="/chat"
        class="back-link"
      >
        ⬅️ 返回对话
      </router-link>
    </header>

    <main class="content">
      <a-card title="知识库文档管理">
        <p style="color: #666; margin-bottom: 20px">
          在这里上传 PDF、Word 等文件，系统会自动解析并存入向量数据库。
        </p>
        <div
          class="upload-area"
          @click="triggerFileInput"
        >
          <!-- 隐藏的原生 input -->
          <input
            type="file"
            ref="fileInput"
            accept=".pdf,.docx,.txt,.md"
            @change="handleFileChange"
            style="display: none"
          />

          <div class="upload-btn">
            <AButton
              type="primary"
              size="large"
              :loading="uploading"
            >
              {{ uploading ? '正在疯狂解析入库中...' : '点击选择文件上传' }}
            </AButton>
          </div>
        </div>

        <!-- 成功结果展示 -->
        <div
          v-if="uploadResult"
          class="result-box success"
        >
          <h3>✅ 解析成功！</h3>
          <p>
            文件名：
            <strong>{{ uploadResult.filename }}</strong>
          </p>
          <p>
            成功切分并存入向量库：
            <strong style="font-size: 24px; color: #10b981">
              {{ uploadResult.chunksCount }}
            </strong>
            个片段
          </p>
        </div>

        <!-- 错误结果展示 -->
        <div
          v-if="uploadError"
          class="result-box error"
        >
          ❌ 上传失败：{{ uploadError }}
        </div>
      </a-card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import logoUrl from '@/assets/NestOwl.svg'
import { KnowledgeApi } from '@/api/knowledge/index.js'

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadResult = ref<any>(null)
const uploadError = ref('')

const triggerFileInput = () => {
  if (uploading.value) return
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  uploadResult.value = null
  uploadError.value = ''

  try {
    const res: any = await KnowledgeApi.uploadFile(file)
    uploadResult.value = res
  } catch (err: any) {
    console.error('上传失败', err)
    uploadError.value =
      err.response?.data?.message || '文件解析失败，请检查格式'
  } finally {
    uploading.value = false
    target.value = ''
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  height: 40px;
  width: auto;
  display: block;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.admin-layout {
  min-height: 100vh;
  background: #f3f4f6;
}

.back-link {
  color: #10b981;
  text-decoration: none;
  font-weight: 500;
}
.content {
  padding: 40px 24px;
  display: flex;
  justify-content: center;
}

.content {
  padding: 40px 24px;
  display: flex;
  justify-content: center;
}

.upload-area {
  margin-top: 20px;
  padding: 40px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #fafafa;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}
.upload-area:hover {
  border-color: #10b981;
}

.result-box {
  margin-top: 24px;
  padding: 16px;
  border-radius: 8px;
}
.result-box.success {
  background: #ecfdf5;
  border: 1px solid #10b981;
  color: #065f46;
}
.result-box.error {
  background: #fef2f2;
  border: 1px solid #ef4444;
  color: #991b1b;
}
</style>
