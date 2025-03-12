import api, { setToken } from "./axios";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logoutSuccess,
} from "../store/slices/authSlice";
import { Dispatch } from "@reduxjs/toolkit";
import { User } from "../types/auth";

// Login user
export const loginUser = async (
  email: string,
  password: string,
  dispatch: Dispatch
) => {
  try {
    dispatch(loginStart());

    const response = await api.post("/auth/login", { email, password });

    console.log("Login response:", response.data);

    dispatch(
      loginSuccess({
        user: response.data.user,
        token: response.data.token,
      })
    );
    await setToken(response.data.token); // Store token using our helper function
    return response.data;
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    dispatch(loginFailure(error.response?.data?.msg || "Login failed"));
    throw error;
  }
};

// Register user
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  dispatch: Dispatch
) => {
  try {
    dispatch(registerStart());

    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    console.log("Register response:", response.data);

    dispatch(
      registerSuccess({
        user: response.data.user,
        token: response.data.token,
      })
    );
    await setToken(response.data.token); // Store token using our helper function
    return response.data;
  } catch (error: any) {
    console.error("Register error:", error.response?.data || error.message);
    dispatch(
      registerFailure(error.response?.data?.msg || "Registration failed")
    );
    throw error;
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem("token"); //remove token from localStorage
  return logoutSuccess();
};

// Get current user (used for token validation and fetching latest user info)
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/user");
    return response.data;
  } catch (error) {
    throw error;
  }
};
