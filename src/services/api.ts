import axios from 'axios';

// 根据环境设置API基础URL
const BASE_URL = 'http://124.221.174.50:80';

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
  like: number; // 添加点赞数字段
  isLike: boolean; // 新增 isLike 字段，表示用户是否点赞
  prompt_id: number | null; // 新增 prompt_id 字段
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
    return await api.get('/api/v1/role/list');
  } catch (error) {
    console.error('获取角色列表失败:', error);
    throw error;
  }
};

// 点赞/取消点赞角色接口
export const likeRole = async (promptId: number): Promise<ApiResponse<null>> => {
  try {
    // 使用 api 实例，它会自动添加 Authorization header
    return await api.post('/api/v1/role/like', null, {
      params: {
        prompt_id: promptId,
      },
    });
  } catch (error) {
    console.error('点赞/取消点赞失败:', error);
    // 抛出错误，让调用方处理
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

// 定义下单接口的响应类型
interface CreateOrderResponse {
  code: string;
  info: string;
  data: string; // data 包含 HTML 表单
}

// 创建订单函数
export const createOrder = async (productId: number, token: string): Promise<CreateOrderResponse> => {
  const url = `http://124.221.174.50:80/api/v1/sale/create_order?productId=${encodeURIComponent(productId)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': token,
      // 'Content-Type': 'application/x-www-form-urlencoded' // 通常 POST 请求需要设置 Content-Type，但这里参数在 URL 中，所以可能不需要，或者根据后端实际要求调整
    },
    // body: `productId=${encodeURIComponent(productId)}` // 如果参数需要在 body 中，则使用此行
  });

  if (!response.ok) {
    // 尝试解析错误响应体
    let errorInfo = '网络错误或服务器无法响应';
    try {
      const errorData = await response.json();
      errorInfo = errorData.info || errorInfo;
    } catch (e) {
      // 解析失败，使用通用错误信息
    }
    throw new Error(`HTTP error! status: ${response.status}, info: ${errorInfo}`);
  }

  return response.json();
};

// 上报角色访问统计
export const reportVisit = async (promptId: number): Promise<ApiResponse<null>> => {
  try {
    // 使用 api 实例，它会自动添加 Authorization header
    return await api.post('/api/v1/role/prompt/count', null, {
      params: {
        prompt_id: promptId,
      },
    });
  } catch (error) {
    console.error('上报访问统计失败:', error);
    // 这里选择不抛出错误，允许主流程继续，例如导航
    // 如果需要更强的错误处理，可以取消注释下一行
    // throw error;
    // 返回一个符合格式的错误响应结构，避免调用处因 undefined 出错
    return {
      code: 'NETWORK_ERROR', // 自定义错误码
      info: '上报访问统计失败，网络错误或服务器异常',
      data: null
    };
  }
};

export default api;