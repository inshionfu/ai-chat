import React from 'react';
import { Upload, message, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { useUser } from '../contexts/UserContext';

const AvatarWrapper = styled.div`
  text-align: center;
  margin-bottom: 24px;
  cursor: pointer;

  .ant-avatar {
    &:hover {
      opacity: 0.8;
    }
  }
`;

const UserAvatar: React.FC = () => {
  const { avatarUrl, setAvatarUrl } = useUser();

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('您只能上传图片文件！');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB！');
    }
    return isImage && isLt2M;
  };

  const handleChange = async (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      return;
    }
    
    if (info.file.status === 'done') {
      const response = info.file.response;
      if (response.code === '0000') {
        setAvatarUrl(response.data);
        message.success('头像上传成功！');
      } else {
        message.error(response.info || '上传失败，请重试');
      }
    }

    if (info.file.status === 'error') {
      message.error('上传失败，请重试');
    }
  };

  const token = localStorage.getItem('token');

  return (
    <AvatarWrapper>
      <Upload
        name="file"
        action="http://124.221.174.50:80/api/v1/user/avatar/upload"
        headers={{
          Authorization: token || ''
        }}
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        <Avatar
          size={100}
          icon={!avatarUrl && <UserOutlined />}
          src={avatarUrl}
        />
      </Upload>
    </AvatarWrapper>
  );
};

export default UserAvatar; 