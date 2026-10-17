// Utility functions for normalizing formulas and academic stage tagging

export function normalizeFormula(f) {
  if (!f) return null;
  const slug = f.slug || f.formula_id || (typeof f.id === 'string' ? f.id : String(f.id));
  const rawTopics = f.topics || f.topic_names || [];
  const topics = Array.isArray(rawTopics)
    ? rawTopics.map((t) => (typeof t === 'object' && t ? t.name || t.slug : String(t)))
    : [];

  return {
    ...f,
    backend_id: typeof f.id === 'number' ? f.id : null,
    id: slug,
    formula_id: f.formula_id || slug,
    slug: slug,
    title: f.title || '',
    subject_name: f.subject_name || (typeof f.subject === 'string' ? f.subject : (f.subject?.name || 'Mathematics')),
    subject_slug: f.subject_slug || (f.subject?.slug || (typeof f.subject === 'string' ? f.subject.toLowerCase().replace(/\s+/g, '-') : 'general')),
    formula_latex: f.formula_latex || f.formulaLatex || '',
    has_demo: Boolean(f.has_demo || f.hasDemo),
    summary: f.summary || '',
    level: f.level || 'intermediate',
    topics: topics,
    keywords: Array.isArray(f.keywords) ? f.keywords : [],
    video: f.video || (f.video_youtube_id ? { youtubeId: f.video_youtube_id, url: f.video_url, title: f.video_title, channel: f.video_channel } : null),
  };
}

export function filterByAcademicStage(f, stage) {
  if (stage === 'all') return true;
  const tList = (f.topics || []).map((t) => String(t).toLowerCase());
  const kList = (f.keywords || []).map((k) => String(k).toLowerCase());
  const allTags = [...tList, ...kList];
  const subj = (f.subject_slug || f.subject_name || '').toLowerCase();

  switch (stage) {
    case 'class11':
      return allTags.some((t) => t.includes('class11') || t.includes('class 11')) ||
             ['trigonometry', 'algebra', 'geometry'].includes(subj);
    case 'class12':
      return allTags.some((t) => t.includes('class12') || t.includes('class 12')) ||
             ['calculus', 'physics'].includes(subj);
    case 'university':
      return allTags.some((t) => t.includes('university') || t.includes('multivariable') || t.includes('relativity') || t.includes('svd') || t.includes('fourier') || t.includes('laplace') || t.includes('lagrange') || t.includes('schrodinger'));
    case 'ml':
      return allTags.some((t) => t.includes('ml') || t.includes('datascience') || t.includes('machine-learning') || t.includes('deep-learning') || t.includes('nlp') || t.includes('embeddings') || t.includes('adam') || t.includes('attention') || t.includes('loss') || t.includes('regression') || t.includes('pca'));
    case 'physics':
      return subj.includes('physics') || allTags.some((t) => t.includes('physics') || t.includes('kinematics') || t.includes('optics') || t.includes('mechanics') || t.includes('coulomb') || t.includes('gauss') || t.includes('electromagnetism'));
    case 'discrete':
      return subj.includes('discrete') || allTags.some((t) => t.includes('discrete') || t.includes('graph') || t.includes('combinatorics') || t.includes('logic') || t.includes('dijkstra') || t.includes('rsa') || t.includes('pigeonhole'));
    default:
      return true;
  }
}
