import {
  PassioIngredient,
  PassioNutrients,
} from '@passiolife/nutritionai-react-native-sdk-v3';

export const additionOfNutritionValuesFromPassioIngrdients = (
  ingredients: PassioIngredient[],
): PassioNutrients => {
  const result: PassioNutrients = {};

  ingredients.forEach(ingredient => {
    const nutrients = ingredient.referenceNutrients;

    Object.keys(nutrients).forEach(key => {
      const nutrientKey = key as keyof PassioNutrients;
      const nutrient = nutrients[nutrientKey];

      if (nutrient) {
        if (!result[nutrientKey]) {
          // Initialize the nutrient in the result if not already present
          result[nutrientKey] = {unit: nutrient.unit, value: 0};
        }

        // Add the nutrient value
        result[nutrientKey]!.value += nutrient.value;
      }
    });
  });

  return result;
};
export function addTwoNutrients(
  nutrients1: PassioNutrients,
  nutrients2: PassioNutrients,
): PassioNutrients {
  const result: PassioNutrients = {};

  const allKeys = new Set([
    ...Object.keys(nutrients1),
    ...Object.keys(nutrients2),
  ]);

  allKeys.forEach(key => {
    const nutrient1 = nutrients1[key];
    const nutrient2 = nutrients2[key];

    if (
      nutrient1 &&
      nutrient1.value !== undefined &&
      nutrient2 &&
      nutrient2.value !== undefined
    ) {
      // Add the values if both nutrients exist
      result[key] = {
        unit: nutrient1.unit, // Assuming units are the same
        value: nutrient1.value + nutrient2.value,
      };
    } else if (nutrient1 && nutrient1.value !== undefined) {
      // If only the first nutrient exists
      result[key] = {...nutrient1};
    } else if (nutrient2 && nutrient2.value !== undefined) {
      // If only the second nutrient exists
      result[key] = {...nutrient2};
    }
  });

  return result;
}
export const calculateNutritionForIntakePercentage = (
  data: PassioNutrients,
  percentage: number,
): PassioNutrients => {
  // Ensure the percentage is in decimal form (e.g., 50% becomes 0.5)
  const scaleFactor = percentage / 100;

  const result: PassioNutrients = {};

  for (const key in data) {
    if (data[key] && data[key].value !== undefined) {
      result[key] = {
        unit: data[key].unit,
        value: data[key].value * scaleFactor,
      };
    }
  }

  return result;
};
export const removeLastItemFromServingSizes = servingSizesList => {
  if (servingSizesList?.length === 0 || servingSizesList?.length === 1) {
    return servingSizesList; // Return as-is if the array is empty
  }
  const updatedArray = servingSizesList?.slice(0, -1); // Create a new array without the last item
  return updatedArray;
};
