import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义消息的数据结构
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const useChatStore = defineStore('chat', () => {
  //1、状态：聊天记录列表
  const messages = ref<ChatMessage[]>([])

  //2、状态：是否正在加载(大模型思考中)
  const loading = ref(false)

  //3、动作：添加一条消息
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    messages.value.push({ role, content })
    console.log('添加消息', messages.value)
  }

  //4、动作：清空聊天记录
  const clearMessages = () => {
    messages.value = []
  }

  return {
    messages,
    loading,
    addMessage,
    clearMessages,
  }
})
