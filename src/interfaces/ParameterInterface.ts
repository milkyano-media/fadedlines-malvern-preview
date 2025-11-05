/**
 * Parameter Interface
 *
 * This interface defines the structure for parameterized content
 * that allows dynamic website appearance changes.
 */

export interface Parameter {
  id: string;
  key: string;
  value: string | number | boolean | object;
  type: ParameterType;
  category: ParameterCategory;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  COLOR = 'color',
  JSON = 'json',
  IMAGE_URL = 'image_url',
  URL = 'url'
}

export enum ParameterCategory {
  THEME = 'theme',
  BRANDING = 'branding',
  LAYOUT = 'layout',
  CONTENT = 'content',
  FEATURE_FLAG = 'feature_flag',
  SEO = 'seo',
  ANALYTICS = 'analytics'
}

// Request/Response types
export interface ParameterListResponse {
  parameters: Parameter[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ParameterResponse {
  parameter: Parameter;
  message?: string;
}

export interface CreateParameterRequest {
  key: string;
  value: string | number | boolean | object;
  type: ParameterType;
  category: ParameterCategory;
  description?: string;
  is_active?: boolean;
}

export interface UpdateParameterRequest {
  key?: string;
  value?: string | number | boolean | object;
  type?: ParameterType;
  category?: ParameterCategory;
  description?: string;
  is_active?: boolean;
}

export interface ParameterQueryParams {
  category?: ParameterCategory;
  type?: ParameterType;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'key' | 'category' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

// Utility type for strongly-typed parameter values by key
export interface ParameterValues {
  // Theme parameters
  'theme.primary_color'?: string;
  'theme.secondary_color'?: string;
  'theme.background_color'?: string;
  'theme.text_color'?: string;
  'theme.font_family'?: string;

  // Branding parameters
  'branding.logo_url'?: string;
  'branding.company_name'?: string;
  'branding.tagline'?: string;
  'branding.favicon_url'?: string;

  // Layout parameters
  'layout.header_style'?: 'fixed' | 'static' | 'sticky';
  'layout.footer_style'?: 'minimal' | 'full';
  'layout.sidebar_enabled'?: boolean;

  // Content parameters
  'content.homepage_hero_title'?: string;
  'content.homepage_hero_subtitle'?: string;
  'content.cta_button_text'?: string;

  // Feature flags
  'feature.booking_enabled'?: boolean;
  'feature.chat_support_enabled'?: boolean;
  'feature.loyalty_program_enabled'?: boolean;

  // SEO parameters
  'seo.meta_title'?: string;
  'seo.meta_description'?: string;
  'seo.meta_keywords'?: string;

  // Analytics parameters
  'analytics.google_analytics_id'?: string;
  'analytics.facebook_pixel_id'?: string;
}

// Error response type
export interface ParameterErrorResponse {
  error: string;
  message: string;
  status: number;
}
