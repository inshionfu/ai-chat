import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Input, Button, Select, Avatar } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  SendOutlined,
  DeleteOutlined,
  SettingOutlined,
  FileImageOutlined,
  CodeOutlined,
  DownOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 本地存储的键
const CHATS_STORAGE_KEY = 'ai_chat_chats';

// 消息类型定义
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  avatar?: string;
  status?: 'loading' | 'error' | 'success';
}

// 对话类型定义
interface ChatItem {
  id: string;
  type: 'psychological' | 'normal' | 'interview';
  title: string;
  message: string;
  time: string;
  icon?: string;
  messages?: Message[];
}

// 静态数据 (现在作为默认值)
const defaultChatList: ChatItem[] = [
  {
    id: '1',
    type: 'normal',
    title: '新的对话',
    message: '请问有什么需要帮助的吗？',
    time: '12:45 PM',
    icon: 'https://inshion.oss-cn-shanghai.aliyuncs.com/%E7%94%9F%E6%88%90%E8%B5%9B%E5%8D%9A%E6%9C%8B%E5%85%8B%E5%A4%B4%E5%83%8F.png',
    messages: [
      {
        id: '1',
        content: '请问有什么需要帮助的吗？',
        sender: 'bot',
        timestamp: '12:45 PM',
        avatar: 'https://inshion.oss-cn-shanghai.aliyuncs.com/%E7%94%9F%E6%88%90%E8%B5%9B%E5%8D%9A%E6%9C%8B%E5%85%8B%E5%A4%B4%E5%83%8F.png'
      },
    ]
  }
];

// 样式组件
const ChatContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
`;

const ChatListPanel = styled.div`
  width: 280px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatContentPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fafafa;
`;

const ChatHeaderTitle = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 500;
  background-color: white;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: #f8f8f8;
`;

const MessageRow = styled.div<{ isUser?: boolean }>`
  display: flex;
  align-items: flex-start;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  margin-bottom: 8px;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarFallback = styled.div<{ isUser?: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  background-color: ${props => props.isUser ? '#ffeb3b' : '#f0f0f0'};
`;

const MessageContent = styled.div<{ isUser?: boolean, status?: string }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: ${props => {
    if (props.status === 'error') return '#f0f0f0';
    return props.isUser ? 'white' : 'white';
  }};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: relative;

  /* Markdown specific styles */
  p {
    margin-bottom: 0.5em;
  }
  ul, ol {
    padding-left: 20px;
    margin-bottom: 0.5em;
  }
  li {
    margin-bottom: 0.2em;
  }
  code {
    background-color: #f0f0f0;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
  }
  pre {
    background-color: #f0f0f0;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    code {
      background-color: transparent;
      padding: 0;
    }
  }
`;

const InputContainer = styled.div`
  padding: 16px;
  background-color: white;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
`;

const ToolBar = styled.div`
  display: flex;
  margin-bottom: 12px;
  justify-content: space-between;
`;

const ToolGroup = styled.div`
  display: flex;
`;

const ToolButton = styled.div`
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: 8px;
  font-size: 12px;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const StyledSelect = styled(Select)`
  width: 150px;
  
  .ant-select-selector {
    border-color: #e0e0e0 !important;
    border-radius: 4px !important;
  }
  
  .ant-select-selection-item {
    font-size: 12px;
  }
  
  &.ant-select-open {
    .ant-select-selector {
      box-shadow: none !important;
    }
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const TextArea = styled(Input.TextArea)`
  resize: none;
  border-radius: 8px;
  padding: 12px;
  height: 80px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &:focus {
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
  }
`;

const SendButton = styled(Button)`
  background-color: #08b96d;
  margin-left: 12px;
  border: none;
  border-radius: 8px;
  height: 48px;
  width: 120px;
  
  &:hover {
    background-color: #09a060;
  }
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

const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ChatItemContainer = styled.div`
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const ChatIcon = styled.div<{ isImage?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  margin-right: 15px;
  background-color: ${props => props.isImage ? 'transparent' : '#f0f0f0'};
  overflow: hidden;
  position: relative;

  /* Markdown specific styles */
  p {
    margin-bottom: 0.5em;
  }
  ul, ol {
    padding-left: 20px;
    margin-bottom: 0.5em;
  }
  li {
    margin-bottom: 0.2em;
  }
  code {
    background-color: #f0f0f0;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
  }
  pre {
    background-color: #f0f0f0;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    code {
      background-color: transparent;
      padding: 0;
    }
  }
`;

const ChatIconImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ChatIconFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  background-color: #f0f0f0;
`;

const ChatInfo = styled.div`
  flex: 1;
`;

const ChatTitle = styled.div`
  font-weight: 500;
`;

const ChatTime = styled.div`
  font-size: 12px;
  color: #999;
`;

const ChatMessage = styled.div`
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PsychologicalBadge = styled.span`
  background-color: #FF646F;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-right: 5px;
`;

const ChatItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

// 创建新对话的helper函数
export const createNewChat = (title: string, icon: string, content: string, userAvatar: string | undefined, type: 'psychological' | 'normal' | 'interview' = 'normal'): ChatItem => {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // 使用更加唯一的ID生成方式
  const uniqueId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // 处理头像
  let chatIcon = icon;
  if (icon.startsWith('http') || icon.startsWith('/')) {
    // 如果是URL或相对路径，使用图片URL
    chatIcon = icon.startsWith('http') ? icon : `${process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8080' : 'http://124.221.174.50:80'}${icon}`;
  }
  
  return {
    id: uniqueId,
    type,
    title,
    message: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
    time: timeString,
    icon: chatIcon,
    messages: [
      {
        id: '1',
        content: content,
        sender: 'user',
        timestamp: timeString,
        avatar: userAvatar // 使用传入的用户头像
      }
    ]
  };
};

// 聊天对话组件
const ChatDialog: React.FC<{ chat: ChatItem; onUpdateChat: (updatedChat: ChatItem | ((prevChat: ChatItem) => ChatItem)) => void }> = ({ chat, onUpdateChat }) => {
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('doubao-pro');
  const { avatarUrl } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const modelOptions = [
    { value: 'glm-4-flash-250414', label: 'GLM-4' },
    { value: 'deepseek-r1', label: 'Deepseek-R1' },
    { value: 'deepseek-v3', label: 'Deepseek-V3' },
    { value: 'doubao-pro-4k', label: 'doubao-pro' },
    { value: 'doubao-lite-4k', label: 'doubao-lite' },
    { value: 'qwen-max', label: 'Qwen-Max' },
    { value: 'QWQ', label: 'QWQ' }
  ];

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  // 发送消息处理函数 (Ensure this is defined within ChatDialog)
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('用户未登录');
      // 可以添加提示用户登录的逻辑，例如跳转到登录页
      // navigate('/login'); 
      return;
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      content: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: avatarUrl || undefined // Use avatarUrl directly
    };

    const botMessageId = `msg_${Date.now()}_bot`;
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      content: '', // Initial empty content for streaming
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: chat.icon, // Use chat icon for bot avatar
      status: 'loading'
    };

    // Update UI immediately with user message and loading bot message
    const updatedMessages = [...(chat.messages || []), userMessage, botMessagePlaceholder];
    // Use functional update for onUpdateChat
    onUpdateChat(prevChat => ({ ...prevChat, messages: updatedMessages }));
    setMessage(''); // Clear input field

    try {
      const apiUrl = 'http://124.221.174.50:80/api/v1/chat/completions'; // Backend API endpoint

      // Prepare request body according to API spec
      const requestBody = {
        model: selectedModel,
        messages: updatedMessages
          .filter(msg => msg.id !== botMessageId) // Exclude the placeholder message
          .map(msg => ({ 
            role: msg.sender === 'user' ? 'user' : 'assistant', // Map sender to role
            content: msg.content 
          }))
      };

      const response = await fetch(apiUrl, {
        method: 'POST', // Use POST for sending data in RequestBody
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}` // Correct Authorization header format
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.text(); // Try to get error details
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorData}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let botResponseContent = '';
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          botResponseContent += chunk;

          // Update bot message content in real-time using functional update
          onUpdateChat(prevChat => {
            const currentMessages = prevChat.messages || [];
            const botMsgIndex = currentMessages.findIndex(msg => msg.id === botMessageId);
            if (botMsgIndex !== -1) {
              const updatedBotMsg = { ...currentMessages[botMsgIndex], content: botResponseContent, status: 'loading' as 'loading' };
              const newMessages = [...currentMessages];
              newMessages[botMsgIndex] = updatedBotMsg;
              return { ...prevChat, messages: newMessages };
            }
            return prevChat; // Return previous state if message not found
          });
        }
      }

      // Stream finished, update final status using functional update
      onUpdateChat(prevChat => {
        const currentMessages = prevChat.messages || [];
        const botMsgIndex = currentMessages.findIndex(msg => msg.id === botMessageId);
        if (botMsgIndex !== -1) {
          const updatedBotMsg = { ...currentMessages[botMsgIndex], status: 'success' as 'success' };
          const newMessages = [...currentMessages];
          newMessages[botMsgIndex] = updatedBotMsg;
          return { ...prevChat, messages: newMessages };
        }
        return prevChat;
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      // Update bot message status to error using functional update
      onUpdateChat(prevChat => {
        const currentMessages = prevChat.messages || [];
        const botMsgIndex = currentMessages.findIndex(msg => msg.id === botMessageId);
        if (botMsgIndex !== -1) {
          const errorContent = `请求出错: ${error instanceof Error ? error.message : String(error)}`;
          const updatedBotMsg = { ...currentMessages[botMsgIndex], content: errorContent, status: 'error' as 'error' };
          const newMessages = [...currentMessages];
          newMessages[botMsgIndex] = updatedBotMsg;
          return { ...prevChat, messages: newMessages };
        }
        return prevChat;
      });
    }
  };

  // 在消息渲染部分使用用户头像
  const renderMessage = (msg: Message) => {
    const isUser = msg.sender === 'user';
    const displayAvatar = isUser ? avatarUrl : msg.avatar; // Use user's avatar or bot's avatar
    return (
      <MessageRow key={msg.id} isUser={isUser}>
        <Avatar
          size={40}
          icon={!displayAvatar && (isUser ? <UserOutlined /> : null)} // Show UserOutlined if user avatar is missing
          src={displayAvatar}
        />
        <MessageContent isUser={isUser} status={msg.status}>
          {isUser ? (
             msg.content // User message: plain text
          ) : msg.status === 'loading' && !msg.content ? (
            '思考中...' // Bot message: loading placeholder
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown> // Bot message: render markdown
          )}
          {/* Optional: Add a subtle indicator for streaming if needed */}
          {/* {msg.status === 'loading' && msg.content ? '...' : ''} */}
        </MessageContent>
      </MessageRow>
    );
  };

  return (
    <ChatContentPanel>
      <ChatHeaderTitle>{chat.title}</ChatHeaderTitle>
      <MessagesContainer>
        {chat.messages && chat.messages.map(renderMessage)}
        <div ref={messagesEndRef} /> {/* Element to scroll to */}
      </MessagesContainer>
      <InputContainer>
        <ToolBar>
          <ToolGroup>
            <ToolButton>
              <DeleteOutlined style={{ marginRight: 4 }} />
              清空上下文
            </ToolButton>
          </ToolGroup>
          <StyledSelect
            value={selectedModel}
            onChange={(value: unknown) => setSelectedModel(value as string)}
            options={modelOptions}
            suffixIcon={<DownOutlined />}
            dropdownStyle={{ borderRadius: '4px' }}
          />
        </ToolBar>
        <InputWrapper>
          <TextArea
            placeholder="输入消息... (Ctrl+Enter 发送)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onPressEnter={(e) => {
              if (e.ctrlKey && !e.shiftKey) {
                e.preventDefault(); // Prevent default newline on Ctrl+Enter
                handleSendMessage(); // Call the function defined within this component
              }
            }}
          />
          <SendButton type="primary" onClick={handleSendMessage}> {/* Call the function defined within this component */}
            发送(Ctrl+Enter)
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </ChatContentPanel>
  );
};

const Chat: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { avatarUrl } = useUser(); // 获取用户头像

  // 从 localStorage 加载聊天列表，如果不存在则使用默认列表
  const [chats, setChats] = useState<ChatItem[]>(() => {
    const savedChats = localStorage.getItem(CHATS_STORAGE_KEY);
    try {
      return savedChats ? JSON.parse(savedChats) : defaultChatList;
    } catch (e) {
      console.error("Failed to parse chats from localStorage", e);
      return defaultChatList; // 解析失败时返回默认值
    }
  });

  const [selectedChatId, setSelectedChatId] = useState<string | null>(chats.length > 0 ? chats[0].id : null);
  const [searchTerm, setSearchTerm] = useState('');

  // 将聊天列表保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
    } catch (e) {
      console.error("Failed to save chats to localStorage", e);
    }
  }, [chats]);

  // 处理从 Roles 页面传递过来的新对话
  useEffect(() => {
    if (location.state?.newChat) {
      const newChat: ChatItem = location.state.newChat;
      // 清除 state，防止重复添加
      // 注意：将状态清理移到添加聊天之前，并确保只在 newChat 存在时执行
      navigate(location.pathname, { replace: true, state: {} });

      // 检查是否已存在相同 ID 的对话 (使用最新的 chats 状态)
      setChats(prevChats => {
        if (!prevChats.some(chat => chat.id === newChat.id)) {
          // 只有在对话不存在时才添加
          setSelectedChatId(newChat.id);
          return [newChat, ...prevChats];
        }
        // 如果对话已存在，则不修改 chats 列表
        return prevChats;
      });
    }
  }, [location.state, navigate]); // 移除 chats 依赖，仅依赖 location.state 和 navigate

  // 过滤聊天列表
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 获取当前选中的对话
  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  // 创建新对话处理函数
  const handleCreateNewChat = () => {
    const newChat = createNewChat('新的对话', 'https://inshion.oss-cn-shanghai.aliyuncs.com/%E7%94%9F%E6%88%90%E8%B5%9B%E5%8D%9A%E6%9C%8B%E5%85%8B%E5%A4%B4%E5%83%8F.png', '你好！', avatarUrl);
    setChats(prevChats => [newChat, ...prevChats]);
    setSelectedChatId(newChat.id);
  };

  // 更新对话处理函数 (传递给 ChatDialog)
  const handleUpdateChat = (updatedChatData: ChatItem | ((prevChat: ChatItem) => ChatItem)) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === selectedChatId) {
          // 如果是函数，则基于前一个状态计算新状态
          if (typeof updatedChatData === 'function') {
            return updatedChatData(chat);
          }
          // 否则直接使用新数据
          return { ...chat, ...updatedChatData };
        }
        return chat;
      })
    );
  };

  // 删除对话处理函数
  const handleDeleteChat = (chatId: string) => {
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    // 如果删除的是当前选中的对话，则选中列表中的第一个对话（如果存在）
    if (selectedChatId === chatId) {
      setSelectedChatId(chats.length > 1 ? chats.find(c => c.id !== chatId)?.id ?? null : null);
    }
  };

  return (
    <ChatContainer>
      <ChatListPanel>
        <SearchContainer>
          <SearchInput placeholder="搜索" prefix={<SearchOutlined />} />
          <AddButton 
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateNewChat} />
        </SearchContainer>
        <ChatListContainer>
          {chats.map(chat => (
            <ChatItemContainer
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              style={{ backgroundColor: selectedChatId === chat.id ? '#f0f0f0' : 'transparent' }}
            >
              <ChatIcon isImage={chat.icon?.startsWith('http') || chat.icon?.startsWith('/')}>
                {chat.icon && (chat.icon.startsWith('http') || chat.icon.startsWith('/')) ? (
                  <>
                    <ChatIconImg
                      src={chat.icon}
                      alt={chat.title}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const fallback = img.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <ChatIconFallback style={{ display: 'none' }}>🤖</ChatIconFallback>
                  </>
                ) : (
                  <ChatIconFallback>{chat.icon || '🤖'}</ChatIconFallback>
                )}
              </ChatIcon>
              <ChatInfo>
                <ChatItemHeader>
                  <ChatTitle>
                    {chat.type === 'psychological' && <PsychologicalBadge>心理</PsychologicalBadge>}
                    {chat.title}
                  </ChatTitle>
                  <ChatTime>{chat.time}</ChatTime>
                </ChatItemHeader>
                <ChatMessage>{chat.message}</ChatMessage>
              </ChatInfo>
            </ChatItemContainer>
          ))}
        </ChatListContainer>
      </ChatListPanel>
      {selectedChat ? (
        <ChatDialog chat={selectedChat} onUpdateChat={handleUpdateChat} />
      ) : (
        <ChatContentPanel style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div>请选择一个聊天或创建新的对话</div>
        </ChatContentPanel>
      )}
    </ChatContainer>
  );
};

export default Chat;
