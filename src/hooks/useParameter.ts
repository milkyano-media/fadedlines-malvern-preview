import { useState, useEffect, useCallback } from 'react';
import {
  Parameter,
  ParameterCategory,
  ParameterValues,
} from '@/interfaces/ParameterInterface';
import { getActiveParameters, getParameterByKey } from '@/utils/parameterApi';

/**
 * Custom hook for accessing and managing parameters
 *
 * Usage examples:
 *
 * // Get all active parameters
 * const { parameters, loading, error } = useParameter();
 *
 * // Get parameters by category
 * const { parameters, loading } = useParameter({ category: ParameterCategory.THEME });
 *
 * // Get a specific parameter by key
 * const { parameter, loading } = useParameter({ key: 'theme.primary_color' });
 *
 * // Get parameter with type-safe value accessor
 * const primaryColor = useParameterValue<string>('theme.primary_color', '#000000');
 */

interface UseParameterOptions {
  category?: ParameterCategory;
  key?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseParameterReturn {
  parameters: Parameter[];
  parameter: Parameter | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage parameters
 */
export function useParameter(options: UseParameterOptions = {}): UseParameterReturn {
  const { category, key, autoRefresh = false, refreshInterval = 60000 } = options;

  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [parameter, setParameter] = useState<Parameter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (key) {
        // Fetch single parameter by key
        const response = await getParameterByKey(key);
        setParameter(response.parameter);
        setParameters([response.parameter]);
      } else {
        // Fetch all active parameters (optionally filtered by category)
        const response = await getActiveParameters(category);
        setParameters(response.parameters);
        setParameter(response.parameters[0] || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch parameters'));
      setParameters([]);
      setParameter(null);
    } finally {
      setLoading(false);
    }
  }, [category, key]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    parameters,
    parameter,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook to get a specific parameter value with type safety and default fallback
 *
 * @param key - Parameter key
 * @param defaultValue - Default value if parameter not found or inactive
 * @returns The parameter value or default value
 *
 * @example
 * const primaryColor = useParameterValue<string>('theme.primary_color', '#000000');
 * const isFeatureEnabled = useParameterValue<boolean>('feature.booking_enabled', false);
 * const maxItems = useParameterValue<number>('layout.max_items', 10);
 */
export function useParameterValue<T = string>(
  key: keyof ParameterValues,
  defaultValue: T
): T {
  const [value, setValue] = useState<T>(defaultValue);
  const { parameter, loading } = useParameter({ key: key as string });

  useEffect(() => {
    if (!loading && parameter?.is_active) {
      setValue((parameter.value as T) ?? defaultValue);
    } else if (!loading) {
      setValue(defaultValue);
    }
  }, [parameter, loading, defaultValue]);

  return value;
}

/**
 * Hook to get multiple parameter values at once
 *
 * @param keys - Array of parameter keys
 * @returns Object with parameter keys and their values
 *
 * @example
 * const theme = useParameterValues([
 *   'theme.primary_color',
 *   'theme.secondary_color',
 *   'theme.background_color'
 * ]);
 * // Returns: { 'theme.primary_color': '#000', 'theme.secondary_color': '#fff', ... }
 */
export function useParameterValues(keys: Array<keyof ParameterValues>) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValues = async () => {
      try {
        setLoading(true);
        const results: Record<string, any> = {};

        await Promise.all(
          keys.map(async (key) => {
            try {
              const response = await getParameterByKey(key as string);
              if (response.parameter?.is_active) {
                results[key as string] = response.parameter.value;
              }
            } catch {
              // Silently fail for individual keys
              results[key as string] = undefined;
            }
          })
        );

        setValues(results);
      } finally {
        setLoading(false);
      }
    };

    fetchValues();
  }, [keys.join(',')]);

  return { values, loading };
}

/**
 * Hook to get all parameters for a category as a key-value map
 *
 * @param category - Parameter category
 * @returns Object with parameter keys and their values
 *
 * @example
 * const themeParams = useParametersByCategory(ParameterCategory.THEME);
 * // Returns: { 'theme.primary_color': '#000', 'theme.secondary_color': '#fff', ... }
 */
export function useParametersByCategory(category: ParameterCategory) {
  const [values, setValues] = useState<Record<string, any>>({});
  const { parameters, loading } = useParameter({ category });

  useEffect(() => {
    if (!loading && parameters.length > 0) {
      const paramMap = parameters.reduce(
        (acc, param) => {
          if (param.is_active) {
            acc[param.key] = param.value;
          }
          return acc;
        },
        {} as Record<string, any>
      );
      setValues(paramMap);
    }
  }, [parameters, loading]);

  return { values, loading };
}

/**
 * Hook to check if a feature flag is enabled
 *
 * @param featureKey - Feature flag key (without 'feature.' prefix)
 * @returns Boolean indicating if feature is enabled
 *
 * @example
 * const isBookingEnabled = useFeatureFlag('booking_enabled');
 * const isChatEnabled = useFeatureFlag('chat_support_enabled');
 */
export function useFeatureFlag(featureKey: string): boolean {
  const fullKey = `feature.${featureKey}` as keyof ParameterValues;
  return useParameterValue<boolean>(fullKey, false);
}
