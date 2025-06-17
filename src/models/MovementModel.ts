export type MovementResponseModel = {
  description: string;
  goals: string[];
  remainders: string[];
  image: string;
  id: string;
  movementId: string;
  assessmentId: string;
  metadataId: string;
  name: string;
  startDate: string;
  endDate: string;
  source: {
    instructionCc: string;
    instructionVideo: string;
    setupCc: string;
    setupVideo: string;
  };
  tags: {
    color: string;
    icon: string;
    title: string;
  }[];
  title: string;
};
