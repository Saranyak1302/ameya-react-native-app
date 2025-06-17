import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    is_Uploaded: false,
};

const patientUploadSlice = createSlice({
    name: "upload",
    initialState,
    reducers: {
        setUploadTrue(state) {
            state.is_Uploaded = true
        },
        setUploadFalse(state) {
            state.is_Uploaded = false
        },
    },
});

export const { setUploadTrue,setUploadFalse } = patientUploadSlice.actions;
export default patientUploadSlice.reducer;
