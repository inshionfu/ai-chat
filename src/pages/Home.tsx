import React from 'react';
import styled from 'styled-components';
import { Typography, Card, Row, Col } from 'antd';
import { RobotOutlined, MessageOutlined, UserSwitchOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const StyledTitle = styled(Title)`
  text-align: center;
  margin-bottom: 40px !important;
`;

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const StyledCard = styled(Card)`
  height: 100%;
  transition: all 0.3s;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const IconWrapper = styled.div`
  font-size: 32px;
  color: #1890ff;
  margin-bottom: 12px;
  text-align: center;
`;

const features = [
  {
    icon: <RobotOutlined />,
    title: '智能对话',
    description: '基于先进的AI模型，提供自然、流畅的对话体验',
  },
  {
    icon: <MessageOutlined />,
    title: '多场景应用',
    description: '支持多种对话场景，满足不同需求',
  },
  {
    icon: <UserSwitchOutlined />,
    title: '角色定制',
    description: '可以根据需求定制不同的AI角色，实现个性化对话',
  },
  {
    icon: <ThunderboltOutlined />,
    title: '快速响应',
    description: '高效的响应速度，让对话更加流畅自然',
  },
];

const Home: React.FC = () => {
  return (
    <div>
      <WelcomeSection>
        <StyledTitle level={2}>AI 智能助手</StyledTitle>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          您的智能伙伴，为您提供专业、自然的对话体验
        </Paragraph>
      </WelcomeSection>

      <Row gutter={[16, 16]}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} key={index}>
            <StyledCard bordered={false}>
              <IconWrapper>{feature.icon}</IconWrapper>
              <Title level={4} style={{ textAlign: 'center', marginBottom: '12px' }}>
                {feature.title}
              </Title>
              <Paragraph style={{ textAlign: 'center', color: '#666', marginBottom: 0 }}>
                {feature.description}
              </Paragraph>
            </StyledCard>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home; 