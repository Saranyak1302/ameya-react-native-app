// Type for a single serving size
type ServingSize = {
  quantity: number;
  unitName: string;
};

// Type for a single serving unit
type ServingUnit = {
  unit: string;
  value: number;
  unitName: string;
};

// Type for nutrients
type Nutrient = {
  unit: string;
  value: number;
};

// Type for the main object structure
export type IngredientItemType = {
  id: string;
  name: string;
  amount: {
    weight: {unit: string; value: number};
    weightGrams: number;
    selectedUnit: string;
    servingSizes: ServingSize[];
    servingUnits: ServingUnit[];
    selectedQuantity: number;
  };
  iconId: string;
  refCode: string;
  referenceNutrients: {
    fat?: Nutrient;
    iron?: Nutrient;
    zinc?: Nutrient;
    carbs?: Nutrient;
    fibers?: Nutrient;
    iodine?: Nutrient;
    satFat?: Nutrient;
    sodium?: Nutrient;
    sugars?: Nutrient;
    weight?: Nutrient;
    alcohol?: Nutrient;
    calcium?: Nutrient;
    protein?: Nutrient;
    calories?: Nutrient;
    chromium?: Nutrient;
    selenium?: Nutrient;
    transFat?: Nutrient;
    vitaminA?: Nutrient;
    vitaminC?: Nutrient;
    vitaminD?: Nutrient;
    vitaminE?: Nutrient;
    folicAcid?: Nutrient;
    magnesium?: Nutrient;
    potassium?: Nutrient;
    vitaminB6?: Nutrient;
    phosphorus?: Nutrient;
    vitaminB12?: Nutrient;
    cholesterol?: Nutrient;
    sugarsAdded?: Nutrient;
    vitaminARAE?: Nutrient;
    sugarAlcohol?: Nutrient;
    vitaminEAdded?: Nutrient;
    vitaminB12Added?: Nutrient;
    monounsaturatedFat?: Nutrient;
    polyunsaturatedFat?: Nutrient;
    vitaminKMenaquinone4?: Nutrient;
    vitaminKPhylloquinone?: Nutrient;
    vitaminKDihydrophylloquinone?: Nutrient;
  };
  image?: any;
};
