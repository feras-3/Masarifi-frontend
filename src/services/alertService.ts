import apiClient from './apiClient';
import { Alert, DismissAlertResponse } from '../types/alert';

export const alertService = {
  // Get all alerts for the authenticated user
  // GET /api/alerts
  getAlerts: async (): Promise<Alert[]> => {
    const response = await apiClient.get<Alert[]>('/api/alerts');
    return response.data;
  },

  // Dismiss an alert
  // PUT /api/alerts/{id}/dismiss
  dismissAlert: async (id: string): Promise<DismissAlertResponse> => {
    const response = await apiClient.put<DismissAlertResponse>(`/api/alerts/${id}/dismiss`);
    return response.data;
  }
};
