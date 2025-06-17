import {
  PassioFoodItem,
  UnitMass,
  PassioIngredient
} from '@passiolife/nutritionai-react-native-sdk-v3';

export type Amount = {
  weight: Weight;
  weightGrams: number;
  selectedUnit: string;
  servingSizes: ServingSize[];
  servingUnits: ServingUnit[];
  selectedQuantity: number;
};

export type ServingUnit = {
  unit: string;
  value: number;
  unitName: string;
};

export type ServingSize = {
  quantity: number;
  unitName: string;
};

export type Metadata = {
  tags: string[];
  foodOrigins: FoodOrigin[];
  barcode: string;
  ingredientsDescription: string;
};

export type FoodOrigin = {
  id: string;
  source: string;
};
export interface Ingredient {
  weight?: Weight;
  metadata?: Metadata;
  id: string;
  name: string;
  amount: Amount;
  iconId: string;
  refCode: string;
  referenceNutrients: {
    fat: Weight;
    iron: Weight;
    zinc: Weight;
    carbs: Weight;
    fibers: Weight;
    iodine?: Weight;
    satFat: Weight;
    sodium: Weight;
    sugars: Weight;
    weight: Weight;
    alcohol?: Weight;
    calcium: Weight;
    protein: Weight;
    calories: Weight;
    chromium?: Weight;
    selenium: Weight;
    transFat?: Weight;
    vitaminA?: Weight;
    vitaminC: Weight;
    vitaminD: Weight;
    vitaminE: Weight;
    folicAcid: Weight;
    magnesium: Weight;
    potassium: Weight;
    vitaminB6: Weight;
    phosphorus: Weight;
    vitaminB12: Weight;
    cholesterol: Weight;
    sugarsAdded?: Weight;
    vitaminARAE: Weight;
    sugarAlcohol?: Weight;
    vitaminEAdded: Weight;
    vitaminB12Added: Weight;
    monounsaturatedFat: Weight;
    polyunsaturatedFat: Weight;
    vitaminKMenaquinone4?: Weight;
    vitaminKPhylloquinone: Weight;
    vitaminKDihydrophylloquinone?: Weight;
  };
}

export interface FoodData {
  details: string;
  scannedId: string;
  isOpenFood: boolean;
  licenseCopy: string;
  openFoodLicense: string;
  id: string;
  name: string;
  amount: Amount;
  iconId: string;
  refCode: string;
  ingredients: Ingredient[];
  ingredientWeight: Weight | null | null;
}

export interface Nutrition {
  fat: Weight;
  iron: Weight;
  zinc: Weight;
  carbs: Weight;
  fibers: Weight;
  satFat: Weight;
  sodium: Weight;
  sugars: Weight;
  weight: Weight;
  calcium: Weight;
  protein: Weight;
  calories: Weight;
  selenium: Weight;
  transFat: Weight;
  vitaminA: Weight;
  vitaminC: Weight;
  vitaminD: Weight;
  vitaminE: Weight;
  folicAcid: Weight;
  magnesium: Weight;
  potassium: Weight;
  vitaminB6: Weight;
  phosphorus: Weight;
  vitaminB12: Weight;
  cholesterol: Weight;
  vitaminARAE: Weight;
  vitaminEAdded: Weight;
  vitaminB12Added: Weight;
  monounsaturatedFat: Weight;
  polyunsaturatedFat: Weight;
  vitaminKPhylloquinone: Weight;
  vitaminKDihydrophylloquinone: Weight;
}

export interface FoodItem {
  id: string;
  type: string;
  active: boolean;
  metadata: Metadata2;
  isScanned: boolean;
  isfavorite: boolean;
  isDirectLog: boolean;
}

type Metadata2 = {
  data: Data;
};

type Data = {
  type?: any;
  image: string;
  notes: string;
  foodData: FoodData;
  nutritions: Nutritions;
  dateandtime: string;
};

type Nutritions = {
  fat: Weight;
  iron: Weight;
  carbs: Weight;
  fibers: Weight;
  satFat: Weight;
  sodium: Weight;
  sugars: Weight;
  weight: Weight;
  calcium: Weight;
  protein: Weight;
  calories: Weight;
  transFat: Weight;
  vitaminA: Weight;
  vitaminC: Weight;
  vitaminD: Weight;
  potassium: Weight;
  cholesterol: Weight;
  polyunsaturatedFat: Weight;
};

type Weight = {
  unit: string;
  value: number;
};

export interface Meal {
  name: string;
  foods: FoodItem[];
  lastUpdatedDate: string;
  status?: string; // Optional
  breakfastCalories?: number;
  snacksCalories?: number;
  lunchCalories?: number;
  dinnerCalories?: number;
}

export interface WaterLogging {
  totalCups: number;
  numberOfCupsDriken: number;
}

export interface FoodJournalResponse {
  date: string;
  meals: Meal[];
  status: string;
  waterlogging: WaterLogging;
  totalCalories: number;
}

export interface FoodItemModel {
  foodData: PassioFoodItem;
  nutritions: NutrientsModel;
  image: string,
  toppings?: PassioIngredient[] | null,
  intake?:IntakeModel;

}
export interface IntakeModel {
  portion?: number,
  intakeValue?: number,
  unit: string,
}
export interface NutrientsModel {
  weight?: UnitMass;
  vitaminA?: UnitMass;
  calcium?: UnitMass;
  calories?: UnitMass;
  carbs?: UnitMass;
  cholesterol?: UnitMass;
  fat?: UnitMass;
  fibers?: UnitMass;
  iron?: UnitMass;
  polyunsaturatedFat?: UnitMass;
  potassium?: UnitMass;
  protein?: UnitMass;
  satFat?: UnitMass;
  sodium?: UnitMass;
  sugars?: UnitMass;
  transFat?: UnitMass;
  vitaminC?: UnitMass;
  vitaminD?: UnitMass;
}

export type DayDetail = {
  date: string;
  day: string;
  status: 'INCOMPLETE' | 'COMPLETED' | 'INPROGRESS';
};

export type DaysData = {
  daysDetails: DayDetail[];
  endDateTime: string;
  startDateTime: string;
  totalDays: number;
};

// Define the type for each item in the datelist array
interface DayItem {
  date: string; // Date in YYYY-MM-DD format
  status: string;
  day: string;
}

// Define the type for the daysList object, where keys are date strings and values are DayItem objects
export interface DaysList {
  [date: string]: DayItem;
}
