export type Citation = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  reviewedOn: string;
};

export const CITATIONS = {
  whoActivity: {
    id: 'who-activity',
    title: 'Physical activity',
    publisher: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
    reviewedOn: '2026-08-12',
  },
  cdcBmiOverview: {
    id: 'cdc-bmi-overview',
    title: 'About Body Mass Index (BMI)',
    publisher: 'U.S. Centers for Disease Control and Prevention',
    url: 'https://www.cdc.gov/bmi/about/index.html',
    reviewedOn: '2026-08-12',
  },
  cdcBmiCategories: {
    id: 'cdc-bmi-categories',
    title: 'Adult BMI Categories',
    publisher: 'U.S. Centers for Disease Control and Prevention',
    url: 'https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html',
    reviewedOn: '2026-08-12',
  },
  mifflinPaper: {
    id: 'mifflin-st-jeor-1990',
    title:
      'A new predictive equation for resting energy expenditure in healthy individuals',
    publisher: 'The American Journal of Clinical Nutrition',
    url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/',
    reviewedOn: '2026-08-12',
  },
} satisfies Record<string, Citation>;

export const citationList = Object.values(CITATIONS);
