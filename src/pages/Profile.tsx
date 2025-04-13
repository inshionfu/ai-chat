import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { UserOutlined, WalletOutlined } from '@ant-design/icons';
import { Spin, message, Typography, Card, Row, Col } from 'antd';
import { fetchUserProfile, UserProfile } from '../services/api';
import UserAvatar from '../components/UserAvatar';
import { useUser } from '../contexts/UserContext';

const { Title, Paragraph } = Typography;

const ProfileContainer = styled.div`
  width: 100%;
  min-height: 100%;
  background-color: #f5f7fa;
  padding: 24px;
  display: flex;
  flex-direction: column;
`;

const ProfileGrid = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  height: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SideCard = styled(Card)`
  height: fit-content;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: white;
  
  .ant-card-body {
    padding: 24px;
  }
`;

const MainCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: white;
  height: 100%;
  
  .ant-card-body {
    padding: 24px;
  }
`;

const UserSection = styled.div`
  text-align: center;
  padding: 16px 0;
`;

const UserName = styled(Title)`
  margin: 16px 0 4px 0 !important;
  font-size: 24px !important;
`;

const UserRole = styled(Paragraph)`
  color: #666;
  margin-bottom: 24px !important;
`;

const BalanceCard = styled(Card)`
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  border-radius: 12px;
  margin-top: 16px;
  
  .ant-card-body {
    padding: 20px;
  }
`;

const BalanceTitle = styled.div`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  
  .anticon {
    margin-right: 8px;
  }
`;

const BalanceAmount = styled.div`
  font-size: 32px;
  color: white;
  font-weight: 500;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 24px;
`;

const StatCard = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: #1890ff;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { setAvatarUrl, setNickname } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetchUserProfile();
      if (response.code === '0000') {
        setUserProfile(response.data);
        // 更新全局用户信息
        setAvatarUrl(response.data.avatar);
        setNickname(response.data.user_name);
      } else {
        message.error(response.info || '获取用户信息失败');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      message.error('获取用户信息失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProfileContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin size="large" />
        </div>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileGrid>
        <SideCard>
          <UserSection>
            <UserAvatar />
            <UserName>{userProfile?.user_name || '用户'}</UserName>
            <UserRole type="secondary">普通会员</UserRole>
            <BalanceCard>
              <BalanceTitle>
                <WalletOutlined /> 账户余额
              </BalanceTitle>
              <BalanceAmount>
                ¥ {userProfile?.quota?.toFixed(2) || '0.00'}
              </BalanceAmount>
            </BalanceCard>
            <StatsGrid>
              <StatCard>
                <StatValue>23</StatValue>
                <StatLabel>对话数</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>108</StatValue>
                <StatLabel>消息数</StatLabel>
              </StatCard>
            </StatsGrid>
          </UserSection>
        </SideCard>

        <MainCard>
          <Title level={4}>我的订单</Title>
          <Paragraph style={{ marginBottom: '24px', color: '#666' }}>
            查看您的对话订单记录和使用情况
          </Paragraph>
          <Row gutter={[24, 24]}>
            {/* 这里可以添加订单列表 */}
          </Row>
        </MainCard>
      </ProfileGrid>
    </ProfileContainer>
  );
};

export default Profile; 