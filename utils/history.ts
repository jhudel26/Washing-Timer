export interface HistoryEntry {
  id: string;
  programId: string;
  programName: string;
  duration: number;
  completedAt: number;
}

const HISTORY_STORAGE_KEY = 'washing-history-data';
const MAX_HISTORY_ENTRIES = 50;

export const saveHistoryEntry = (entry: HistoryEntry): void => {
  try {
    const history = loadHistory();
    const newHistory = [entry, ...history].slice(0, MAX_HISTORY_ENTRIES);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Failed to save history entry:', error);
  }
};

export const loadHistory = (): HistoryEntry[] => {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as HistoryEntry[];
    }
  } catch (error) {
    console.error('Failed to load history:', error);
  }
  return [];
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
};

export const formatHistoryDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return `Today, ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  if (isYesterday) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  });
};