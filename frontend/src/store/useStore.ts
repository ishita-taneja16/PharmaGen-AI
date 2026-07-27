import { create } from 'zustand';
import { ActiveTab, User } from '../types';

interface AppState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  selectedDatasetId: string | null;
  setSelectedDatasetId: (id: string | null) => void;
  activeExperimentId: string | null;
  setActiveExperimentId: (id: string | null) => void;
  dashboardRefreshKey: number;
  triggerDashboardRefresh: () => void;
}

export const useStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  user: null,
  setUser: (user) => set({ user }),
  selectedDatasetId: localStorage.getItem('pharmagen_selected_dataset_id') || null,
  setSelectedDatasetId: (id) => {
    if (id) {
      localStorage.setItem('pharmagen_selected_dataset_id', id);
    } else {
      localStorage.removeItem('pharmagen_selected_dataset_id');
    }
    set({ selectedDatasetId: id });
  },
  activeExperimentId: localStorage.getItem('pharmagen_active_experiment_id') || null,
  setActiveExperimentId: (id) => {
    if (id) {
      localStorage.setItem('pharmagen_active_experiment_id', id);
    } else {
      localStorage.removeItem('pharmagen_active_experiment_id');
    }
    set({ activeExperimentId: id });
  },
  dashboardRefreshKey: 0,
  triggerDashboardRefresh: () => set((state) => ({ dashboardRefreshKey: state.dashboardRefreshKey + 1 })),
}));
