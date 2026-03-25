import { CardConfig } from '../types';
import { DEFAULT_CONFIG } from '../defaultConfig';

export const loadConfig = async (): Promise<CardConfig> => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}config.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`);
    }
    const config = await response.json();
    // Basic validation
    if (!config.profile || !config.features || !config.theme) {
      throw new Error("Invalid configuration structure");
    }
    return config as CardConfig;
  } catch (error) {
    console.error("Error loading config, using default:", error);
    return DEFAULT_CONFIG;
  }
};
