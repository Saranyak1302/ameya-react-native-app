export interface HcpOrgInfo {
  id: string;
  ameyaId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  region: string;
  state: string;
  city: string;
  title: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  userRoles: UserRole[];
}

export interface UserRole {
  id: string;
  role: string;
  canListParticipant: boolean;
  canCreateParticipant: boolean;
  canUpdateParticipant: boolean;
  canDeleteParticipant: boolean;
  canListAssessment: boolean;
  canCreateAssessment: boolean;
  canUpdateAssessment: boolean;
  canDeleteAssessment: boolean;
  canListUser: boolean;
  canCreateUser: boolean;
  canUpdateUser: boolean;
  canDeleteUser: boolean;
  organization: Organization;
  cohortPermissions: CohortPermission[];
}

export interface CohortPermission {
  id: string;
  canListParticipant: boolean;
  canCreateParticipant: boolean;
  canUpdateParticipant: boolean;
  canDeleteParticipant: boolean;
  canListOrder: boolean;
  canCreateOrder: boolean;
  canUpdateOrder: boolean;
  canDeleteOrder: boolean;
  canListUser: boolean;
  canCreateUser: boolean;
  canUpdateUser: boolean;
  canDeleteUser: boolean;
  cohort: Cohort;
}

export interface Cohort {
  id: string;
  name: string;
  active: boolean;
  image: string;
  email: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface Organization {
  id: string;
  name: string;
  address: string;
  image: null;
  country: string;
  state: string;
  city: string;
  active: boolean;
  metadata: Metadata;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface Metadata {
  surveyAnalysis: Analysis;
  activityAnalysis: ActivityAnalysis;
  movementAnalysis: Analysis;
  nutritionAnalysis: NutritionAnalysis;
}

export interface ActivityAnalysis {
  devices: Device[];
  isActive: boolean;
}

export interface Device {
  name: string;
  isEnabled: boolean;
}

export interface Analysis {
  items: Cohort[];
  isActive: boolean;
}

export interface NutritionAnalysis {
  isActive: boolean;
}
