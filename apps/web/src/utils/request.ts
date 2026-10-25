import axios from 'axios';

const request = axios.create({
  baseURL: '/api', // 会命中刚才配置的 Vite 代理
  timeout: 60000,  // 因为大模型生成慢，超时时间设长一点（60秒）
});

// 响应拦截器：把后端返回的 { code, msg, data } 剥壳
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 0) {
      alert(res.msg || '请求失败');
      return Promise.reject(new Error(res.msg));
    }
    return res.data; // 直接把 data 里的业务数据吐给组件用
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default request;