import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MovementResponseModel} from '../../models/MovementModel'; // Adjust the import path accordingly

// Define the state interface
interface MovementState {
  movement: MovementResponseModel | null;
}

// Define the initial state
const initialState: MovementState = {
  movement: null,
};

// Create the slice
const movementSlice = createSlice({
  name: 'movement',
  initialState,
  reducers: {
    // Action to set movement response
    setMovementResponse(state, action: PayloadAction<MovementResponseModel>) {
      state.movement = action.payload;
    },
    // Action to clear movement response
    clearMovementResponse(state) {
      state.movement = null;
    },
  },
});

// Export actions and reducer
export const {setMovementResponse, clearMovementResponse} =
  movementSlice.actions;
export default movementSlice.reducer;
