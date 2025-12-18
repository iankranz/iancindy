/**
 * Static template configuration
 * Uses same format as reference project
 * TODO: Update with actual measured values from templates
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
    centerX: 0.5, // 50% - center horizontally
    centerY: 0.45, // 45% - slightly above center
    radiusX: 0.2, // 20% of width
    radiusY: 0.25, // 25% of height
    rotation: 0, // no rotation
  },
  templateAspectRatio: 1.389, // 1000 x 1389 (height/width)
};

