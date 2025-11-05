import { AxiosResponse } from 'axios';
import { apiClient } from './apiClients';
import {
  Parameter,
  ParameterListResponse,
  ParameterResponse,
  CreateParameterRequest,
  UpdateParameterRequest,
  ParameterQueryParams,
  ParameterCategory,
  ParameterType
} from '@/interfaces/ParameterInterface';

/**
 * Parameter API
 *
 * This module provides API functions for managing parameterized content
 * that controls website appearance and behavior dynamically.
 *
 * Base endpoint: /api/v1/parameters
 */

/**
 * Get all parameters with optional filtering
 * @param params - Query parameters for filtering, pagination, and sorting
 * @returns Promise with list of parameters and metadata
 */
export const getAllParameters = async (
  params?: ParameterQueryParams
): Promise<ParameterListResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.category) queryParams.append('category', params.category);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.is_active !== undefined) queryParams.append('is_active', String(params.is_active));
  if (params?.search) queryParams.append('search', params.search);
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

  const response: AxiosResponse<ParameterListResponse> = await apiClient.get(
    `/parameters${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  );
  return response.data;
};

/**
 * Get parameters by category
 * @param category - Parameter category to filter by
 * @param isActive - Optional filter for active parameters only
 * @returns Promise with list of parameters in the category
 */
export const getParametersByCategory = async (
  category: ParameterCategory,
  isActive?: boolean
): Promise<ParameterListResponse> => {
  return getAllParameters({ category, is_active: isActive });
};

/**
 * Get a single parameter by ID
 * @param parameterId - The parameter ID
 * @returns Promise with parameter details
 */
export const getParameterById = async (
  parameterId: string
): Promise<ParameterResponse> => {
  const response: AxiosResponse<ParameterResponse> = await apiClient.get(
    `/parameters/${parameterId}`
  );
  return response.data;
};

/**
 * Get a parameter by its unique key
 * @param key - The parameter key (e.g., 'theme.primary_color')
 * @returns Promise with parameter details
 */
export const getParameterByKey = async (
  key: string
): Promise<ParameterResponse> => {
  const response: AxiosResponse<ParameterResponse> = await apiClient.get(
    `/parameters/key/${key}`
  );
  return response.data;
};

/**
 * Create a new parameter
 * @param data - Parameter data to create
 * @returns Promise with created parameter
 */
export const createParameter = async (
  data: CreateParameterRequest
): Promise<ParameterResponse> => {
  const response: AxiosResponse<ParameterResponse> = await apiClient.post(
    '/parameters',
    data
  );
  return response.data;
};

/**
 * Update an existing parameter
 * @param parameterId - The parameter ID to update
 * @param data - Updated parameter data
 * @returns Promise with updated parameter
 */
export const updateParameter = async (
  parameterId: string,
  data: UpdateParameterRequest
): Promise<ParameterResponse> => {
  const response: AxiosResponse<ParameterResponse> = await apiClient.patch(
    `/parameters/${parameterId}`,
    data
  );
  return response.data;
};

/**
 * Update a parameter by its key
 * @param key - The parameter key
 * @param data - Updated parameter data
 * @returns Promise with updated parameter
 */
export const updateParameterByKey = async (
  key: string,
  data: UpdateParameterRequest
): Promise<ParameterResponse> => {
  const response: AxiosResponse<ParameterResponse> = await apiClient.patch(
    `/parameters/key/${key}`,
    data
  );
  return response.data;
};

/**
 * Delete a parameter
 * @param parameterId - The parameter ID to delete
 * @returns Promise with deletion confirmation
 */
export const deleteParameter = async (
  parameterId: string
): Promise<{ message: string; success: boolean }> => {
  const response: AxiosResponse<{ message: string; success: boolean }> =
    await apiClient.delete(`/parameters/${parameterId}`);
  return response.data;
};

/**
 * Toggle parameter active status
 * @param parameterId - The parameter ID
 * @param isActive - New active status
 * @returns Promise with updated parameter
 */
export const toggleParameterStatus = async (
  parameterId: string,
  isActive: boolean
): Promise<ParameterResponse> => {
  return updateParameter(parameterId, { is_active: isActive });
};

/**
 * Bulk update multiple parameters
 * @param updates - Array of parameter updates with IDs
 * @returns Promise with updated parameters
 */
export const bulkUpdateParameters = async (
  updates: Array<{ id: string; data: UpdateParameterRequest }>
): Promise<{ parameters: Parameter[]; updated_count: number }> => {
  const response: AxiosResponse<{ parameters: Parameter[]; updated_count: number }> =
    await apiClient.put('/parameters/bulk', { updates });
  return response.data;
};

/**
 * Get active parameters for public use (cached, no auth required)
 * This endpoint should be optimized for frontend consumption
 * @param category - Optional category filter
 * @returns Promise with active parameters
 */
export const getActiveParameters = async (
  category?: ParameterCategory
): Promise<ParameterListResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('is_active', 'true');
  if (category) queryParams.append('category', category);

  const response: AxiosResponse<ParameterListResponse> = await apiClient.get(
    `/parameters/public?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Export parameters as JSON
 * @param category - Optional category filter
 * @returns Promise with parameters in export format
 */
export const exportParameters = async (
  category?: ParameterCategory
): Promise<{ parameters: Parameter[]; exported_at: string }> => {
  const response: AxiosResponse<{ parameters: Parameter[]; exported_at: string }> =
    await apiClient.get(
      `/parameters/export${category ? '?category=' + category : ''}`
    );
  return response.data;
};

/**
 * Import parameters from JSON
 * @param parameters - Array of parameters to import
 * @param merge - Whether to merge with existing parameters or replace
 * @returns Promise with import result
 */
export const importParameters = async (
  parameters: CreateParameterRequest[],
  merge: boolean = true
): Promise<{ imported_count: number; skipped_count: number; errors: string[] }> => {
  const response: AxiosResponse<{
    imported_count: number;
    skipped_count: number;
    errors: string[]
  }> = await apiClient.post('/parameters/import', { parameters, merge });
  return response.data;
};

/**
 * Validate parameter value against its type
 * @param type - Parameter type
 * @param value - Value to validate
 * @returns Promise with validation result
 */
export const validateParameterValue = async (
  type: ParameterType,
  value: any
): Promise<{ valid: boolean; error?: string }> => {
  const response: AxiosResponse<{ valid: boolean; error?: string }> =
    await apiClient.post('/parameters/validate', { type, value });
  return response.data;
};
