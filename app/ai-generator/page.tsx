import { createClient } from '@/lib/supabase/server';
import AiGeneratorClient from './AiGeneratorClient';

export default async function AiGeneratorPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('settings').select('*').single();

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">AI Generator</h1>
      </div>
      <AiGeneratorClient
        pillars={settings?.content_pillars ?? []}
        brandVoice={settings?.brand_voice ?? ''}
        hashtags={settings?.default_hashtags ?? []}
        model={settings?.default_model_smart ?? 'claude-sonnet-4-6'}
      />
    </div>
  );
}
