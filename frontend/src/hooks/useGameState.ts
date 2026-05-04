import { useState, useEffect, useCallback } from 'react';
import { apiService, type Game, type SensorPayload } from '../services/api';

export interface GameState {
  currentGame: Game | null;
  sensorData: SensorPayload[];
  isLoading: boolean;
  error: string | null;
}

export const useGameState = () => {
  const [state, setState] = useState<GameState>({
    currentGame: null,
    sensorData: [],
    isLoading: false,
    error: null,
  });

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const updateState = useCallback((updates: Partial<GameState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setError = useCallback((error: string | null) => {
    updateState({ error, isLoading: false });
  }, [updateState]);

  const setLoading = useCallback((isLoading: boolean) => {
    updateState({ isLoading });
  }, [updateState]);

  // Charger l'historique des parties
  const loadGameHistory = useCallback(async () => {
    try {
      setLoading(true);
      const games = await apiService.getGameHistory();
      setError(null);
      return games;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement des parties');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Charger les parties non terminées
  const loadUnfinishedGames = useCallback(async () => {
    try {
      setLoading(true);
      const games = await apiService.getUnfinishedGames();
      setError(null);
      return games;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement des parties');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Créer une nouvelle partie
  const createGame = useCallback(async (teamName: string) => {
    try {
      setLoading(true);
      const result = await apiService.createGame(teamName);
      if (result.success) {
        updateState({ currentGame: result.game });
        setError(null);
        return result.game;
      } else {
        throw new Error('Erreur lors de la création de la partie');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la création de la partie');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateState]);

  // Charger une partie spécifique
  const loadGame = useCallback(async (gameId: number) => {
    try {
      setLoading(true);
      const game = await apiService.getGame(gameId);
      updateState({ currentGame: game });
      setError(null);
      return game;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement de la partie');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateState]);

  // Mettre à jour une partie
  const updateGame = useCallback(async (gameId: number, updates: Partial<{
    step: number;
    remainingSeconds: number;
    isFinished: boolean;
    durationSeconds: number;
  }>) => {
    try {
      setLoading(true);
      const result = await apiService.updateGame(gameId, updates);
      if (result.success) {
        updateState({ currentGame: result.game });
        setError(null);
        return result.game;
      } else {
        throw new Error('Erreur lors de la mise à jour de la partie');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la partie');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateState]);

  // Terminer une partie
  const completeGame = useCallback(async (gameId: number, durationSeconds?: number) => {
    try {
      setLoading(true);
      const result = await apiService.completeGame(gameId, durationSeconds);
      if (result.success) {
        updateState({ currentGame: result.game });
        setError(null);
        return result.game;
      } else {
        throw new Error('Erreur lors de la finalisation de la partie');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la finalisation de la partie');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateState]);

  // Charger les données des capteurs
  const loadSensorData = useCallback(async () => {
    try {
      const payloads = await apiService.getSensorPayloads();
      updateState({ sensorData: payloads });
      return payloads;
    } catch (error) {
      console.error('Erreur lors du chargement des données capteurs:', error);
      return [];
    }
  }, [updateState]);

  // Démarrer le polling des données capteurs
  const startSensorPolling = useCallback((intervalMs: number = 2000) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      await loadSensorData();
    }, intervalMs);

    setPollingInterval(interval);
  }, [pollingInterval, loadSensorData]);

  // Arrêter le polling
  const stopSensorPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  // Nettoyer à la destruction du composant
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return {
    ...state,
    loadGameHistory,
    loadUnfinishedGames,
    createGame,
    loadGame,
    updateGame,
    completeGame,
    loadSensorData,
    startSensorPolling,
    stopSensorPolling,
    setError,
  };
};
