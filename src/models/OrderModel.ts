// Survey Analysis Interface
import {FoodJournalResponse} from "./FoodJournalModel.ts";

// Nutrition Day Detail Interface
export interface NutritionDayDetail {
    date: string;
    status: string;
    day: string;
}

// Nutrition Details Interface
export interface NutritionDetails {
    totalDays: number;
    completedDays: number;
    nonCompletedDays: number;
    daysDetails: NutritionDayDetail[];
    startDateTime: string;
    endDateTime: string;
    todayTaskDate: string;
    metadataId: string;
    nutritionAnalysisId: string;
}

// Survey Analysis Interface
export interface SurveyAnalysis {
    status: string;
    surveyType: string[];
}

// Activity Analysis Interface
export interface ActivityAnalysis {
    status: string;
    startDateTime: string;
    endDateTime: string;
    activityItems: any[]; // Define a more specific type if available
}

// Movement Analysis Interface
export interface MovementAnalysis {
    status: string;
    startDateTime: string;
    endDateTime: string;
    movementTypes: any[]; // Define a more specific type if available
}

export interface NutritionAnalysis {
    status: string;
    startDateTime: string;
    endDateTime: string;
    nutritionItems: FoodJournalResponse[]; // Array of FoodJournalResponse as it contains meals and water logging
}

// Metadata Interface
export interface Metadata {
    surveyAnalysis: SurveyAnalysis;
    activityAnalysis: ActivityAnalysis;
    movementAnalysis: MovementAnalysis;
    nutritionAnalysis: NutritionAnalysis;
    programStartDateTime: string;
    programEndDateTime: string;
}

// Order Interface
export interface Order {
    id: string;
    ameyaId: string;
    startDate: string;
    dueDate: string;
    status: string;
    active: boolean;
    metadata: Metadata;
    createdAt: string;
    updatedAt: string;
    version: number;
    endDate: string
}
export interface DoctorOrder {
    id: string;
    ameyaId: string;
    startDate: string;
    endDate: string
    firstName: string;
    lastName: string;
}

// Complete Response Interface (including the new `nutrition` key)
export interface OrderResponseModel {
    nutrition: NutritionDetails;  // New key added here for the `nutrition` object
    activity: ActivityAnalysis;
    survey: SurveyAnalysis;
    order: Order;
}

