/**
 * Static template configuration
 * Uses same format as reference project
 */

export interface OvalConfig {
  centerX: number; // percentage (0-1)
  centerY: number; // percentage (0-1)
  radiusX: number; // percentage (0-1)
  radiusY: number; // percentage (0-1)
  rotation: number; // degrees
}

export interface TemplateConfig {
  oval: OvalConfig;
  templateAspectRatio: number;
}

/**
 * Template configuration for face-in-hole feature
 * Same config used for both card-template.svg and kevin-template.svg
 */
export const TEMPLATE_CONFIG: TemplateConfig = {
  oval: {
    centerX: 0.496,
    centerY: 0.581,
    radiusX: 0.206,
    radiusY: 0.224,
    rotation: 0,
  },
  templateAspectRatio: 1.389,
};

