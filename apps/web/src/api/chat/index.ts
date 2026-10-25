import request from '@/utils/request'
import { fetchEventSource } from '@microsoft/fetch-event-source'

export interface ChatResponse {
  question: string
  answer: string
}

export const ChatApi = {
  /**
   * 同步对话接口
   */
  async ask(question: string): Promise<ChatResponse> {
    return request.post('/chat', { question })
  },

  streamChat(
    question: string,
    onMessage: (text: string) => void,
    onDone: () => void,
    onError: (err: any) => void,
  ) {
    fetchEventSource('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      onmessage(msg) {
        if (msg.data === '[DONE]') {
          onDone()
          return
        }
        onMessage(msg.data)
      },
      onerror(err) {
        onError(err)
        throw err
      },
    })
  },
}
