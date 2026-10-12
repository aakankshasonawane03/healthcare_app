import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
    is_active?: boolean;
}

export interface UserInfo {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
}

export interface AuthState {
    userInfo: UserInfo | null;
}

const initialState: AuthState = {
    userInfo: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<UserInfo>) => {
            state.userInfo = action.payload;
        },

        tokenRefreshed: (state, action: PayloadAction<string>) => {
            if (state.userInfo) {
                state.userInfo.accessToken = action.payload;
            }
        },

        setLogout: (state) => {
            state.userInfo = null;
        },
    },
});

export const { setCredentials, tokenRefreshed, setLogout } = authSlice.actions;

export default authSlice.reducer;
