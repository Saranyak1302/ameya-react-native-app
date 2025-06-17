import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {DoctorMovementResponseModel} from '../../models/DoctorMovementModel';

// Define the state interface
interface MovementState {
  movement: DoctorMovementResponseModel | null;
}

// Define the initial state
const initialState: MovementState = {
  movement: null,
};

// Create the slice
const doctorMovementSlice = createSlice({
  name: 'doctormovement',
  initialState,
  reducers: {
    // Action to set movement response
    setDoctorMovementResponse(state, action: PayloadAction<DoctorMovementResponseModel>) {
      state.movement = action.payload;
    },
    // Action to clear movement response
    clearDoctorMovementResponse(state) {
      state.movement = null;
    },
  },
});

// Export actions and reducer
export const {setDoctorMovementResponse, clearDoctorMovementResponse} =
doctorMovementSlice.actions;
export default doctorMovementSlice.reducer;
