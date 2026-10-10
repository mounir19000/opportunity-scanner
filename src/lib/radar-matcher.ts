import type { Opportunity, UserRadarProfile } from '../types/opportunity';

const normal = (value: string) => value.trim().toLowerCase();

export function calculateMatchScore(opportunity: Opportunity, profile: UserRadarProfile): number {
  const degree = opportunity.degreeLevels.includes(profile.targetDegree) || opportunity.degreeLevels.includes('Open to All');
  const field = opportunity.fieldsOfStudy.includes(profile.primaryField) || opportunity.fieldsOfStudy.includes('All Disciplines');
  const nationality = opportunity.eligibleNationalities.some((item) => normal(item) === 'all' || normal(item) === normal(profile.citizenship));
  return (degree ? 35 : 0) + (field ? 35 : 0) + (nationality ? 30 : 0);
}
