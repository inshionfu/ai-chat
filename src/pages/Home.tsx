import React from 'react';
import styled from 'styled-components';
import { Typography, Card, Row, Col } from 'antd';
import { RobotOutlined, MessageOutlined, UserSwitchOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomeContainer = styled.div`
  width: 100%;
  min-height: 100%;
  background-color: #f5f7fa;
  padding: 24px;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 48px;
  padding: 48px 20px;
  background: linear-gradient(135deg, #1890ff08 0%, #1890ff15 100%);
  border-radius: 16px;
`;

const MainTitle = styled(Title)`
  margin-bottom: 16px !important;
  background: linear-gradient(120deg, #1890ff, #096dd9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
`;

const SubTitle = styled(Paragraph)`
  font-size: 18px;
  color: #666;
  max-width: 600px;
  margin: 0 auto !important;
`;

const FeatureCard = styled(Card)`
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: none;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  .ant-card-body {
    padding: 32px 24px;
  }
`;

const IconWrapper = styled.div`
  font-size: 36px;
  color: #1890ff;
  margin-bottom: 20px;
  text-align: center;
  
  .anticon {
    background: #1890ff10;
    padding: 16px;
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  ${FeatureCard}:hover & .anticon {
    background: #1890ff20;
    transform: scale(1.1);
  }
`;

const FeatureTitle = styled(Title)`
  text-align: center;
  margin-bottom: 12px !important;
  font-size: 20px !important;
`;

const FeatureDescription = styled(Paragraph)`
  text-align: center;
  color: #666;
  font-size: 15px;
  margin-bottom: 0 !important;
  line-height: 1.6;
`;

const features = [
  {
    icon: <RobotOutlined />,
    title: '智能对话',
    description: '基于先进的AI模型，提供自然、流畅的对话体验，让交流更加智能和高效。',
  },
  {
    icon: <MessageOutlined />,
    title: '多场景应用',
    description: '支持多种对话场景，从日常聊天到专业咨询，满足您的各类需求。',
  },
  {
    icon: <UserSwitchOutlined />,
    title: '角色定制',
    description: '根据需求定制不同的AI角色，打造个性化的对话体验，让交互更加灵活。',
  },
  {
    icon: <ThunderboltOutlined />,
    title: '快速响应',
    description: '采用高性能架构，确保对话响应迅速，让您的使用体验更加流畅自然。',
  },
];

const Home: React.FC = () => {
  return (
    <HomeContainer>
      <ContentWrapper>
        <WelcomeSection>
          <MainTitle level={1}>AI 智能对话助手</MainTitle>
          <SubTitle>
            您的智能伙伴，为您提供专业、自然的对话体验，让沟通更加轻松愉快
          </SubTitle>
        </WelcomeSection>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <FeatureCard bordered={false}>
                <IconWrapper>{feature.icon}</IconWrapper>
                <FeatureTitle level={4}>
                  {feature.title}
                </FeatureTitle>
                <FeatureDescription>
                  {feature.description}
                </FeatureDescription>
              </FeatureCard>
            </Col>
          ))}
        </Row>
      </ContentWrapper>
    </HomeContainer>
  );
};

export default Home; 