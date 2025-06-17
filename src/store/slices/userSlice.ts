import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: {
        id: 0,
        first_name :"",
        last_name:"",
        email: "",
        username: "",
        country_code: "",
        mobile_number: "",
        sex: "",
        date_of_birth: "",
        profile_img: "",
    }
};

const userSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        addUserData(state, action) {
            state.data = action.payload
        },
    },
});

export const {addUserData} = userSlice.actions;
export default userSlice.reducer;
