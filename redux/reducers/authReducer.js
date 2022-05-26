import { createAction, createReducer } from "@reduxjs/toolkit";
import axiosBase from "../../utils/Api.js";
import clearItem from "../../utils/clearItem.js";
import saveItem from "../../utils/SaveItem.js";

export const loginUser = createAction("auth/login");
export const logoutUser = createAction("auth/logout");

const initialState = {
  authenticated: false,
  user: null,
};

export const authReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(loginUser, (state, action) => {
      state.authenticated = true;
      state.user = action.payload;
      saveItem("auth", JSON.stringify(action.payload));
      saveItem("token", action.payload?.access_token);
    })
    .addCase(logoutUser, (state, action) => {
      state.authenticated = false;
      (state.user = null), axiosBase.get("/accounts/logout");
      clearItem("auth");
    });
});
