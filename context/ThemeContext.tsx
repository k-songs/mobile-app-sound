import React, { createContext, useContext, useState } from 'react';

export type ThemeType = 'pink' | 'blue' | 'sunset';

export const colorThemes = {
  pink: ["#ff9a9e", "#fecfef", "#fecfef"],        // 현재 붉은 계통
  blue: ["#e0c3fc", "#9bb5ff", "#74b9ff"],       // 보라/블루 계통
  sunset: ["#ffecd2", "#fcb69f", "#ff8a80"],     // 오렌지/코랄 계통
};

// 테마별 아이콘과 설명
export const themeInfo = {
  pink: { icon: '🌸', label: '핑크 테마', description: '따뜻한 핑크 그래디언트' },
  blue: { icon: '💙', label: '블루 테마', description: '시원한 블루 그래디언트' },
  sunset: { icon: '🌅', label: '석양 테마', description: '아름다운 석양 그래디언트' },
};

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colors: string[];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'pink',
  setTheme: () => {},
  colors: colorThemes.pink,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>('pink');
  const colors = colorThemes[theme];
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);