import {createSlice} from '@reduxjs/toolkit';
import {ProfileData} from '../../models/ProfileModel';


interface ProfileState {
  data: ProfileData;
}

const initialState: ProfileState = {
  data: {
    active: null,
    ameyaId: '',
    city: '',
    country: '',
    createdAt: '',
    dob: '',
    email: '',
    firstName: '',
    id: '',
    lastName: '',
    mfa: null,
    notes: {key1: ''},
    phoneNumber: '',
    region: '',
    sexAtBirth: '',
    state: '',
    title: '',
    updatedAt: '',
    version: 0,
  },
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    addProfileData(state, action) {
      state.data = action.payload;
    },
  },
});

export const {addProfileData} = profileSlice.actions;
export default profileSlice.reducer;
