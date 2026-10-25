import request from '@/utils/request.js'

export const KnowledgeApi = {
  /**
   * 上传文件到知识库
   * @param file 上传的文件
   * @returns 
   */
  async uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return request.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
