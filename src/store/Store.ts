import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';
import foodJournalReducer from './slices/foodJournalSlice';
import profileReducer from './slices/profileSlice';
import passioConfigReducer from './slices/passioConfigSlice';
import selectedFoodReducer from './slices/selectedFoodSlice';
import hcpOrgReducer from './slices/hcpOrgSlice';
import movementReducer from './slices/movementSlice';
import doctorMovementReducer from './slices/doctorMovementSlice';
import doctorOrderReducer from './slices/doctorOrderSlice';
import patientUploadReducer from './slices/patientUploadSlice';
import tryAgianReducer from './slices/tryAgianSlice';
import ingredientsEditReducer from './slices/ingredientsEditSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    order: orderReducer,
    foodJournal: foodJournalReducer,
    profile: profileReducer,
    passioConfig: passioConfigReducer,
    selectedFood: selectedFoodReducer,
    hcpOrg: hcpOrgReducer,
    movement: movementReducer,
    doctormovement: doctorMovementReducer,
    doctorOrder: doctorOrderReducer,
    patientVideoUpload: patientUploadReducer,
    tryAgain: tryAgianReducer,
    ingredientsEdit: ingredientsEditReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
