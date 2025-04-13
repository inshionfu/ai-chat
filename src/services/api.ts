import axios from 'axios';

// 根据环境设置API基础URL
const BASE_URL = 'http://124.221.174.50:8080';

// 创建登录专用的axios实例
const loginApi = axios.create({
  baseURL: 'http://124.221.174.50:80',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 创建通用axios实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 创建用户相关接口的axios实例
const userApi = axios.create({
  baseURL: 'http://124.221.174.50:80',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 处理错误响应
      const { status } = error.response;
      if (status === 401) {
        // token过期或无效，清除本地存储并重定向到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 用户API请求拦截器
userApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 用户API响应拦截器
userApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      }
    }
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

// 接口类型定义
export interface ApiResponse<T = any> {
  code: string;
  info: string;
  data: T;
}

// 登录接口
export const login = async (code: string): Promise<ApiResponse<string>> => {
  try {
    const response = await loginApi.post('/api/v1/auth/login', null, {
      params: { code }
    });
    return response.data;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

export interface UserProfile {
  user_name: string;
  avatar: string;
  quota: number;
}

// 获取用户信息（包含余额）
export const fetchUserProfile = async (): Promise<ApiResponse<UserProfile>> => {
  try {
    return await userApi.get('/api/v1/user/profile');
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

// 商品列表接口返回数据类型
export interface Product {
  productId: number;
  productName: string;
  pic: string | null;
  productDesc: string;
  quota: number;
  price: number;
}

export interface ProductListResponse {
  code: string;
  info: string;
  data: Product[];
}

// 获取商品列表
export const fetchProductList = async (): Promise<ProductListResponse> => {
  try {
    return await userApi.get('/api/v1/sale/product_list');
  } catch (error) {
    console.error('获取商品列表失败:', error);
    throw error;
  }
};

export default api; 