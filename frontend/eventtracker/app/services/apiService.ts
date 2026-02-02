import {
  API_BASE_URL,
  ApiEvent,
  ApiParticipant,
  ApiRegistration,
  ApiScheduleItem,
  ApiEventMonitoringData,
  ApiActiveSession,
} from '../config/api';

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken !== this.token) {
        this.token = storedToken;
      }
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const currentToken = this.getToken();
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.setToken(null);
      }
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || response.statusText };
      }
      console.error('API Error:', response.status, error);
      if (error.errors) {
        console.error('Validation errors:', error.errors);
      }
      throw new Error(error.error || error.details || error.title || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getEvents(): Promise<ApiEvent[]> {
    return this.request<ApiEvent[]>('/Events');
  }

  async getEvent(id: number): Promise<ApiEvent> {
    return this.request<ApiEvent>(`/Events/${id}`);
  }

  async getEventsByStatus(status: string): Promise<ApiEvent[]> {
    return this.request<ApiEvent[]>(`/Events/status/${status}`);
  }

  async createEvent(event: Partial<ApiEvent>): Promise<ApiEvent> {
    return this.request<ApiEvent>('/Events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(id: number, event: Partial<ApiEvent>): Promise<ApiEvent> {
    return this.request<ApiEvent>(`/Events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: number): Promise<void> {
    return this.request<void>(`/Events/${id}`, {
      method: 'DELETE',
    });
  }

  async archiveEvent(id: number): Promise<void> {
    return this.request<void>(`/Events/${id}/archive`, {
      method: 'POST',
    });
  }

  async getParticipants(): Promise<ApiParticipant[]> {
    return this.request<ApiParticipant[]>('/Participants');
  }

  async createParticipant(participant: Partial<ApiParticipant>): Promise<ApiParticipant> {
    return this.request<ApiParticipant>('/Participants', {
      method: 'POST',
      body: JSON.stringify(participant),
    });
  }

  async registerParticipant(eventId: number): Promise<ApiRegistration> {
    return this.request<ApiRegistration>('/Registrations/register', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });
  }

  async getMyRegistrations(): Promise<ApiRegistration[]> {
    return this.request<ApiRegistration[]>('/Registrations/my-registrations');
  }

  async checkRegistration(eventId: number): Promise<{ isRegistered: boolean; registrationId?: number; status?: string; waitingPosition?: number }> {
    return this.request(`/Registrations/event/${eventId}/check`);
  }

  async getRegistration(id: number): Promise<ApiRegistration> {
    return this.request<ApiRegistration>(`/Registrations/${id}`);
  }

  async getEventRegistrations(eventId: number): Promise<ApiRegistration[]> {
    return this.request<ApiRegistration[]>(`/Registrations/event/${eventId}`);
  }

  async checkInParticipant(registrationId: number): Promise<void> {
    return this.request<void>(`/Registrations/${registrationId}/checkin`, {
      method: 'POST',
    });
  }

  async cancelRegistration(registrationId: number): Promise<void> {
    return this.request<void>(`/Registrations/${registrationId}/cancel`, {
      method: 'POST',
    });
  }

  async getWaitingList(eventId: number): Promise<ApiRegistration[]> {
    return this.request<ApiRegistration[]>(`/Registrations/event/${eventId}/waiting`);
  }

  async getEventSchedule(eventId: number): Promise<ApiScheduleItem[]> {
    return this.request<ApiScheduleItem[]>(`/Schedule/event/${eventId}`);
  }

  async addScheduleItem(item: Partial<ApiScheduleItem>): Promise<ApiScheduleItem> {
    console.log('Wysyłanie ScheduleItem:', item);
    return this.request<ApiScheduleItem>('/Schedule', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async getEventMonitoring(eventId: number): Promise<ApiEventMonitoringData> {
    return this.request<ApiEventMonitoringData>(`/Monitoring/event/${eventId}`);
  }

  async getActiveSessions(eventId: number): Promise<ApiActiveSession[]> {
    return this.request<ApiActiveSession[]>(`/Monitoring/event/${eventId}/sessions`);
  }

  async getParticipantCount(eventId: number): Promise<{ count: number }> {
    return this.request<{ count: number }>(`/Monitoring/event/${eventId}/participants/count`);
  }

  async login(email: string, password: string): Promise<{ token: string; user: { id: number; email: string; firstName: string; lastName: string } }> {
    const response = await this.request<{ token: string; user: { id: number; email: string; firstName: string; lastName: string } }>('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async register(email: string, password: string, firstName: string, lastName: string): Promise<{ token: string; user: { id: number; email: string; firstName: string; lastName: string } }> {
    const response = await this.request<{ token: string; user: { id: number; email: string; firstName: string; lastName: string } }>('/Auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    this.setToken(response.token);
    return response;
  }

  logout() {
    this.setToken(null);
  }
}

export const apiService = new ApiService();
