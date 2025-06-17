import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    ingredients_edited: false,
};

const ingredientsEditSlice = createSlice({
    name: "ingredientsEdited",
    initialState,
    reducers: {
        setIngredientEditTrue(state) {
            state.ingredients_edited = true
        },
        setIngredientEditFalse(state) {
            state.ingredients_edited = false
        },
    },
});

export const { setIngredientEditTrue, setIngredientEditFalse } = ingredientsEditSlice.actions;
export default ingredientsEditSlice.reducer;