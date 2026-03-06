import { useState, useCallback } from 'react';
import type { Campaign, AutomationRule, TierDiscount, VolumeDiscount } from './types';
import {
  MOCK_CAMPAIGNS,
  MOCK_AUTOMATIONS,
  MOCK_TIER_DISCOUNTS,
  MOCK_VOLUME_DISCOUNTS,
} from './mockCampaigns';

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);

  const addCampaign = useCallback((campaign: Omit<Campaign, 'id' | 'createdAt'>) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: generateId('camp'),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    return newCampaign;
  }, []);

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { campaigns, addCampaign, updateCampaign, deleteCampaign };
}

export function useAutomations() {
  const [automations, setAutomations] = useState<AutomationRule[]>(MOCK_AUTOMATIONS);

  const toggleAutomation = useCallback((id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  }, []);

  const addAutomation = useCallback((rule: Omit<AutomationRule, 'id' | 'triggerCount'>) => {
    const newRule: AutomationRule = {
      ...rule,
      id: generateId('auto'),
      triggerCount: 0,
    };
    setAutomations((prev) => [...prev, newRule]);
    return newRule;
  }, []);

  const deleteAutomation = useCallback((id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { automations, toggleAutomation, addAutomation, deleteAutomation };
}

export function useTierDiscounts() {
  const [tierDiscounts, setTierDiscounts] = useState<TierDiscount[]>(MOCK_TIER_DISCOUNTS);

  const addTierDiscount = useCallback((discount: Omit<TierDiscount, 'id'>) => {
    const newDiscount: TierDiscount = {
      ...discount,
      id: generateId('tier'),
    };
    setTierDiscounts((prev) => [...prev, newDiscount]);
    return newDiscount;
  }, []);

  const updateTierDiscount = useCallback((id: string, updates: Partial<TierDiscount>) => {
    setTierDiscounts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  }, []);

  const deleteTierDiscount = useCallback((id: string) => {
    setTierDiscounts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { tierDiscounts, addTierDiscount, updateTierDiscount, deleteTierDiscount };
}

export function useVolumeDiscounts() {
  const [volumeDiscounts, setVolumeDiscounts] = useState<VolumeDiscount[]>(MOCK_VOLUME_DISCOUNTS);

  const addVolumeDiscount = useCallback((discount: Omit<VolumeDiscount, 'id'>) => {
    const newDiscount: VolumeDiscount = {
      ...discount,
      id: generateId('vol'),
    };
    setVolumeDiscounts((prev) => [...prev, newDiscount]);
    return newDiscount;
  }, []);

  const updateVolumeDiscount = useCallback((id: string, updates: Partial<VolumeDiscount>) => {
    setVolumeDiscounts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  }, []);

  const deleteVolumeDiscount = useCallback((id: string) => {
    setVolumeDiscounts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { volumeDiscounts, addVolumeDiscount, updateVolumeDiscount, deleteVolumeDiscount };
}
