export type ReviewStage = 0 | 1 | 2 | 3 | 4;
// 0 = initial solve (day 0)
// 1 = review after 1 day
// 2 = review after 3 days
// 3 = review after 7 days
// 4 = review after 14 days

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Review {
  stage: ReviewStage;
  scheduledDate: string; // YYYY-MM-DD
  completedDate: string | null;
  result: 'solved' | 'failed' | null;
}

export interface Problem {
  id: string;
  title: string;
  leetcodeNumber?: number;
  url?: string;
  difficulty?: Difficulty;
  addedAt: string; // YYYY-MM-DD
  status: 'backlog' | 'active' | 'completed';
  currentStage: ReviewStage;
  nextReviewDate: string; // YYYY-MM-DD
  reviews: Review[];
}
