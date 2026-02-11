import { QuestionSet } from '../data/questions';
import { getGeo } from './identity';

export async function detectQuestionSet(): Promise<QuestionSet> {
  const geo = await getGeo();
  return geo?.country_code === 'NG' ? 'nigeria' : 'global';
}
