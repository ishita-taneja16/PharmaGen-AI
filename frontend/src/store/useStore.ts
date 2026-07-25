import { create } from 'zustand';
import { ActiveTab, User } from '../types';

interface AppState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  selectedDatasetId: string | null;
  setSelectedDatasetId: (id: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  user: {
    id: 'usr_01',
    email: 'scientist@pfizer.com',
    full_name: 'Dr. Eleanor Vance',
    role: 'LEAD_RESEARCHER',
  },
  setUser: (user) => set({ user }),
  selectedDatasetId: 'e5f6a7b8-9012-3456-789a-bcdef0123456',
  setSelectedDatasetId: (id) => set({ selectedDatasetId: id }),
}));
