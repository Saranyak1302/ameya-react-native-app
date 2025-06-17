export type MovementResponse = {
  total: number; // Total number of movement items
  data: MovementItem[]; // Array of movement items
  hasNextPage: boolean; // Indicates if there are more pages
};

export type MovementItem = {
  assessmentId: string;
  csvKey: string;
  endDate: string;
  id: string;
  metadataId: string;
  name: string;
  startDate: string;
  status: 'PENDING' | 'COMPLETED'; // Possible status values
  videoKey: string;
  flagTag: string,
  flagNotes: string,
  isFlagged: boolean,
};
