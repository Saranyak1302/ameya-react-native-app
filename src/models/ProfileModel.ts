interface Notes {
  [key: string]: string;
}

type MovementItem = {
  id: string;
  name: string;
  image: string;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
};

type SurveyItem = {
  id: string;
  link: string;
  name: string;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
};

type Metadata = {
  surveyAnalysis: {
    items: SurveyItem[];
    isActive: boolean;
  };
  activityAnalysis: {
    devices: {
      name: string;
      isEnabled: boolean;
    }[];
    isActive: boolean;
  };
  movementAnalysis: {
    items: MovementItem[];
    isActive: boolean;
  };
  nutritionAnalysis: {
    isActive: boolean;
  };
};

type Assessment = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  metadata: Metadata;
  createdAt: string;
  updatedAt: string;
  version: number;
};

type Cohort = {
  id: string;
  name: string;
  active: boolean;
  image: string | null;
  email: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  assessments: Assessment[];
};

type Organization = {
  id: string;
  name: string;
  address: string;
  image: string | null;
  country: string;
  state: string;
  city: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export interface ProfileData {
  active: boolean | null;
  ameyaId: string;
  city: string;
  country: string;
  createdAt: string;
  dob: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  mfa: boolean | null;
  notes: Notes;
  phoneNumber: string;
  region: string;
  sexAtBirth: string;
  state: string;
  title: string;
  updatedAt: string;
  version: number;
  organization: Organization;
  cohort: Cohort;
}
