'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from './supabase/client';

const TABLES = ['clients', 'projects', 'tasks', 'expenses', 'documents', 'weekly_focus', 'settings'];

export function useRealtimeRefresh() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const refresh = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => router.refresh(), 500);
    };

    const channels = TABLES.map(table =>
      supabase
        .channel(`realtime:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, refresh)
        .subscribe()
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [router]);
}
