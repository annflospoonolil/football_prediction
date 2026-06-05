import { QUESTION_TEMPLATES } from './templates';

export function getQuestionOptions(q, match) {
  const template = QUESTION_TEMPLATES[q.template];

  if (!template) return q.options || [];

  return template.generateOptions(match);
}
