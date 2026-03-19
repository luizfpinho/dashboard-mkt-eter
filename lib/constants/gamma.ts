export const GAMMA_THEMES = [
  { id: 'default-light', name: 'Basic Light', description: 'Tema padrão claro e profissional' },
  { id: 'default-dark', name: 'Basic Dark', description: 'Tema padrão escuro e elegante' },
  { id: 'chisel', name: 'Chisel', description: 'Profissional e moderno' },
  { id: 'consultant', name: 'Consultant', description: 'Corporativo e formal' },
  { id: 'aurora', name: 'Aurora', description: 'Gradientes vibrantes' },
  { id: 'gamma', name: 'Gamma', description: 'Cores quentes e criativas' },
  { id: 'gamma-dark', name: 'Gamma Dark', description: 'Escuro com gradientes' },
  { id: 'ash', name: 'Ash', description: 'Preto e branco minimalista' },
  { id: 'coal', name: 'Coal', description: 'Cinza profissional' },
  { id: 'electric', name: 'Electric', description: 'Cores vibrantes e modernas' },
  { id: 'blues', name: 'Blues', description: 'Azul profundo e elegante' },
  { id: 'coral-glow', name: 'Coral Glow', description: 'Coral e tons pastéis' },
  { id: 'atmosphere', name: 'Atmosphere', description: 'Gradientes suaves' },
  { id: 'dune', name: 'Dune', description: 'Bege e tons terrosos' },
  { id: 'founder', name: 'Founder', description: 'Escuro e profissional' },
] as const;

export const GAMMA_LANGUAGES = [
  { code: 'pt-br', name: 'Português (Brasil)' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' },
] as const;

export const IMAGE_STYLES = [
  { id: 'photorealistic', name: 'Fotorrealista' },
  { id: 'illustration', name: 'Ilustração' },
  { id: 'abstract', name: 'Abstrato' },
  { id: 'minimalist', name: 'Minimalista' },
  { id: '3d-render', name: 'Render 3D' },
  { id: 'watercolor', name: 'Aquarela' },
  { id: 'corporate', name: 'Corporativo' },
  { id: 'vintage', name: 'Vintage' },
] as const;

export const TONE_PRESETS = [
  { id: 'professional', name: 'Profissional', value: 'professional, executive, data-driven' },
  { id: 'casual', name: 'Casual', value: 'casual, friendly, conversational' },
  { id: 'inspiring', name: 'Inspirador', value: 'inspiring, motivational, energetic' },
  { id: 'formal', name: 'Formal', value: 'formal, academic, technical' },
  { id: 'creative', name: 'Criativo', value: 'creative, innovative, bold' },
  { id: 'educational', name: 'Educativo', value: 'educational, informative, clear' },
  { id: 'persuasive', name: 'Persuasivo', value: 'persuasive, compelling, action-oriented' },
  { id: 'custom', name: 'Personalizado', value: '' },
] as const;
