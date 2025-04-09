import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Input, Button, Select } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  SendOutlined,
  DeleteOutlined,
  SettingOutlined,
  FileImageOutlined,
  CodeOutlined,
  DownOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

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

// 静态数据
const chatList: ChatItem[] = [
  {
    id: '1',
    type: 'psychological',
    title: '心理咨询',
    message: '吹灭别人的灯，不能照亮自己',
    time: '01:51 PM',
    icon: '❤️',
    messages: []
  },
  {
    id: '2',
    type: 'normal',
    title: '新的对话',
    message: '请问有什么需要帮助的吗？',
    time: '12:45 PM',
    icon: '🤖',
    messages: [
      {
        id: '1',
        content: '请问有什么需要帮助的吗？',
        sender: 'bot',
        timestamp: '12:45 PM',
        avatar: '🤖'
      },
      {
        id: '2',
        content: '请问有什么需要帮助的吗？',
        sender: 'user',
        timestamp: '12:24 PM',
        avatar: '😃'
      },
      {
        id: '3',
        content: '写我写个java冒泡排序',
        sender: 'user',
        timestamp: '12:24 PM',
        avatar: '😃'
      },
      {
        id: '4',
        content: 'ChatGPT 接口尚未对接，暂时还不能回复！！！',
        sender: 'bot',
        timestamp: '12:24 PM',
        avatar: '🤖',
        status: 'error'
      }
    ]
  },
  {
    id: '3',
    type: 'interview',
    title: '面试官',
    message: 'Hello, how are you?',
    time: '01:51 PM',
    icon: '👨‍💻'
  },
  {
    id: '4',
    type: 'normal',
    title: '普通对话',
    message: '写个java冒泡排序？',
    time: '01:51 PM',
    icon: '🐞'
  },
  {
    id: '5',
    type: 'interview',
    title: '面试官',
    message: 'Hello, how are you?',
    time: '01:51 PM',
    icon: '👨‍💻'
  },
  {
    id: '6',
    type: 'normal',
    title: '普通对话',
    message: '写个java冒泡排序？',
    time: '01:51 PM',
    icon: '🐞'
  },
  {
    id: '7',
    type: 'interview',
    title: '面试官',
    message: 'Hello, how are you?',
    time: '01:51 PM',
    icon: '👨‍💻'
  },
  {
    id: '8',
    type: 'normal',
    title: '普通对话',
    message: '写个java冒泡排序？',
    time: '01:52 PM',
    icon: '🐞'
  },
  {
    id: '9',
    type: 'interview',
    title: '面试官',
    message: 'Hello, how are you?',
    time: '01:52 PM',
    icon: '👨‍💻'
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

const Avatar = styled.div<{ isUser?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  margin: ${props => props.isUser ? '0 0 0 12px' : '0 12px 0 0'};
  background-color: ${props => props.isUser ? '#ffeb3b' : '#f0f0f0'};
  overflow: hidden;
  position: relative;
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
export const createNewChat = (title: string, icon: string, content: string, type: 'psychological' | 'normal' | 'interview' = 'normal'): ChatItem => {
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
        avatar: '😃'
      },
      {
        id: '2',
        content: 'ChatGPT 接口尚未对接，暂时还不能回复！！！',
        sender: 'bot',
        timestamp: timeString,
        avatar: chatIcon,
        status: 'error'
      }
    ]
  };
};

// 聊天对话组件
const ChatDialog: React.FC<{ chat: ChatItem }> = ({ chat }) => {
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo');

  const modelOptions = [
    { value: 'text-davinci-003', label: 'text-davinci-003' },
    { value: 'text-davinci-002', label: 'text-davinci-002' },
    { value: 'davinci', label: 'davinci' },
    { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' },
    { value: 'gpt-3.5-turbo-16k', label: 'gpt-3.5-turbo-16k' },
    { value: 'gpt-4', label: 'gpt-4' },
    { value: 'gpt-4-32k', label: 'gpt-4-32k' }
  ];

  return (
    <ChatContentPanel>
      <ChatHeaderTitle>{chat.title}</ChatHeaderTitle>
      <MessagesContainer>
        {chat.messages && chat.messages.map(msg => (
          <MessageRow key={msg.id} isUser={msg.sender === 'user'}>
            <Avatar isUser={msg.sender === 'user'}>
              {msg.avatar && (msg.avatar.startsWith('http') || msg.avatar.startsWith('/')) ? (
                <>
                  <AvatarImg
                    src={msg.avatar}
                    alt={msg.sender === 'user' ? '用户' : chat.title}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex');
                    }}
                  />
                  <div style={{ display: 'none', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    {msg.sender === 'user' ? '😃' : '🤖'}
                  </div>
                </>
              ) : (
                msg.avatar || (msg.sender === 'user' ? '😃' : '��')
              )}
            </Avatar>
            <MessageContent isUser={msg.sender === 'user'} status={msg.status}>
              {msg.content}
            </MessageContent>
          </MessageRow>
        ))}
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
            placeholder="那你什么时候能回复我呢？"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <SendButton type="primary">
            发送(Ctrl+Enter)
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </ChatContentPanel>
  );
};

const Chat: React.FC = () => {
  // 使用状态管理聊天列表
  const [chats, setChats] = useState<ChatItem[]>(chatList);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // 使用ref来追踪已处理的对话ID
  const processedChatIdsRef = React.useRef<Set<string>>(new Set());

  // 处理从角色页面传递过来的数据
  useEffect(() => {
    // 如果没有选中的对话，默认选择第一个
    if (!selectedChat && chats.length > 0) {
      setSelectedChat(chats[0]);
      return;
    }
    
    // 检查是否有新对话数据从location state传递过来
    if (location.state && location.state.newChat) {
      const newChat = location.state.newChat as ChatItem;
      
      // 检查这个对话ID是否已经处理过
      if (!processedChatIdsRef.current.has(newChat.id)) {
        // 记录这个ID已经被处理过
        processedChatIdsRef.current.add(newChat.id);
        
        // 检查是否已存在相同ID的对话
        const existingChatIndex = chats.findIndex(chat => chat.id === newChat.id);
        
        if (existingChatIndex === -1) {
          // 如果不存在，则添加到列表头部
          setChats(prevChats => [newChat, ...prevChats]);
          setSelectedChat(newChat);
        } else {
          // 如果已存在，只选中它
          setSelectedChat(chats[existingChatIndex]);
        }
      }
      
      // 清除location state，避免刷新页面时重复创建
      window.history.replaceState({}, document.title);
    }
  }, [location.state, chats, selectedChat]);

  return (
    <ChatContainer>
      <ChatListPanel>
        <SearchContainer>
          <SearchInput placeholder="搜索" prefix={<SearchOutlined />} />
          <AddButton type="primary" icon={<PlusOutlined />} />
        </SearchContainer>
        <ChatListContainer>
          {chats.map(chat => (
            <ChatItemContainer 
              key={chat.id} 
              onClick={() => setSelectedChat(chat)}
              style={{ backgroundColor: selectedChat?.id === chat.id ? '#f0f0f0' : 'transparent' }}
            >
              <ChatIcon>
                {chat.icon && (chat.icon.startsWith('http') || chat.icon.startsWith('/')) ? (
                  <>
                    <ChatIconImg
                      src={chat.icon}
                      alt={chat.title}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const fallback = img.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <ChatIconFallback style={{ display: 'none' }}>
                      🤖
                    </ChatIconFallback>
                  </>
                ) : (
                  <ChatIconFallback>
                    {chat.icon || '🤖'}
                  </ChatIconFallback>
                )}
              </ChatIcon>
              <ChatInfo>
                <ChatItemHeader>
                  <ChatTitle>
                    {chat.type === 'psychological' && <PsychologicalBadge>99+</PsychologicalBadge>}
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
        <ChatDialog chat={selectedChat} />
      ) : (
        <ChatContentPanel style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div>请选择一个聊天或创建新的对话</div>
        </ChatContentPanel>
      )}
    </ChatContainer>
  );
};

export default Chat; 