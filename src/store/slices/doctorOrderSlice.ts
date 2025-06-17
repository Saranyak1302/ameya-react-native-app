import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {DoctorOrder} from  "../../models/OrderModel"; 

// Define the state interface with the new model
interface OrderState {
    orderResponse:  DoctorOrder | null;
}

const initialState: OrderState = {
    orderResponse: null, // Now it stores the entire response including nutrition, activity, survey, and order data
};

const doctorOrderSlice = createSlice({
    name: 'doctorOrder',
    initialState,
    reducers: {
        setDoctorOrderResponse(state, action: PayloadAction<DoctorOrder>) {
            state.orderResponse = action.payload; // Set the full response including nutrition
        },
        clearDoctorOrderResponse(state) {
            state.orderResponse = null; // Clear the entire response
        }
    }
});

// Export actions and reducer
export const { setDoctorOrderResponse, clearDoctorOrderResponse } = doctorOrderSlice.actions;
export default doctorOrderSlice.reducer;
