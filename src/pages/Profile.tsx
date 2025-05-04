import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { 
  UserOutlined, 
  WalletOutlined, 
  CalendarOutlined,
  TagOutlined,
  PayCircleOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { Spin, message, Typography, Card, Row, Col, Tag, Modal, Descriptions, Button } from 'antd';
import { fetchUserProfile, UserProfile } from '../services/api';
import UserAvatar from '../components/UserAvatar';
import { useUser } from '../contexts/UserContext';

const { Title, Paragraph, Text } = Typography;

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
  gap: 0;
  height: 100%;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    border-radius: 8px;
  }
`;

const SideSection = styled.div`
  padding: 24px;
  border-right: 1px solid #f0f0f0;
  height: 100%;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }
`;

const MainSection = styled.div`
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fdfdfd;
  min-height: 0;
`;

const UserSection = styled.div`
  text-align: center;
  padding: 16px 0 0 0;
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
  border-radius: 10px;
  margin-top: 24px;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);
  
  .ant-card-body {
    padding: 18px;
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
  padding: 14px;
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

const OrderListContainer = styled.div`
  margin-top: 0;
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
`;

const OrderCard = styled.div`
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 18px 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;

  &:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0f0f0;
`;

const ProductName = styled(Text)`
  font-weight: 600;
  font-size: 17px;
  color: #333;
`;

const OrderStatus = styled(Text)<{ status: string }>`
  font-size: 14px;
  color: ${props => (props.status === '完成' || props.status === '支付成功') ? '#52c41a' : (props.status === '等待支付' ? '#faad14' : '#8c8c8c')};
`;

const OrderDetails = styled.div`
  font-size: 14px;
  color: #555;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailLabel = styled(Text)`
  color: #888;
  display: flex;
  align-items: center;
  gap: 6px;

  .anticon {
    font-size: 14px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #aaa;
  padding: 50px 0;
  font-size: 15px;
`;

interface Order {
  product_name: string;
  product_quota: number;
  order_id: string;
  order_time: string;
  pay_status: string;
  total_amount: number;
  pay_type: string | null;
  pay_time: string | null;
  pay_url: string | null;
}

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { setAvatarUrl, setNickname } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dialogueCount, setDialogueCount] = useState<number>(0);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAllOrdersModalVisible, setIsAllOrdersModalVisible] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const response = await fetchUserProfile();
        if (response.code === '0000') {
          setUserProfile(response.data);
          setAvatarUrl(response.data.avatar);
          setNickname(response.data.user_name);
        } else {
          message.error(response.info || '获取用户信息失败');
        }

        const savedChats = localStorage.getItem('ai_chat_chats');
        if (savedChats) {
          try {
            const chats = JSON.parse(savedChats);
            if (Array.isArray(chats)) {
              setDialogueCount(chats.length);
              
              let totalMessages = 0;
              chats.forEach(chat => {
                if (chat && Array.isArray(chat.messages)) {
                  totalMessages += chat.messages.length;
                }
              });
              setMessageCount(totalMessages);
            }
          } catch (e) {
            console.error("Failed to parse chats from localStorage", e);
            setDialogueCount(0);
            setMessageCount(0);
          }
        } else {
          setDialogueCount(0);
          setMessageCount(0);
        }

        const token = localStorage.getItem('token');
        if (!token) {
          message.error('用户未登录，无法获取订单');
          setOrders([]);
        } else {
          const orderResponse = await fetch('http://124.221.174.50:80/api/v1/user/order/list', {
            method: 'GET',
            headers: {
              'Authorization': `${token}`,
              'Content-Type': 'application/json'
            },
          });

          if (!orderResponse.ok) {
             try {
                const errorData = await orderResponse.json();
                throw new Error(errorData.info || `HTTP error! status: ${orderResponse.status}`);
             } catch (parseError) {
                throw new Error(`HTTP error! status: ${orderResponse.status} - ${orderResponse.statusText}`);
             }
          }

          const orderData = await orderResponse.json();

          if (orderData.code === '0000' && Array.isArray(orderData.data)) {
             const formattedOrders = orderData.data.map((item: any): Order => ({
               product_name: item.product_name,
               product_quota: item.product_quota,
               order_id: item.order_id,
               order_time: item.order_time,
               pay_status: item.pay_status,
               total_amount: item.total_amount,
               pay_type: item.pay_type,
               pay_time: item.pay_time,
               pay_url: item.pay_url,
             }));
            setOrders(formattedOrders);
          } else if (orderData.code !== '0000') {
             message.error(orderData.info || '获取订单列表失败');
             setOrders([]);
          } else {
             console.error('Unexpected order data format:', orderData);
             message.error('获取订单列表失败：格式错误');
             setOrders([]);
          }
        }

      } catch (error) {
        console.error('获取数据失败:', error);
        const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
        message.error(errorMessage);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [setAvatarUrl, setNickname]);

  const formatOrderTime = (timeString: string | null) => {
    if (!timeString) return '-';
    try {
      return new Date(timeString).toLocaleString('zh-CN', { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return timeString;
    }
  };

  const getStatusColor = (status: string): string => {
    if (status === '完成' || status === '支付成功' || status === '支付完成') return 'success';
    if (status === '等待支付') return 'warning';
    if (status === '已关闭' || status === '支付失败') return 'error';
    if (status === '放弃支付') return 'default';
    return 'default';
  };

  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const showAllOrdersModal = () => {
    setIsAllOrdersModalVisible(true);
  };

  const handleAllOrdersCancel = () => {
    setIsAllOrdersModalVisible(false);
  };

  const handlePayNow = (payUrl: string | null | undefined) => {
    if (payUrl) {
       console.log("Attempting to execute payment HTML:", payUrl);
      
       const newWindow = window.open('', '_blank');

       if (newWindow) {
         newWindow.document.write(payUrl); 
         newWindow.document.close(); 
         console.log("Payment HTML written to new window.");
       } else {
         console.error("Failed to open new window. It might be blocked by a popup blocker.");
         message.warning('无法打开支付页面，请检查是否禁用了弹出窗口。');
       }
    }
  };

  if (loading && !userProfile) {
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
        <SideSection>
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
                 <StatValue>{dialogueCount}</StatValue>
                 <StatLabel>对话数</StatLabel>
               </StatCard>
               <StatCard>
                 <StatValue>{messageCount}</StatValue>
                 <StatLabel>消息数</StatLabel>
               </StatCard>
             </StatsGrid>
           </UserSection>
         </SideSection>

        <MainSection>
          <SectionHeader>
             <Title level={4} style={{ marginBottom: 0 }}>我的订单</Title> 
             <Button 
               type="text"
               icon={<UnorderedListOutlined />}
               onClick={showAllOrdersModal}
               style={{ color: '#595959' }}
             >
               全部订单
             </Button>
          </SectionHeader>
          
          <OrderListContainer>
            {loading && orders.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                 <Spin />
              </div>
            ) : !loading && orders.length === 0 ? (
              <EmptyState>暂无订单记录</EmptyState>
            ) : (
              orders.map((order, index) => (
                <OrderCard 
                  key={order.order_id || index} 
                  onClick={() => showOrderDetails(order)}
                  style={{ cursor: 'pointer' }}
                >
                  <OrderHeader>
                    <ProductName>{order.product_name}</ProductName>
                    <Tag color={getStatusColor(order.pay_status)} style={{ fontSize: '13px' }}>
                      {order.pay_status}
                    </Tag>
                  </OrderHeader>
                  <OrderDetails>
                     <DetailRow>
                       <DetailLabel><TagOutlined />订单号:</DetailLabel>
                       <Text code>{order.order_id}</Text>
                     </DetailRow>
                     <DetailRow>
                       <DetailLabel><WalletOutlined />购买余额:</DetailLabel>
                       <Text strong>{order.product_quota}</Text>
                     </DetailRow>
                      <DetailRow>
                         <DetailLabel><PayCircleOutlined />总金额:</DetailLabel>
                         <Text strong style={{ color: '#1890ff' }}>¥ {order.total_amount?.toFixed(2) || '0.00'}</Text>
                      </DetailRow>
                      <DetailRow>
                       <DetailLabel><CalendarOutlined />下单时间:</DetailLabel>
                       <Text>{formatOrderTime(order.order_time)?.split(' ')[0] || '-'}</Text>
                     </DetailRow>
                   </OrderDetails>
                </OrderCard>
              ))
            )}
          </OrderListContainer>
        </MainSection>
      </ProfileGrid>

      {selectedOrder && (
        <Modal
          title="订单详情"
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={600}
          bodyStyle={{ paddingTop: '20px', paddingBottom: '20px' }}
        >
          <Descriptions 
            column={1} 
            size="default"
            labelStyle={{ color: '#888', width: '100px' }}
            contentStyle={{ fontWeight: 500, color: '#333' }}
          >
            <Descriptions.Item label="商品名称" >
              <Text strong style={{fontSize: '16px'}}>{selectedOrder.product_name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="订单号">
              <Text code>{selectedOrder.order_id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="购买余额">{selectedOrder.product_quota}</Descriptions.Item>
            <Descriptions.Item label="订单金额">
                 <Text strong style={{ color: '#1890ff' }}>¥ {selectedOrder.total_amount?.toFixed(2) || '0.00'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="下单时间">{formatOrderTime(selectedOrder.order_time)}</Descriptions.Item>
            <Descriptions.Item label="支付状态">
              <Tag color={getStatusColor(selectedOrder.pay_status)} style={{fontSize: '13px'}}>{selectedOrder.pay_status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="支付方式">{selectedOrder.pay_type || '-'}</Descriptions.Item>
            <Descriptions.Item label="支付时间">{formatOrderTime(selectedOrder.pay_time)}</Descriptions.Item>
          </Descriptions>
          
          {selectedOrder.pay_status === '等待支付' && selectedOrder.pay_url && (
            <div style={{ marginTop: '24px', textAlign: 'right' }}> 
              <Button 
                type="primary" 
                onClick={() => handlePayNow(selectedOrder.pay_url)}
              >
                立即支付 ￥{selectedOrder.total_amount}
              </Button>
            </div>
          )}
        </Modal>
      )}

      <Modal
          title="全部订单"
          visible={isAllOrdersModalVisible}
          onCancel={handleAllOrdersCancel}
          footer={null}
          width={800}
          bodyStyle={{ padding: '0' }}
       >
         <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '20px' }}> 
             {loading && orders.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                 <Spin />
              </div>
            ) : !loading && orders.length === 0 ? (
              <EmptyState>暂无订单记录</EmptyState>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}> 
                 {orders.map((order, index) => (
                    <OrderCard 
                      key={`modal-${order.order_id || index}`}
                      onClick={() => {
                           showOrderDetails(order); 
                      }}
                      style={{ cursor: 'pointer' }} 
                    > 
                      <OrderHeader>
                         <ProductName>{order.product_name}</ProductName>
                         <Tag color={getStatusColor(order.pay_status)} style={{ fontSize: '13px' }}>
                           {order.pay_status}
                         </Tag>
                      </OrderHeader>
                      <OrderDetails>
                          <DetailRow>
                           <DetailLabel><TagOutlined />订单号:</DetailLabel>
                           <Text code>{order.order_id}</Text>
                         </DetailRow>
                         <DetailRow>
                           <DetailLabel><WalletOutlined />购买余额:</DetailLabel>
                           <Text strong>{order.product_quota}</Text>
                         </DetailRow>
                          <DetailRow>
                             <DetailLabel><PayCircleOutlined />总金额:</DetailLabel>
                             <Text strong style={{ color: '#1890ff' }}>¥ {order.total_amount?.toFixed(2) || '0.00'}</Text>
                          </DetailRow>
                           <DetailRow>
                            <DetailLabel><CalendarOutlined />下单时间:</DetailLabel>
                            <Text>{formatOrderTime(order.order_time)?.split(' ')[0] || '-'}</Text> 
                           </DetailRow>
                       </OrderDetails>
                    </OrderCard>
                 ))}
               </div>
            )}
         </div>
       </Modal>
    </ProfileContainer>
  );
};

export default Profile; 