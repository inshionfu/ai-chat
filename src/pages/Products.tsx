import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Row, Col, Spin, Empty, message, Button } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, GiftOutlined } from '@ant-design/icons';
import { fetchProductList, Product } from '../services/api';

// 样式组件
const ProductsContainer = styled.div`
  padding: 32px;
  min-height: 100%;
  background: #f0f2f5;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24px;
  text-align: center;
`;

const ProductCard = styled(Card)`
  height: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImage = styled.div<{ bgUrl?: string }>`
  height: 200px;
  background: ${props => props.bgUrl ? `url(${props.bgUrl})` : '#f5f5f5'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
`;

const ProductName = styled.h3`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 500;
`;

const ProductDesc = styled.p`
  color: #666;
  margin-bottom: 16px;
  min-height: 40px;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PriceTag = styled.div`
  font-size: 24px;
  color: #f5222d;
  font-weight: 600;
  line-height: 1;
  
  small {
    font-size: 14px;
    margin-right: 2px;
    font-weight: normal;
  }
`;

const QuotaTag = styled.div`
  color: #52c41a;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #f0f0f0;
`;

const BuyButton = styled(Button)`
  width: 100%;
  height: 40px;
  font-size: 16px;
  border-radius: 8px;
  margin-top: 8px;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await fetchProductList();
        
        if (response.code === '0000') {
          setProducts(response.data);
        } else {
          setError(response.info);
          message.error(response.info);
        }
      } catch (err) {
        console.error('获取商品列表失败:', err);
        setError('获取商品列表失败，请稍后重试');
        message.error('获取商品列表失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleBuy = (product: Product) => {
    // TODO: 实现购买逻辑
    message.info(`正在准备购买商品：${product.productName}`);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spin size="large" tip="加载商品信息..." />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <LoadingContainer>
        <Empty
          description={error}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </LoadingContainer>
    );
  }

  return (
    <ProductsContainer>
      <PageTitle>
        <GiftOutlined style={{ marginRight: 12 }} />
        商品列表
      </PageTitle>
      <Row gutter={[24, 24]}>
        {products.map(product => (
          <Col key={product.productId} xs={24} sm={12} md={8} lg={6}>
            <ProductCard hoverable>
              <ProductImage bgUrl={product.pic || undefined}>
                {!product.pic && <ShoppingCartOutlined />}
              </ProductImage>
              <ProductName title={product.productName}>
                {product.productName}
              </ProductName>
              <ProductDesc title={product.productDesc}>
                {product.productDesc}
              </ProductDesc>
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
        ))}
      </Row>
    </ProductsContainer>
  );
};

export default Products; 