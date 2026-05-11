'use client';
import { useRealtimeRefresh } from '@/lib/realtime';

export default function RealtimeBoot() {
  useRealtimeRefresh();
  return null;
}
