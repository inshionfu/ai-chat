import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Input, Button, message, Spin, Empty, Modal } from 'antd';
import { SearchOutlined, PlusOutlined, ArrowRightOutlined, UserOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createNewChat, createNewRoleChat } from './Chat';
import { fetchRoleList, RoleItemResponse, likeRole, reportVisit } from '../services/api'; // 导入 reportVisit
import { useUser } from '../contexts/UserContext'; // 导入 useUser hook

// 全局样式
const GlobalStyle = createGlobalStyle`
  .scrollable {
    position: relative;
    
    /* 滚动条样式 */
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  }
`;

// 角色类型定义 - 使用服务器响应类型
interface RoleItem {
  id: number;
  name: string;
  avatar: string;
  description: string;
  promptContent: string;
  promptId: number | null; // 新增 prompt_id
  isLike: boolean; // 新增 isLike 字段
  type: 'java' | 'psychology' | 'default';
  likes?: number;
}

// 定义 ChatItem 接口（如果 Chat.tsx 中没有导出的话）
// 这个结构需要与 Chat.tsx 中的保持一致
interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

interface ChatItem {
  id: number;
  name: string;
  avatar: string;
  description: string;
  avatarUrl: string; // 确认是否有这个字段
  type: 'psychological' | 'normal' | 'interview';
  messages: Message[];
  timestamp: number;
}

// 样式组件
const RolesContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
`;

const RoleListPanel = styled.div`
  width: 280px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SearchContainer = styled.div`
  display: flex;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
`;

const SearchInput = styled(Input)`
  border-radius: 4px;
  margin-right: 10px;
`;

const AddButton = styled(Button)`
  background-color: #00C781;
  border: none;
  
  &:hover {
    background-color: #00A36A;
  }
`;

const RoleListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const RoleItemContainer = styled.div`
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const RoleAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  margin-right: 15px;
  background-color: #f0f0f0;
  overflow: hidden;
  position: relative;
`;

const RoleAvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RoleAvatarFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  background-color: #f0f0f0;
`;

const RoleName = styled.div`
  font-weight: 500;
  margin-top: 10px;
`;

const RoleContentPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fafafa;
`;

const RoleHeader = styled.div`
  padding: 16px;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 1px solid #f0f0f0;
  background-color: white;
`;

const RoleDetailContainer = styled.div`
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
`;

const RoleDetailCard = styled.div`
  width: 100%;
  max-width: 800px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 150px);
`;

const RoleDetailHeader = styled.div`
  padding: 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
`;

const RoleLargeAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 60px;
  margin-right: 24px;
  background-color: #f5f5f5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  border: 1px solid #f0f0f0;
`;

const RoleLargeAvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const RoleLargeAvatarFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 60px;
  background-color: #f5f5f5;
  color: #999;
`;

const RoleInfo = styled.div`
  flex: 1;
`;

const RoleTitle = styled.div`
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const RoleDetailContent = styled.div`
  padding: 24px;
  padding-bottom: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const RoleDescriptionTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
`;

const RoleDescription = styled.div`
  color: #666;
  line-height: 1.8;
  white-space: pre-wrap;
  font-size: 15px;
  overflow-y: auto;
  max-height: 300px;
  padding-right: 8px;
  padding-bottom: 16px;
  flex: 1;
  margin-bottom: 0;
  &:after {
    content: '';
    display: block;
    height: 12px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px 0;
  position: sticky;
  bottom: 0;
  background-color: white;
  flex-shrink: 0;
  z-index: 1;
  box-shadow: 0 -4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-top: 8px;
  border-top: 1px solid #f5f5f5;
`;

const StartChatButton = styled(Button)`
  background-color: #08b96d;
  border: none;
  height: 48px;
  font-size: 16px;
  width: 200px;
  
  &:hover {
    background-color: #09a060;
  }
`;

const LikeButton = styled.div<{ isLiked: boolean }>`
  position: absolute;
  top: 12px;
  right: 15px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.isLiked ? '#ff4d4f' : '#999'};
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => props.isLiked ? 'rgba(255, 77, 79, 0.1)' : 'transparent'};
  transition: all 0.3s ease;

  .anticon {
    font-size: 16px;
    transition: all 0.3s ease;
  }

  &:hover {
    background: rgba(255, 77, 79, 0.1);
    color: #ff4d4f;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// 角色列表主组件
const Roles: React.FC = () => {
  const { avatarUrl } = useUser(); // 获取用户头像URL
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredRoles, setFilteredRoles] = useState<RoleItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedRoles, setLikedRoles] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  // 处理点赞
  const handleLike = async (e: React.MouseEvent, roleId: number) => {
    e.stopPropagation(); // 阻止事件冒泡

    const roleToLike = roles.find(role => role.id === roleId);
    if (!roleToLike || roleToLike.promptId === null) {
      message.error('无法点赞：缺少 promptId');
      return;
    }

    const promptId = roleToLike.promptId;
    const isCurrentlyLiked = likedRoles.has(roleId);

    // 优化：先更新UI，如果API调用失败再回滚
    const originalLikedRoles = new Set(likedRoles);
    const originalRoles = [...roles];
    const originalFilteredRoles = [...filteredRoles];

    // 更新本地状态
    setLikedRoles(prev => {
      const newLiked = new Set(prev);
      if (isCurrentlyLiked) {
        newLiked.delete(roleId);
      } else {
        newLiked.add(roleId);
      }
      return newLiked;
    });

    const updateLikesOptimistic = (rolesList: RoleItem[]) =>
      rolesList.map(role => {
        if (role.id === roleId) {
          const currentLikes = role.likes || 0;
          return {
            ...role,
            likes: !isCurrentlyLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1)
          };
        }
        return role;
      });

    setRoles(updateLikesOptimistic(roles));
    setFilteredRoles(updateLikesOptimistic(filteredRoles));

    try {
      const response = await likeRole(promptId);
      if (response.code !== '0000') {
        // API 调用失败，回滚状态
        message.error(`操作失败: ${response.info}`);
        setLikedRoles(originalLikedRoles);
        setRoles(originalRoles);
        setFilteredRoles(originalFilteredRoles);
      } else {
        // API 调用成功，无需额外操作，因为UI已更新
        message.success(isCurrentlyLiked ? '取消点赞成功' : '点赞成功');
      }
    } catch (error) {
      console.error('点赞/取消点赞请求失败:', error);
      message.error('网络错误，请稍后重试');
      // API 调用失败，回滚状态
      setLikedRoles(originalLikedRoles);
      setRoles(originalRoles);
      setFilteredRoles(originalFilteredRoles);
    }
  };

  // 从API获取角色列表
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoading(true);
        const response = await fetchRoleList();
        
        if (response.code === '0000') {
          // 成功获取数据
          const formattedRoles = response.data.map(item => {
            // 确定角色类型
            let type: 'java' | 'psychology' | 'default' = 'default';
            if (item.mmu.role_name.includes('Java') || item.mmu.role_name.includes('面试官')) {
              type = 'java';
            } else if (item.mmu.role_name.includes('心理')) {
              type = 'psychology';
            }
            
            // 处理头像
            const avatar = item.mmu.avatar ? item.mmu.avatar : '👤';

            return {
              id: item.mmu.id,
              name: item.mmu.role_name,
              avatar,
              description: item.mmu.description,
              promptContent: item.prompt.content,
              promptId: item.prompt.prompt_id, // 获取 prompt_id
              isLike: item.prompt.isLike, // 获取 isLike
              type,
              likes: item.prompt.like // 使用服务器返回的点赞数
            };
          });

          setRoles(formattedRoles);
          setFilteredRoles(formattedRoles);
          // 如果有角色，默认选中第一个
          if (formattedRoles.length > 0) {
            setSelectedRole(formattedRoles[0]);
            // 根据 isLike 初始化 likedRoles 状态
            const initialLikedRoles = new Set<number>();
            formattedRoles.forEach(role => {
              if (role.isLike && role.promptId) {
                initialLikedRoles.add(role.id); // 使用 role.id 作为 key
              }
            });
            setLikedRoles(initialLikedRoles);
          }
        } else {
          // API返回错误
          setError(`获取角色列表失败: ${response.info}`);
          message.error(`获取角色列表失败: ${response.info}`);
        }
      } catch (err) {
        console.error('获取角色列表出错:', err);
        setError('获取角色列表出错，请稍后重试');
        message.error('获取角色列表出错，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  // 当搜索文本变化时，过滤角色列表
  useEffect(() => {
    if (!searchText) {
      setFilteredRoles(roles);
    } else {
      const filtered = roles.filter(role =>
        role.name.toLowerCase().includes(searchText.toLowerCase()) ||
        role.description.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredRoles(filtered);
    }
  }, [searchText, roles]);

  // 处理添加新角色
  const handleAddRole = () => {
    message.info('创建新角色功能即将上线');
  };
  
  // 将默认头像处理为图标或表情
  const renderAvatar = (avatar: string) => {
    if (avatar.startsWith('http')) {
      // 是一个完整的URL链接
      return (
        <img 
          src={avatar}
          alt="角色头像" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            const nextElement = img.nextElementSibling as HTMLElement;
            if (nextElement) {
              nextElement.style.display = 'flex';
            }
          }}
        />
      );
    } else if (avatar.startsWith('/')) {
      // 是一个相对路径
      return (
        <img 
          src={`${process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8080' : 'http://124.221.174.50:80'}${avatar}`} 
          alt="角色头像" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            const nextElement = img.nextElementSibling as HTMLElement;
            if (nextElement) {
              nextElement.style.display = 'flex';
            }
          }}
        />
      );
    } else {
      // 默认使用表情符号或图标
      return avatar || '👤';
    }
  };

  return (
    <RolesContainer>
      <GlobalStyle />
      <RoleListPanel>
        <SearchContainer>
          <SearchInput 
            placeholder="搜索" 
            prefix={<SearchOutlined />} 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <AddButton type="primary" icon={<PlusOutlined />} onClick={handleAddRole} />
        </SearchContainer>
        <RoleListContainer>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Spin tip="加载角色列表中..." />
            </div>
          ) : error ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#ff4d4f' }}>
              {error}
            </div>
          ) : filteredRoles.length === 0 ? (
            <Empty 
              description="没有找到匹配的角色" 
              style={{ padding: '40px 0' }}
            />
          ) : (
            filteredRoles.map(role => (
              <RoleItemContainer 
                key={role.id} 
                onClick={() => setSelectedRole(role)}
                style={{ backgroundColor: selectedRole?.id === role.id ? '#f0f0f0' : 'transparent' }}
              >
                <RoleAvatar>
                  {role.avatar ? (
                    <>
                      <RoleAvatarImg
                        src={role.avatar.startsWith('http') ? role.avatar : `${process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8080' : 'http://124.221.174.50:80'}${role.avatar}`}
                        alt={role.name}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const fallback = img.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                      <RoleAvatarFallback style={{ display: 'none' }}>
                        <UserOutlined />
                      </RoleAvatarFallback>
                    </>
                  ) : (
                    <RoleAvatarFallback>
                      <UserOutlined />
                    </RoleAvatarFallback>
                  )}
                </RoleAvatar>
                <RoleName>{role.name}</RoleName>
                <LikeButton 
                  isLiked={likedRoles.has(role.id)}
                  onClick={(e) => handleLike(e, role.id)}
                >
                  {likedRoles.has(role.id) ? <HeartFilled /> : <HeartOutlined />}
                  <span>{role.likes || 0}</span>
                </LikeButton>
              </RoleItemContainer>
            ))
          )}
        </RoleListContainer>
      </RoleListPanel>
      {selectedRole ? (
        <RoleDetail role={selectedRole} />
      ) : (
        <RoleContentPanel style={{ justifyContent: 'center', alignItems: 'center' }}>
          {loading ? (
            <Spin tip="加载中..." />
          ) : (
            <div>请选择一个角色或创建新的角色</div>
          )}
        </RoleContentPanel>
      )}
    </RolesContainer>
  );
};

// 角色详情组件
const RoleDetail: React.FC<{ role: RoleItem }> = ({ role }) => {
  const navigate = useNavigate();
  const [descriptionRef, setDescriptionRef] = useState<HTMLDivElement | null>(null);
  const [isLongDescription, setIsLongDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 添加加载状态

  // 根据描述文本长度动态计算描述区域的样式
  const getDescriptionStyle = () => {
    if (role.description.length > 800) {
      return { maxHeight: '45vh' }; // 非常长的描述
    } else if (role.description.length > 500) {
      return { maxHeight: '40vh' }; // 很长的描述
    } else if (role.description.length > 300) {
      return { maxHeight: '30vh' }; // 中等长度的描述
    }
    return {}; // 默认不添加额外样式
  };

  // 确保滚动条滚到底部时，文本完全可见
  useEffect(() => {
    if (descriptionRef) {
      // 检查内容高度是否超过容器高度
      const isOverflowing = descriptionRef.scrollHeight > descriptionRef.clientHeight;
      setIsLongDescription(isOverflowing);

      // 如果内容过长，添加滚动事件监听
      if (isOverflowing) {
        const handleScroll = () => {
          const { scrollTop, scrollHeight, clientHeight } = descriptionRef;
          // 避免除以零
          if (scrollHeight === clientHeight) return;

          const scrollRatio = scrollTop / (scrollHeight - clientHeight);
          
          // 动态调整 paddingBottom 以改善滚动体验
          if (scrollRatio > 0.95) {
            descriptionRef.style.paddingBottom = '28px';
          } else if (scrollRatio > 0.7) {
            descriptionRef.style.paddingBottom = '24px';
          } else {
            descriptionRef.style.paddingBottom = '16px';
          }
        };
        
        // 立即执行一次并添加监听器
        handleScroll();
        descriptionRef.addEventListener('scroll', handleScroll);
        return () => {
          descriptionRef?.removeEventListener('scroll', handleScroll);
        };
      }
    }
  }, [descriptionRef, role.description]); // 依赖项应为 descriptionRef 和 role.description

  // 将 handleStartChat 修改为 async 函数，以便处理异步上报
  const handleStartChat = () => {
    const { id, name, avatar, type, description, promptContent, promptId } = role;

    // 检查 promptContent 是否存在
    if (!promptContent) {
      message.error('角色配置错误，缺少必要的 prompt 内容');
      return;
    }

    // 检查 promptId 是否存在
    if (promptId === null || promptId === undefined) {
      message.error('角色配置错误，缺少 promptId');
      // 即使缺少 promptId，仍然允许用户开始对话，但不进行上报
      // return;
    }

    // --- 访问统计上报逻辑 开始 ---
    if (promptId !== null && promptId !== undefined) {
      const visitedPromptsKey = 'visitedPrompts';
      try {
        const visitedRaw = localStorage.getItem(visitedPromptsKey);
        let visitedSet = new Set<number>();
        if (visitedRaw) {
          try {
            const parsedArray = JSON.parse(visitedRaw);
            if (Array.isArray(parsedArray)) {
              visitedSet = new Set(parsedArray);
            } else {
              console.warn('本地存储的 visitedPrompts 格式错误，已重置。');
              localStorage.removeItem(visitedPromptsKey); // 清除错误格式的数据
            }
          } catch (parseError) {
            console.error('解析本地存储 visitedPrompts 失败:', parseError);
            localStorage.removeItem(visitedPromptsKey); // 清除损坏的数据
          }
        }

        if (!visitedSet.has(promptId)) {
          // promptId 不在集合中，需要上报
          console.log(`上报访问: promptId=${promptId}`);
          reportVisit(promptId)
            .then(response => {
              if (response && response.code === '0000') {
                console.log('访问统计上报成功');
                // 上报成功后，将 promptId 加入集合并更新 localStorage
                visitedSet.add(promptId);
                localStorage.setItem(visitedPromptsKey, JSON.stringify(Array.from(visitedSet)));
              } else {
                // 上报失败或非预期响应，打印日志
                console.warn('访问统计上报失败或响应异常:', response?.info || '未知错误');
                // 失败时不清缓存，下次可以重试
              }
            })
            .catch(error => {
              // 网络错误等，已经在 reportVisit 函数内部处理并打印日志
              console.error('调用 reportVisit 时发生网络错误:', error);
              // 失败时不清缓存，下次可以重试
            });
          // 注意：这里不 await reportVisit，让上报在后台进行，不阻塞导航
        } else {
          console.log(`promptId=${promptId} 已访问过，无需上报`);
        }
      } catch (storageError) {
        console.error('访问本地存储失败:', storageError);
        // 即使本地存储失败，也允许继续，只是不上报统计
      }
    }
    // --- 访问统计上报逻辑 结束 ---

    // 准备传递给 Chat 页面的数据
    const newChatBase = {
      name,
      avatar,
      description,
      avatarUrl: avatar, // 使用 role 的 avatar 作为 avatarUrl
      // messages: [], // 初始消息由 Chat.tsx 处理
      // id 和 timestamp 将在 Chat.tsx 中生成
    };

    console.log('Navigating to /chat with state:', { newChatBase, initialPromptContent: promptContent });

    // 导航到聊天页面，并传递新对话的基础数据和初始 prompt
    navigate('/chat', {
      state: {
        newChatBase: newChatBase,
        initialPromptContent: promptContent,
        // timestamp: Date.now() // 可选，如果 Chat.tsx 需要区分状态更新
      },
      replace: true // 使用 replace 避免用户回退到 Roles 页时再次触发
    });
  };

  return (
    <RoleContentPanel>
      <RoleHeader>{role.name}</RoleHeader>
      <RoleDetailContainer>
        <RoleDetailCard>
          <RoleDetailHeader>
            <RoleLargeAvatar>
              {role.avatar ? (
                <>
                  <RoleLargeAvatarImg
                    src={role.avatar.startsWith('http') ? role.avatar : `${process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8080' : 'http://124.221.174.50:80'}${role.avatar}`}
                    alt={role.name}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const fallback = img.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <RoleLargeAvatarFallback style={{ display: 'none' }}>
                    <UserOutlined />
                  </RoleLargeAvatarFallback>
                </>
              ) : (
                <RoleLargeAvatarFallback>
                  <UserOutlined />
                </RoleLargeAvatarFallback>
              )}
            </RoleLargeAvatar>
            <RoleInfo>
              <RoleTitle>{role.name}</RoleTitle>
              <div>点击每个角色，右侧展示对应的详细信息，以及开始对话按钮。</div>
            </RoleInfo>
          </RoleDetailHeader>
          <RoleDetailContent>
            <RoleDescriptionTitle>角色介绍：</RoleDescriptionTitle>
            <RoleDescription 
              ref={setDescriptionRef}
              style={getDescriptionStyle()}
              className={isLongDescription ? "scrollable" : ""}
            >
              {role.description}
            </RoleDescription>
            <ButtonContainer>
              <StartChatButton 
                type="primary" 
                onClick={handleStartChat}
                icon={<ArrowRightOutlined />}
                loading={isLoading} // 添加 loading 状态
              >
                开始对话
              </StartChatButton>
            </ButtonContainer>
          </RoleDetailContent>
        </RoleDetailCard>
      </RoleDetailContainer>
    </RoleContentPanel>
  );
};

// 由于 createNewRoleChat 未导出，在 Roles.tsx 中重新实现或调整
// 假设 createNewRoleChat 的目的是创建一个初始的 ChatItem 结构
// createInitialChatStructure 函数不再需要，基础结构在 handleStartChat 中直接创建

export default Roles;
