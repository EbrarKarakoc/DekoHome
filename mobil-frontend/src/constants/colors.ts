const Colors = {
  primary: '#D48806', // Exact web mustard yellow
  primaryLight: '#EAB308',
  primaryDark: '#A16207',

  background: '#FAFAF9',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F5F4', // Light background for cards/sections
  border: '#E5E7EB',

  text: '#111827',
  textSecondary: '#4B5563', // Slightly darker for better readability
  textMuted: '#9CA3AF',

  success: '#059669', // Emerald
  error: '#DC2626', // Red
  warning: '#D97706', // Amber
  info: '#2563EB', // Blue

  glassEffect: 'rgba(255, 255, 255, 0.8)',
  boxShadow: [{ color: 'rgba(0, 0, 0, 0.1)', offsetX: 0, offsetY: 4, blur: 12 }],

  statusApproved: '#F59E0B',
  statusPreparing: '#3B82F6',
  statusShipped: '#8B5CF6',
  statusDelivered: '#22C55E',
  statusCancelled: '#EF4444',
} as const;

export default Colors;
