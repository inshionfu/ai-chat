import React from 'react';
import styled from 'styled-components';
import { Typography, Card, Row, Col } from 'antd';
import { RobotOutlined, MessageOutlined, UserSwitchOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomeContainer = styled.div`
  width: 100%;
  min-height: 100%;
  background: linear-gradient(to bottom, #ffffff, #f0f2f5 300px); // 更柔和的背景渐变
  padding: 40px; // 增加内边距
  box-sizing: border-box;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 64px; // 增加下边距
  padding: 64px 20px; // 增加内边距
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path fill="%23e6f7ff" d="M50 0 L100 50 L50 100 L0 50 Z" opacity="0.1"/></svg>'), 
              linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%); // 添加微妙的背景图案和调整渐变
  border-radius: 20px; // 更大的圆角
  position: relative;
  overflow: hidden;
`;

const MainTitle = styled(Title)`
  margin-bottom: 20px !important;
  font-size: 3.5em !important; // 增大标题字号
  font-weight: 700 !important;
  background: linear-gradient(120deg, #1890ff, #36cfc9); // 调整渐变色
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  letter-spacing: -1px;
`;

const SubTitle = styled(Paragraph)`
  font-size: 18px;
  color: #555; // 稍深的颜色
  max-width: 650px;
  margin: 0 auto 24px auto !important; // 增加下边距
  line-height: 1.7;
`;

const FeatureCard = styled(Card)`
  height: 100%;
  border-radius: 16px; // 更大的圆角
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06); // 调整阴影
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); // 更平滑的过渡
  border: 1px solid #e8e8e8; // 添加细边框
  background: white;
  display: flex; // 使用 flex 布局
  flex-direction: column; // 垂直排列

  &:hover {
    transform: translateY(-8px); // 悬浮效果更明显
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1); // 悬浮阴影
    border-color: #1890ff;
  }

  .ant-card-body {
    padding: 32px 24px;
    flex-grow: 1; // 让内容区域填充剩余空间
    display: flex;
    flex-direction: column;
    justify-content: space-between; // 内容垂直分布
  }
`;

const IconWrapper = styled.div`
  font-size: 40px; // 增大图标尺寸
  color: #1890ff;
  margin-bottom: 24px;
  text-align: center;
  
  .anticon {
    background: linear-gradient(135deg, #e6f7ff, #f0faff); // 图标背景渐变
    padding: 20px;
    border-radius: 16px; // 更大的圆角
    display: inline-block;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(24, 144, 255, 0.1);
  }

  ${FeatureCard}:hover & .anticon {
    background: linear-gradient(135deg, #d6f0ff, #e0f6ff);
    transform: scale(1.1) rotate(5deg); // 悬浮时旋转效果
    box-shadow: 0 4px 8px rgba(24, 144, 255, 0.2);
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
  min-height: 72px; // 设置最小高度以对齐 (15px * 1.6 * 3 lines approx)
  display: flex; // 使用 flex 确保内容垂直居中（如果需要）
  align-items: center;
  justify-content: center;
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