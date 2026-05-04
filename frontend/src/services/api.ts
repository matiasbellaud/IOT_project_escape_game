const API_BASE_URL = 'http://localhost:3001/api';

export interface Game {
  id: number;
  teamName: string;
  step: number;
  remainingSeconds: number;
  isFinished: boolean;
  finishedAt: string | null;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SensorPayload {
  id: number;
  device: string;
  temperature: number;
  humidity: number;
  luminosity: number;
  keypad: string;
  receivedAt: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Game endpoints
  async createGame(teamName: string): Promise<{ success: boolean; game: Game }> {
    return this.request('/game/create', {
      method: 'POST',
      body: JSON.stringify({ teamName }),
    });
  }

  async getGameHistory(): Promise<Game[]> {
    return this.request('/game/history');
  }

  async getUnfinishedGames(): Promise<Game[]> {
    return this.request('/game/unfinished');
  }

  async getGame(id: number): Promise<Game> {
    return this.request(`/game/${id}`);
  }

  async updateGame(id: number, updates: Partial<{
    step: number;
    remainingSeconds: number;
    isFinished: boolean;
    durationSeconds: number;
  }>): Promise<{ success: boolean; game: Game }> {
    return this.request(`/game/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async completeGame(id: number, durationSeconds?: number): Promise<{ success: boolean; game: Game }> {
    return this.request(`/game/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ durationSeconds }),
    });
  }

  // IoT endpoints
  async sendSensorPayload(payload: {
    device: string;
    temperature: number;
    humidity: number;
    luminosity: number;
    keypad: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.request('/iot/uplink', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getSensorPayloads(): Promise<SensorPayload[]> {
    return this.request('/iot/payloads');
  }

  // Health check
  async healthCheck(): Promise<{ success: boolean; status: string }> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();</content>
<parameter name="filePath">c:\Users\bella\Desktop\cours\M1\IOT\Projet\IOT_project_escape_game\frontend\src\services\api.ts