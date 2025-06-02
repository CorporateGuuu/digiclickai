// DigiClick AI Type Definitions

export interface MousePosition {
  x: number;
  y: number;
  isMoving: boolean;
  velocity: { x: number; y: number };
  getSpeed: () => number;
}

export interface CursorConfig {
  theme?: 'default' | 'glow' | 'minimal';
  showTrail?: boolean;
  trailLength?: number;
  sensitivity?: number;
  easing?: number;
}

export interface ParticlesConfig {
  particles: {
    number: {
      value: number;
      density: {
        enable: boolean;
        value_area: number;
      };
    };
    color: {
      value: string;
    };
    shape: {
      type: string;
    };
    opacity: {
      value: number;
      random: boolean;
    };
    size: {
      value: number;
      random: boolean;
    };
    line_linked: {
      enable: boolean;
      distance: number;
      color: string;
      opacity: number;
      width: number;
    };
    move: {
      enable: boolean;
      speed: number;
      direction: string;
      random: boolean;
      straight: boolean;
      out_mode: string;
      bounce: boolean;
    };
  };
  interactivity: {
    detect_on: string;
    events: {
      onhover: {
        enable: boolean;
        mode: string;
      };
      onclick: {
        enable: boolean;
        mode: string;
      };
      resize: boolean;
    };
  };
  retina_detect: boolean;
}

export interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showParticles?: boolean;
  showCursor?: boolean;
  showChatbot?: boolean;
  className?: string;
  cursorTheme?: 'default' | 'glow' | 'minimal';
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name?: string) => Promise<void>;
}

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  service?: string;
  budget?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  price?: string;
  popular?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Environment Variables
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
}

// Component Props
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Animation Types
export interface GSAPAnimation {
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
  scrollTrigger?: {
    trigger: string;
    start?: string;
    end?: string;
    scrub?: boolean;
    pin?: boolean;
  };
}

// Particles.js Window Extension
declare global {
  interface Window {
    particlesJS: (tagId: string, config: ParticlesConfig) => void;
    pJSDom: any[];
  }
}
