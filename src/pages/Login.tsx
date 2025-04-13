import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Input, Button, message } from 'antd';
import { login } from '../services/api';

const LoginContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
    opacity: 0.1;
    transform: skewY(-4deg);
    transform-origin: top left;
  }
`;

const LoginContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 420px;
  padding: 40px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Title = styled.div`
  font-size: 36px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.div`
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
`;

const QRSection = styled.div`
  margin-bottom: 32px;
  text-align: center;
`;

const Logo = styled.div`
  margin-bottom: 16px;
  text-align: center;
  
  img {
    width: 160px;
    height: 160px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    }
  }
`;

const QRCodeText = styled.div`
  font-size: 14px;
  color: #666;
  text-align: center;
  background: #f5f7fa;
  padding: 8px 16px;
  border-radius: 20px;
  display: inline-block;
`;

const LoginForm = styled.div`
  width: 100%;
  max-width: 320px;
`;

const StyledInput = styled(Input)`
  height: 44px;
  margin-bottom: 16px;
  border-radius: 8px;
  font-size: 15px;
  border-color: #e8e8e8;
  
  &::placeholder {
    color: #999;
  }
  
  &:hover, &:focus {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }
`;

const LoginButton = styled(Button)`
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #40a9ff 0%, #5cdbd3 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  font-size: 14px;
  text-align: center;
  margin: -8px 0 12px;
  min-height: 22px;
`;

const Disclaimer = styled.div`
  font-size: 13px;
  color: #999;
  text-align: center;
  margin-top: 24px;
  max-width: 280px;
  line-height: 1.6;
`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [visitCode, setVisitCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!visitCode) {
      setErrorMsg('请输入访问码');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    
    try {
      const response = await login(visitCode);
      
      if (response.code === '0000') {
        localStorage.setItem('token', response.data);
        localStorage.setItem('isAuthenticated', 'true');
        message.success('登录成功！');
        navigate('/');
      } else {
        setErrorMsg('验证码不存在，请确认最新验证码');
      }
    } catch (error) {
      console.error('登录出错:', error);
      setErrorMsg('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisitCode(e.target.value);
    setErrorMsg('');
  };

  return (
    <LoginContainer>
      <LoginContent>
        <HeaderSection>
          <Title>Aihub</Title>
          <Subtitle>运用AI提效</Subtitle>
        </HeaderSection>
        
        <QRSection>
          <Logo>
            <img src="https://ai-prompt-manage.oss-cn-shanghai.aliyuncs.com/%E5%85%AC%E4%BC%97%E5%8F%B7%E4%BA%8C%E7%BB%B4%E7%A0%81" alt="QR Code" />
          </Logo>
          <QRCodeText>
            扫码关注公众号【丝滑打铁】 回复【403】获取访问码
          </QRCodeText>
        </QRSection>
        
        <LoginForm>
          <StyledInput
            placeholder="在此处填写访问码"
            value={visitCode}
            onChange={handleInputChange}
            onPressEnter={handleLogin}
            disabled={loading}
            status={errorMsg ? 'error' : ''}
          />
          <ErrorMessage>{errorMsg}</ErrorMessage>
          <LoginButton 
            type="primary" 
            onClick={handleLogin}
            loading={loading}
          >
            {loading ? '登录中...' : '确认登录👋'}
          </LoginButton>
          
          <Disclaimer>
            说明：此平台主要以学习OpenAI为主，请合理、合法、合规的使用相关资料！
          </Disclaimer>
        </LoginForm>
      </LoginContent>
    </LoginContainer>
  );
};

export default Login; 