import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  avatarUrl: string | undefined;
  setAvatarUrl: (url: string) => void;
  nickname: string;
  setNickname: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(() => {
    // 从localStorage中获取保存的头像URL
    return localStorage.getItem('userAvatarUrl') || undefined;
  });
  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem('userNickname') || '用户';
  });

  const handleSetAvatarUrl = (url: string) => {
    setAvatarUrl(url);
    localStorage.setItem('userAvatarUrl', url);
  };

  const handleSetNickname = (name: string) => {
    setNickname(name);
    localStorage.setItem('userNickname', name);
  };

  return (
    <UserContext.Provider
      value={{
        avatarUrl,
        setAvatarUrl: handleSetAvatarUrl,
        nickname,
        setNickname: handleSetNickname,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 