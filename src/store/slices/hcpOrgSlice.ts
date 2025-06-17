import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HcpOrgInfo } from '../../models/HcpOrgModel';

interface HcpOrgState {
    data: HcpOrgInfo | null;
}

const initialState: HcpOrgState = {
    data: null,
};

const hcpOrgSlice = createSlice({
    name: 'hcpOrg',
    initialState,
    reducers: {
        fetchHcpOrgSuccess(state, action: PayloadAction<HcpOrgInfo>) {
            state.data = action.payload;
        },
    },
});

export const {
    fetchHcpOrgSuccess,
} = hcpOrgSlice.actions;

export default hcpOrgSlice.reducer;