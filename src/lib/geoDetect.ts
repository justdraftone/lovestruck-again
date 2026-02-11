import { QuestionSet } from '../data/questions';

export async function detectQuestionSet(): Promise<QuestionSet> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return 'global';
    const data = await res.json();
    return data.country_code === 'NG' ? 'nigeria' : 'global';
  } catch {
    return 'global';
  }
}
