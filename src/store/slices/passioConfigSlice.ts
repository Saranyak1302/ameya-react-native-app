import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    is_Ready: false,
};

const passioConfigSlice = createSlice({
    name: "passio",
    initialState,
    reducers: {
        setIsReadyTrue(state, action) {
            state.is_Ready = true
        },
        setIsReadyFalse(state, action) {
            state.is_Ready = false
        },
    },
});

export const { setIsReadyTrue,setIsReadyFalse } = passioConfigSlice.actions;
export default passioConfigSlice.reducer;
