export type OpportunityType = 'Scholarship' | 'Fellowship' | 'Grant' | 'Research Internship' | 'Hackathon' | 'Exchange Program';
export type FundingCoverage = 'Fully Funded' | 'Partially Funded' | 'Tuition Waiver' | 'Stipend Only' | 'Prize Pool';
export type DegreeLevel = 'High School' | 'Undergraduate' | 'Masters' | 'PhD' | 'Postdoctoral' | 'Open to All';
export type FieldOfStudy = 'Computer Science & AI' | 'Engineering' | 'Natural Sciences' | 'Medicine & Healthcare' | 'Business & Economics' | 'Humanities & Social Sciences' | 'Arts & Design' | 'All Disciplines';

export interface UserRadarProfile {
  targetDegree: DegreeLevel;
  primaryField: FieldOfStudy;
  citizenship: string;
  currentGpa?: number;
}

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  provider: string;
  providerLogoUrl?: string;
  hostCountry: string;
  countryFlagEmoji?: string;
  type: OpportunityType;
  funding: FundingCoverage;
  financialBenefit: string;
  degreeLevels: DegreeLevel[];
  fieldsOfStudy: FieldOfStudy[];
  eligibleNationalities: string[];
  /** ISO 8601 when the official programme publishes a specific deadline; null otherwise. */
  deadline: string | null;
  isOpen: boolean;
  isFeatured?: boolean;
  applicationUrl: string;
  description: string;
  requirements: string[];
  selectionCriteria?: string[];
  documentsRequired?: string[];
  postedDate: string;
  radarMatchScore?: number;
  region: 'North America' | 'Europe' | 'Asia & Pacific' | 'Remote / Global';
  sourceUrl: string;
  deadlineNote?: string;
  openingDate?: string;
  resultDate?: string;
  noIeltsRequired?: boolean;
}

export interface FilterState {
  searchQuery: string;
  types: OpportunityType[];
  fundingCoverages: FundingCoverage[];
  degreeLevels: DegreeLevel[];
  fieldsOfStudy: FieldOfStudy[];
  regions: string[];
  urgency: 'all' | 'closing-in-7-days' | 'closing-in-30-days' | 'open-anytime';
  minFunding?: boolean;
  noIeltsOnly?: boolean;
  sortBy: 'deadline-asc' | 'radar-match-desc' | 'newest' | 'title-asc';
}
