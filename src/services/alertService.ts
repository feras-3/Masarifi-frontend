import apiClient from './apiClient';
import { AlertsResponse, DismissAlertResponse } from '../types/alert';

export const alertService = {
  // Get all alerts for the authenticated user
  getAlerts: async (): Promise<AlertsResponse> => {
    const response = await apiClient.get<AlertsResponse>('/api/alerts');
    return response.data;
  },

  // Dismiss an alert
  dismissAlert: async (id: string): Promise<DismissAlertResponse> => {
    const response = await apiClient.put<DismissAlertResponse>(`/api/alerts/${id}/dismiss`);
    return response.data;
  }
};
