import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface DrawerContextValue {
  openId: string | null;
  open: (id: string) => void;
  close: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useCallback((id: string) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);
  const value = useMemo(() => ({ openId, open, close }), [openId, open, close]);
  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProblemDrawer(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useProblemDrawer must be used inside <DrawerProvider>');
  return ctx;
}
