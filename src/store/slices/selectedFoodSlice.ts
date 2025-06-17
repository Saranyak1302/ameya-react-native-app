import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  PassioFoodItem,
  PassioNutrients,
  PassioIngredient,
  UnitMass,
} from '@passiolife/nutritionai-react-native-sdk-v3';
import {FoodItemModel, NutrientsModel} from '../../models/FoodJournalModel';

interface SelectedFoodState {
  data: FoodItemModel | null;
}

const initialState: SelectedFoodState = {
  data: null,
};

const selectedFoodSlice = createSlice({
  name: 'selectedFood',
  initialState,
  reducers: {
    addSelectedFoodItem(state, action: PayloadAction<FoodItemModel>) {
      state.data = action.payload;
    },
    clearSelectedFoodItem(state) {
      state.data = null;
    },
    clearWeightAndName(state){
          if(state.data){
            state.data.foodData.amount.weight.value = 0;
          state.data.foodData.name = '';
         
          }
    },
    updateNameAndImage(
      state,
      action: PayloadAction<{name: string; image: string}>,
    ) {
      if (state.data) {
        state.data.foodData.name = action.payload.name;
        state.data.image = action.payload.image;
      }
    },
    updateNutrionData(state, action: PayloadAction<NutrientsModel>) {
      if (state.data) {
        state.data.nutritions = action.payload;
      }
    },
    updateName(state, action: PayloadAction<{name: string}>) {
      if (state.data) {
        state.data.foodData.name = action.payload.name;
      }
    },
    addIngredients(state, action: PayloadAction<PassioIngredient>) {
      if (state.data) {
        if (state.data && state.data.foodData.ingredients != null) {
          state.data.foodData.ingredients = [
            ...state.data.foodData.ingredients,
            action.payload,
          ];
        } else {
          state.data.foodData.ingredients = [action.payload];
        }
      }
    },
    updateIngredient(state, action: PayloadAction<PassioIngredient>) {
      if (state.data?.foodData?.ingredients) {
        const index = state.data.foodData.ingredients.findIndex(
          ingredient => ingredient.id === action.payload.id,
        );

        if (index !== -1) {
          // Update the existing ingredient
          state.data.foodData.ingredients[index] = {
            ...state.data.foodData.ingredients[index],
            ...action.payload,
          };
        }
      }
    },
    removeIngredientByIndex(state, action: PayloadAction<number>) {
      if (
        state.data &&
        state.data.foodData &&
        state.data.foodData.ingredients
      ) {
        state.data.foodData.ingredients =
          state.data.foodData.ingredients.filter(
            (_, idx) => idx !== action.payload,
          );
      }
    },
    updatePortionAndServingSize(
      state,
      action: PayloadAction<{
        portionSize: number;
        portionUnit: string;
        servingSize: UnitMass;
      }>,
    ) {
      if (state.data && state.data.foodData) {
        // Initialize `amount` if it's not defined
        if (!state.data.foodData.amount) {
          state.data.foodData.amount = {
            selectedQuantity: 0,
            selectedUnit: '',
            weight: {unit: '', value: 0},
          };
        }
        // Now it's safe to set the values
        state.data.foodData.amount.selectedQuantity =
          action.payload.portionSize;
        state.data.foodData.amount.selectedUnit = action.payload.portionUnit;
        state.data.foodData.amount.weight = action.payload.servingSize;
      }
    },
    updateIntakeSize(
      state,
      action: PayloadAction<{
        portionSize: number;
        portionUnit: string;
      }>,
    ) {
      if (state.data && state.data.intake) {
        state.data.intake.intakeValue =
          action.payload.portionSize;
        state.data.intake.unit = action.payload.portionUnit;
      }
    },
    addToppings(state, action: PayloadAction<PassioIngredient>) {
      if (state.data) {
        if (state.data && state.data.toppings != null) {
          state.data.toppings = [
            ...state.data.toppings,
            action.payload,
          ];
        } else {
          state.data.toppings = [action.payload];
        }
      }
    },
    updateToppings(state, action: PayloadAction<PassioIngredient>) {
      if (state.data?.toppings) {
        const index = state.data.toppings.findIndex(
          ingredient => ingredient.id === action.payload.id,
        );

        if (index !== -1) {
          // Update the existing ingredient
          state.data.toppings[index] = {
            ...state.data.toppings[index],
            ...action.payload,
          };
        }
      }
    },
    removeToppingsWithIndex(state, action: PayloadAction<number>) {
      if (
        state.data &&
        state.data.toppings &&
        state.data.toppings
      ) {
        state.data.toppings =
          state.data.toppings.filter(
            (_, idx) => idx !== action.payload,
          );
      }
    },
    updateSelectedQuantityAndSize(
      state,
      action: PayloadAction<{
        selectedQuantity: number;
        selectedUnit: string;
       
      }>,
    ) {
       if (state.data && state.data.foodData) {
        state.data.foodData.amount.selectedQuantity =
          action.payload.selectedQuantity;
        state.data.foodData.amount.selectedUnit = action.payload.selectedUnit;
      }
    },
  },
  
});
//updateSelectedQuantityAndSize
export const {
  addSelectedFoodItem,
  clearSelectedFoodItem,
  updateNameAndImage,
  addIngredients,
  removeIngredientByIndex,
  updatePortionAndServingSize,
  updateNutrionData,
  updateName,
  updateIngredient,
  updateIntakeSize,
  addToppings,
  updateToppings,
  removeToppingsWithIndex,
  updateSelectedQuantityAndSize,
  clearWeightAndName
} = selectedFoodSlice.actions;

export default selectedFoodSlice.reducer;
