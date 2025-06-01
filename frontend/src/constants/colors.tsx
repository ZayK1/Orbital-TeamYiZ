// Color palette for the app
export const colors = {
  primary: '#3A6EA5', 
  primaryLight: '#EBF2FA', 
  secondary: '#FF6B6B', 
  secondaryLight: '#FFE2E2', 
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A2C42', 
  textSecondary: '#6E7A8A', 
  border: '#E5E9F0',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  error: '#F44336',
  errorLight: '#FFEBEE',
  placeholder: '#A0AEC0',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  gray100: '#F7FAFC',
  gray200: '#EDF2F7',
  gray300: '#E2E8F0',
};

export default {
  light: {
    text: colors.text,
    background: colors.background,
    tint: colors.primary,
    tabIconDefault: colors.textSecondary,
    tabIconSelected: colors.primary,
  },
};