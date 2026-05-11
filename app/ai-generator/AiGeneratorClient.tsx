'use client';
import { useState } from 'react';
import { useCompletion } from '@ai-sdk/react';

interface Props {
  pillars: string[];
  brandVoice: string;
  hashtags: string[];
  model: string;
}

const CONTENT_TYPES = [
  'LinkedIn Post', 'Twitter/X Thread', 'Instagram Caption',
  'Blog Post Outline', 'Email Newsletter', 'Case Study',
  'Service Description', 'Proposal Section', 'Meeting Follow-up',
];

export default function AiGeneratorClient({ pillars, brandVoice, hashtags, model }: Props) {
  const [contentType, setContentType] = useState(CONTENT_TYPES[0]);
  const [pillar, setPillar] = useState(pillars[0] ?? '');
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');

  const { complete, completion, isLoading, error } = useCompletion({
    api: '/api/ai-generate',
  });

  async function generate() {
    if (!topic.trim()) return;
    await complete(topic, {
      body: { contentType, pillar, topic, context, brandVoice, hashtags: hashtags.join(' '), model },
    });
  }

  function copy() {
    navigator.clipboard.writeText(completion);
  }

  return (
    <div className="ai-generator">
      <div className="ai-form card">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Content Type</label>
            <select className="form-input" value={contentType} onChange={e => setContentType(e.target.value)}>
              {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {pillars.length > 0 && (
            <div className="form-group">
              <label className="form-label">Content Pillar</label>
              <select className="form-input" value={pillar} onChange={e => setPillar(e.target.value)}>
                <option value="">— Any —</option>
                {pillars.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Topic / Hook *</label>
          <input className="form-input"
            placeholder="e.g. 5 ways AI saves small agencies 10 hours a week"
            value={topic} onChange={e => setTopic(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Additional Context</label>
          <textarea className="form-input" rows={3}
            placeholder="Client win, data point, personal story, key message..."
            value={context} onChange={e => setContext(e.target.value)} />
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={generate} disabled={isLoading || !topic.trim()}>
            {isLoading ? 'Generating…' : '✨ Generate'}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error.message}</div>}

      {completion && (
        <div className="ai-output card">
          <div className="section-header">
            <h2 className="section-title">Generated Content</h2>
            <button className="btn btn-ghost btn-sm" onClick={copy}>Copy</button>
          </div>
          <pre className="ai-output-text">{completion}</pre>
          {hashtags.length > 0 && (
            <div className="ai-hashtags">
              <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Suggested hashtags:</div>
              <div>{hashtags.join(' ')}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
