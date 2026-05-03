export interface ProjectData {
  id: string;
  title: string;
  description: string;
  logoSrc: string;
  logoWidth?: number;
  logoHeight?: number;
  siteUrl: string;
  whatsappText?: string;
  backgroundImage?: string;
  backgroundImageMobile?: string;
  isLast?: boolean;
  created_at?: string;
  updated_at?: string;
  display_order?: number;
}
