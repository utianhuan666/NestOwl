<template>
  <div class="chat-layout">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="brand">
        <img
          class="logo"
          :src="logoUrl"
          alt="NestOwl"
        />
        <span class="title">NestOwl 对话端</span>
      </div>
      <div class="actions">
        <AButton
          type="primary"
          size="small"
          @click="chatStore.clearMessages"
          style="margin-right: 12px"
        >
          清空对话
        </AButton>
        <router-link
          to="/admin"
          class="admin-link"
        >
          去管理后台
        </router-link>
      </div>
    </header>

    <!-- 聊天区内容 -->
    <main class="chat-main">
      <div
        v-if="chatStore.messages.length === 0"
        class="empty-state"
      >
        <h2>您好，我是 NestOwl 智能助手</h2>
        <p>你可以问我关于知识库里的任何问题</p>
      </div>

      <!-- 循环渲染聊天记录 -->
      <div
        v-for="(msg, index) in chatStore.messages"
        :key="index"
        :class="['message-row', msg.role]"
      >
        <AxBubble :content="msg.content" />
      </div>

      <!-- 加载状态 -->
      <div
        v-if="chatStore.loading"
        class="message-row assistant"
      >
        <AxBubble
          content="正在检索知识库并思考..."
          :typing="{ step: 2, interval: 50 }"
        />
      </div>
    </main>

    <!-- 底部输入区 -->
    <footer class="input-area">
      <!-- 监听 submit 事件 -->
      <AxSender
        :loading="chatStore.loading"
        @submit="onSubmit"
        placeholder="请输入你的问题，按回车发送..."
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { ChatApi } from '@/api/chat'
import logoUrl from '@/assets/NestOwl.svg'

const chatStore = useChatStore()
const onSubmit = async (value: string) => {
  if (!value.trim() || chatStore.loading) return
  //1、用户消息上屏
  chatStore.addMessage('user', value)
  chatStore.loading = true

  chatStore.addMessage('assistant', '')
  const aiIndex = chatStore.messages.length - 1

  ChatApi.streamChat(
    value,
    (text) => {
      chatStore.messages[aiIndex].content += text
    },
    () => {
      chatStore.loading = false
    },
    (err) => {
      console.log('请求失败', err)
      chatStore.addMessage('assistant', '抱歉，我的大脑短路了。')
      chatStore.loading = false
    },
  )
}
</script>

<style scoped>
.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9fafb;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  font-size: 20px;
  font-weight: bold;
}
.admin-link {
  color: #10b981;
  text-decoration: none;
  font-weight: 500;
}
.chat-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.empty-state {
  text-align: center;
  color: #6b7280;
  margin-top: 100px;
}
.message-row {
  display: flex;
  width: 100%;
}
.message-row.user {
  justify-content: flex-end; /* 用户消息靠右 */
}
.message-row.assistant {
  justify-content: flex-start; /* AI 消息靠左 */
}
.input-area {
  padding: 20px 24px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}
</style>
