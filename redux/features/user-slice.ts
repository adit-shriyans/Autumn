import {createSlice, PayloadAction} from '@reduxjs/toolkit'

type InitialState = {
    arr: string[];
    bool: boolean,
}

const initialState = {
        arr: [],
        bool: false,
} as InitialState;

export const user = createSlice({
    name: 'user', 
    initialState,
    reducers: {
        setArr: (state, action: PayloadAction<string[]>) => {
            state.arr = action.payload;
        },
        setBool: (state, action: PayloadAction<boolean>) => {
            state.bool = action.payload;
        },
    }
})

export const {setArr, setBool} = user.actions;
export default user.reducer;