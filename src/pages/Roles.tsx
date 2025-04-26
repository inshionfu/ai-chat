import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Input, Button, message, Spin, Empty } from 'antd';
import { SearchOutlined, PlusOutlined, ArrowRightOutlined, UserOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createNewChat } from './Chat';
import { fetchRoleList, RoleItemResponse } from '../services/api';
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
  type: 'java' | 'psychology' | 'default';
  likes?: number;
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
  const handleLike = (e: React.MouseEvent, roleId: number) => {
    e.stopPropagation(); // 阻止事件冒泡
    setLikedRoles(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(roleId)) {
        newLiked.delete(roleId);
      } else {
        newLiked.add(roleId);
      }
      return newLiked;
    });

    // 更新角色列表中的点赞数
    setRoles(prevRoles => 
      prevRoles.map(role => {
        if (role.id === roleId) {
          const currentLikes = role.likes || 0;
          return {
            ...role,
            likes: likedRoles.has(roleId) ? currentLikes - 1 : currentLikes + 1
          };
        }
        return role;
      })
    );

    // 同步更新过滤后的角色列表
    setFilteredRoles(prevRoles => 
      prevRoles.map(role => {
        if (role.id === roleId) {
          const currentLikes = role.likes || 0;
          return {
            ...role,
            likes: likedRoles.has(roleId) ? currentLikes - 1 : currentLikes + 1
          };
        }
        return role;
      })
    );
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

            // 添加初始点赞数（随机生成用于演示）
            const initialLikes = 10;

            return {
              id: item.mmu.id,
              name: item.mmu.role_name,
              avatar,
              description: item.mmu.description,
              promptContent: item.prompt.content,
              type,
              likes: initialLikes
            };
          });

          setRoles(formattedRoles);
          setFilteredRoles(formattedRoles);
          // 如果有角色，默认选中第一个
          if (formattedRoles.length > 0) {
            setSelectedRole(formattedRoles[0]);
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
  // 根据描述长度判断是否需要特殊处理
  const isLongDescription = role.description && role.description.length > 300;

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
    if (descriptionRef && isLongDescription) {
      // 初始设置一个合适的底部内边距
      descriptionRef.style.paddingBottom = '24px';
      
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = descriptionRef;
        // 检测是否接近底部
        const scrollRatio = scrollTop / (scrollHeight - clientHeight);
        
        if (scrollRatio > 0.95) { // 当滚动到95%以上时
          // 增加底部内边距，确保最后一行文本完全可见
          descriptionRef.style.paddingBottom = '28px';
        } else if (scrollRatio > 0.7) { // 滚动到70%以上时
          descriptionRef.style.paddingBottom = '24px';
        } else {
          descriptionRef.style.paddingBottom = '16px';
        }
      };
      
      // 立即执行一次，确保初始状态正确
      handleScroll();
      
      descriptionRef.addEventListener('scroll', handleScroll);
      return () => {
        descriptionRef?.removeEventListener('scroll', handleScroll);
      };
    }
  }, [descriptionRef, isLongDescription, role.description]);

  const handleStartChat = () => {
    // 获取当前角色的信息
    const { name, avatar, type, promptContent } = role;
    
    // 根据角色类型确定聊天类型
    let chatType: 'psychological' | 'normal' | 'interview' = 'normal';
    if (type === 'psychology') {
      chatType = 'psychological';
    } else if (type === 'java') {
      chatType = 'interview';
    }
    
    // 创建新对话，对于URL类型的头像使用默认表情
    const chatAvatar = avatar;
    
    // 创建新对话，使用promptContent作为首条消息
    const newChat = createNewChat(name, chatAvatar, promptContent, avatar, chatType); // 传递 avatarUrl
    
    // 显示成功消息
    message.success(`已创建与 ${name} 的新对话`);
    
    // 导航到聊天页面，并传递新对话数据
    navigate('/chat', { 
      state: { 
        newChat,
        timestamp: Date.now() // 添加时间戳确保每次传递的state都是新的
      },
      replace: true // 使用replace模式，替换当前历史记录
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
export default Roles;
