import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Order, OrderResponseModel} from '../../models/OrderModel'; // Adjust the import path accordingly

// Define the state interface with the new model
interface OrderState {
  orderResponse: OrderResponseModel | null;
  pastNutritionResponse: {
    nutrition: NutritionType;
    order: Order | undefined;
  } | null;
  isFromTodaysTask: boolean;
}
interface NutritionType {
  date: string;
  startDateTime: string;
  endDateTime: string;
  metadataId: string;
  nutritionAnalysisId: string;
}

const initialState: OrderState = {
  orderResponse: null, // Now it stores the entire response including nutrition, activity, survey, and order data
  pastNutritionResponse: null,
  isFromTodaysTask: false,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrderResponse(state, action: PayloadAction<OrderResponseModel>) {
      state.orderResponse = action.payload; // Set the full response including nutrition
    },
    setPastNutritionResponse(state, action: PayloadAction<any>) {
      state.pastNutritionResponse = {
        nutrition: action.payload,
        order: state.orderResponse?.order,
      };
    },
    updateIsFromTodaysTask(state, action: PayloadAction<boolean>) {
      state.isFromTodaysTask = action.payload;
    },
    clearPastNutritionResponse(state) {
      state.pastNutritionResponse = null;
    },
    clearOrderResponse(state) {
      state.orderResponse = null; // Clear the entire response
    },
  },
});

// Export actions and reducer
export const {
  setOrderResponse,
  clearOrderResponse,
  setPastNutritionResponse,
  clearPastNutritionResponse,
  updateIsFromTodaysTask,
} = orderSlice.actions;
export default orderSlice.reducer;
