export type SurveyResponse = {
  total: number; // Total number of survey items
  data: SurveyItem[]; // Array of survey items
  hasNextPage: boolean; // Indicates if there are more pages
};

export type SurveyItem = {
  isTitle?: boolean; // local helper id
  id: string; // Unique identifier for the survey
  link: string; // URL link to the survey
  name: string; // Name of the survey
  status: 'PENDING' | 'COMPLETED'; // Status of the survey (example: "PENDING" or "COMPLETED")
  endDate: string; // ISO 8601 formatted end date of the survey
  startDate: string; // ISO 8601 formatted start date of the survey
  metadataId: string; // Metadata ID related to the survey
  assessmentId: string; // Assessment ID related to the survey
  completedDate?: string;
};
