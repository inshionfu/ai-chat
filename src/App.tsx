import React from 'react';
import styled from 'styled-components';
import { Layout, Menu } from 'antd';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Roles from './pages/Roles';

const { Content, Sider } = Layout;

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
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
`;

const WindowControls = styled.div`
  display: flex;
  gap: 6px;
  padding: 12px;
  position: relative;
  left: 0;
  top: 0;
`;

const ControlButton = styled.div<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    filter: brightness(0.9);
  }
`;

const StyledSider = styled(Sider)`
  background: white;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  
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
`;

const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const FullScreenLayout = styled(StyledLayout)`
  max-width: 100%;
  height: 100vh;
  border-radius: 0;
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

function AppLayout() {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isFullScreen, setIsFullScreen] = React.useState(false);

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
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/roles" element={<Roles />} />
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

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;