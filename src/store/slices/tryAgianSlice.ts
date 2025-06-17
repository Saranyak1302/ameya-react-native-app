import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    try_again: false,
};

const tryAgainSlice = createSlice({
    name: "tryAgain",
    initialState,
    reducers: {
        setTryAgainTrue(state) {
            state.try_again = true
        },
        setTryAgainFalse(state) {
            state.try_again = false
        },
    },
});

export const { setTryAgainTrue,setTryAgainFalse } = tryAgainSlice.actions;
export default tryAgainSlice.reducer;
