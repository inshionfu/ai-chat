import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Row, Col, Spin, Empty, message, Button, Tooltip } from 'antd'; // Import Tooltip
import { ShoppingCartOutlined, DollarOutlined, GiftOutlined } from '@ant-design/icons';
import { fetchProductList, Product, createOrder } from '../services/api'; // Import createOrder

// 样式组件
const ProductsContainer = styled.div`
  padding: 40px; // 增加内边距
  min-height: 100%;
  background: linear-gradient(to bottom, #ffffff, #f0f2f5 200px); // 添加渐变背景
`;

const PageTitle = styled.h1`
  font-size: 32px; // 增大标题字号
  font-weight: 700; // 加粗
  color: #333; // 深色标题
  margin-bottom: 32px; // 增加下边距
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px; // 图标和文字间距
`;

const ProductCard = styled(Card)`
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 12px; // 更圆的卡片角
  border: 1px solid #e8e8e8; // 添加细边框

  .ant-card-body {
    padding: 20px; // 调整卡片内部 padding
    display: flex;
    flex-direction: column;
    height: 100%; // 确保 body 占满卡片高度
  }

  &:hover {
    transform: translateY(-6px); // 稍微增加悬浮效果
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1); // 调整阴影
    border-color: #1890ff; // 悬浮时边框变色
  }
`;

const ProductImage = styled.div<{ bgUrl?: string }>`
  height: 180px; // 调整图片高度
  background: ${props => props.bgUrl ? `url(${props.bgUrl})` : 'linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%)'}; // 渐变背景作为占位符
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 8px; // 图片圆角
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #90a4ae; // 占位符图标颜色
`;

const ProductName = styled.h3`
  margin: 0 0 8px;
  font-size: 16px; // 调整名称字号
  font-weight: 600; // 加粗
  color: #333;
  // 文字溢出处理
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProductDesc = styled.p`
  color: #777; // 调整描述颜色
  margin-bottom: 16px;
  font-size: 13px; // 调整描述字号
  line-height: 1.5;
  // 多行文字溢出处理
  display: -webkit-box;
  -webkit-line-clamp: 2; // 最多显示 2 行
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 39px; // 2 行的高度 (13px * 1.5 * 2)
  flex-grow: 1; // 让描述占据多余空间，将价格和按钮推到底部
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto; // 将信息推到底部
`;

const PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PriceTag = styled.div`
  font-size: 26px; // 调整价格字号
  color: #ff4d4f; // 更鲜艳的红色
  font-weight: 700; // 加粗
  line-height: 1;

  small {
    font-size: 14px;
    margin-right: 2px;
    font-weight: normal;
    color: #ff7875; // 调整小字体颜色
  }
`;

const QuotaTag = styled.div`
  color: #52c41a;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px; // 调整间距
  padding-bottom: 12px;
  border-bottom: 1px dashed #e8e8e8; // 调整分隔线颜色
`;

const BuyButton = styled(Button)`
  width: 100%;
  height: 40px;
  font-size: 16px;
  border-radius: 8px;
  margin-top: 12px; // 调整按钮上边距
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 150px); // 调整加载时的高度
`;

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error on load
        const response = await fetchProductList();

        if (response.code === '0000') {
          setProducts(response.data);
        } else {
          setError(response.info || '加载商品失败');
          message.error(response.info || '加载商品失败');
        }
      } catch (err) { // Catch block should handle errors properly
        console.error('获取商品列表失败:', err);
        const errorMsg = '获取商品列表失败，请检查网络连接或稍后重试';
        setError(errorMsg);
        message.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleBuy = async (product: Product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('请先登录！');
      // Optionally redirect to login page
      // navigate('/login');
      return;
    }

    message.loading(`正在处理购买请求: ${product.productName}...`, 0); // Show loading indefinitely

    try {
      const response = await createOrder(product.productId, token);
      message.destroy(); // Close loading message

      if (response.code === '0000') {
        message.success('下单成功，正在跳转到支付页面...', 2);
        // Create a temporary div to hold the form HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = response.data; // Inject the form HTML

        // Find the form element
        const form = tempDiv.querySelector('form');
        if (form) {
          document.body.appendChild(form); // Append the form to the body
          form.submit(); // Submit the form automatically
          // Optional: Remove the form after submission attempt if needed
          // setTimeout(() => document.body.removeChild(form), 1000);
        } else {
          console.error('未在响应数据中找到表单:', response.data);
          message.error('支付表单加载失败，请稍后重试');
        }
      } else {
        message.error(response.info || '下单失败，请稍后重试');
      }
    } catch (err) {
      message.destroy(); // Close loading message on error
      console.error('创建订单失败:', err);
      message.error('创建订单时发生错误，请检查网络或稍后重试');
    }
  };

  if (loading) {
    return (
      <ProductsContainer>
        <LoadingContainer>
          <Spin size="large" tip="正在加载商品..." />
        </LoadingContainer>
      </ProductsContainer>
    );
  }

  if (error) {
    return (
      <ProductsContainer>
        <LoadingContainer>
          <Empty
            description={error}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </LoadingContainer>
      </ProductsContainer>
    );
  }

  return (
    <ProductsContainer>
      <PageTitle>
        <GiftOutlined />
        商品橱窗
      </PageTitle>
      <Row gutter={[32, 32]}> {/* 增加 gutter */} 
        {products.length > 0 ? (
          products.map(product => (
            <Col key={product.productId} xs={24} sm={12} md={8} lg={6}>
              <ProductCard hoverable>
                <ProductImage bgUrl={product.pic || undefined}>
                  {!product.pic && <ShoppingCartOutlined />}
                </ProductImage>
                <Tooltip title={product.productName}> {/* Add Tooltip for long names */} 
                  <ProductName>
                    {product.productName}
                  </ProductName>
                </Tooltip>
                <Tooltip title={product.productDesc}> {/* Add Tooltip for long descriptions */} 
                  <ProductDesc>
                    {product.productDesc || '暂无描述'}
                  </ProductDesc>
                </Tooltip>
                <ProductInfo>
                  <PriceInfo>
                    <PriceTag>
                      <small>¥</small>
                      {product.price.toFixed(2)}
                    </PriceTag>
                    <QuotaTag>
                      <DollarOutlined />
                      充值额度：{product.quota}
                    </QuotaTag>
                  </PriceInfo>
                  <BuyButton
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => handleBuy(product)}
                  >
                    立即购买
                  </BuyButton>
                </ProductInfo>
              </ProductCard>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description="暂无商品" />
          </Col>
        )}
      </Row>
    </ProductsContainer>
  );
};

export default Products;