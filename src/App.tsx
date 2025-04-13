import React from 'react';
import styled from 'styled-components';
import { Layout, Menu } from 'antd';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HomeOutlined, MessageOutlined, UserOutlined, IdcardOutlined, ShoppingOutlined } from '@ant-design/icons';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Roles from './pages/Roles';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Products from './pages/Products';
import { UserProvider } from './contexts/UserContext';

const { Content, Sider } = Layout;

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  transition: all 0.3s ease-in-out;
`;

const StyledLayout = styled(Layout)`
  width: 100%;
  height: 90vh;
  background: white;
  margin: 0 auto;
  max-width: 1200px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const WindowControls = styled.div`
  display: flex;
  gap: 6px;
  padding: 12px;
  position: relative;
  left: 0;
  top: 0;
  z-index: 1;
`;

const ControlButton = styled.div<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    filter: brightness(0.9);
    transform: scale(1.1);
  }
`;

const StyledSider = styled(Sider)`
  background: white;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  
  .ant-menu {
    border-right: none;
    flex: 1;
  }
`;

const StyledContent = styled(Content)`
  background: white;
  padding: 0 32px 24px 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  overflow-y: auto;
  transition: all 0.3s ease;
`;

const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: all 0.3s ease;
`;

const FullScreenLayout = styled(StyledLayout)`
  max-width: 100%;
  height: 100vh;
  border-radius: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const Logo = styled.div`
  font-size: 18px;
  font-weight: bold;
  padding: 12px;
`;

const NavigationMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '主页',
    },
    {
      key: '/chat',
      icon: <MessageOutlined />,
      label: '聊天',
    },
    {
      key: '/roles',
      icon: <UserOutlined />,
      label: '角色',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: '商品橱窗',
    },
    {
      key: '/profile',
      icon: <IdcardOutlined />,
      label: '个人主页',
    },
  ];

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={({ key }) => navigate(key)}
    />
  );
};

// 路由保护组件
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return element;
};

function AppLayout() {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const location = useLocation();

  // 如果是登录页面，不显示主布局
  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMinimize = () => {
    if (isFullScreen) {
      setIsFullScreen(false);
    }
  };

  const handleMaximize = () => {
    setIsFullScreen(true);
  };

  if (!isOpen) {
    return null;
  }

  const layoutContent = (
    <ContentWrapper>
      <Routes>
        <Route path="/" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/chat" element={<ProtectedRoute element={<Chat />} />} />
        <Route path="/roles" element={<ProtectedRoute element={<Roles />} />} />
        <Route path="/products" element={<ProtectedRoute element={<Products />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ContentWrapper>
  );

  return (
    <PageWrapper style={{ padding: isFullScreen ? '0' : '20px' }}>
      {isFullScreen ? (
        <FullScreenLayout>
          <StyledSider width={200}>
            <WindowControls>
              <ControlButton color="#FF5F57" onClick={handleClose} />
              <ControlButton color="#FFBD2E" onClick={handleMinimize} />
              <ControlButton color="#28C840" onClick={handleMaximize} />
            </WindowControls>
            <NavigationMenu />
          </StyledSider>
          <StyledContent>
            {layoutContent}
          </StyledContent>
        </FullScreenLayout>
      ) : (
        <StyledLayout>
          <StyledSider width={200}>
            <WindowControls>
              <ControlButton color="#FF5F57" onClick={handleClose} />
              <ControlButton color="#FFBD2E" onClick={handleMinimize} />
              <ControlButton color="#28C840" onClick={handleMaximize} />
            </WindowControls>
            <NavigationMenu />
          </StyledSider>
          <StyledContent>
            {layoutContent}
          </StyledContent>
        </StyledLayout>
      )}
    </PageWrapper>
  );
}

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <AppLayout />
      </Router>
    </UserProvider>
  );
};

export default App;