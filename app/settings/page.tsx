import { createClient } from '@/lib/supabase/server';
import SettingsForm from './SettingsForm';
import type { Settings } from '@/lib/types';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('settings').select('*').single();

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>
      <SettingsForm settings={settings as Settings | null} />
    </div>
  );
}
