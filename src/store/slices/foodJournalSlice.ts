import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FoodJournalResponse } from '../../models/FoodJournalModel';

interface FoodJournalState {
    data: FoodJournalResponse | null;
}

const initialState: FoodJournalState = {
    data: null,
};

const foodJournalSlice = createSlice({
    name: 'foodJournal',
    initialState,
    reducers: {
        fetchFoodJournalSuccess(state, action: PayloadAction<FoodJournalResponse>) {
            state.data = action.payload;
        },
        clearFoodJournal(state) {
            state.data = null;
        },
    },
});

export const {
    fetchFoodJournalSuccess,
    clearFoodJournal,
} = foodJournalSlice.actions;

export default foodJournalSlice.reducer;
