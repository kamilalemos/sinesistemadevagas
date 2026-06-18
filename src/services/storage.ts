/**
 * Centralized Storage Service
 * Handles all localStorage operations with validation and error protection
 */

export const generateStorageKey = (prefix: string, ...parts: (string | number)[]) => {
  return `${prefix}_${parts.join('_')}`;
};

export const saveData = <T>(key: string, data: T): boolean => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage [${key}]:`, error);
    return false;
  }
};

export const loadData = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    
    const parsed = JSON.parse(saved);
    
    // Simple validation for array vs object mismatch
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      console.warn(`Type mismatch for [${key}]: expected array, got ${typeof parsed}. Returning default.`);
      return defaultValue;
    }
    
    return parsed as T;
  } catch (error) {
    console.error(`Error loading from localStorage [${key}]:`, error);
    // If data is corrupted, we might want to clear it, but for safety just return default
    return defaultValue;
  }
};

