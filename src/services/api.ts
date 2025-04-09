import axios from 'axios';

// 根据环境设置API基础URL
const isDev = process.env.NODE_ENV === 'development';
const BASE_URL = isDev ? 'http://127.0.0.1:8080' : 'http://124.221.174.50:80';

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 如果响应成功，直接返回数据
    return response.data;
  },
  (error) => {
    // 处理错误
    console.error('API错误:', error);
    return Promise.reject(error);
  }
);

// 角色列表接口返回数据类型
export interface RolePrompt {
  name: string;
  content: string;
}

export interface RoleMmu {
  id: number;
  role_name: string;
  description: string;
  avatar: string;
}

export interface RoleItemResponse {
  mmu: RoleMmu;
  prompt: RolePrompt;
}

export interface RoleListResponse {
  code: string;
  info: string;
  data: RoleItemResponse[];
}

// 获取角色列表
export const fetchRoleList = async (): Promise<RoleListResponse> => {
  try {
    return await api.get('/api/v1/gpt/mng/mmu/list');
  } catch (error) {
    console.error('获取角色列表失败:', error);
    throw error;
  }
};

export default api; 