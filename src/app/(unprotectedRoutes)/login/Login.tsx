"use client";

import React, { useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "@/app/theme/theme";
import LoginForm from "../../components/molecules/Login/LoginForm";
import { useAuth } from "@/customhooks/useAuth";
import { useGetLoginDataMutation } from "./LoginApi";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { triggerToast } from "@/utils/toast";

interface LoginFormData {
  userName: string;
  password: string;
}
const STATIC_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};


const Login: React.FC = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [triggerLogin] = useGetLoginDataMutation();

  const handleSubmit = async (data: LoginFormData) => {
    setError("");
        // ✅ Trim inputs to avoid whitespace issues
    const username = data.userName.trim();
    const password = data.password.trim();

    // ✅ Correct condition: compare username to username, password to password
    if (username !== STATIC_CREDENTIALS.username || password !== STATIC_CREDENTIALS.password) {
      const errorMsg = "Invalid username or password";
      setError(errorMsg);
      triggerToast(errorMsg, "error");
      return; // stop here, no loading
    }
    setIsLoading(true);

    try {
      // const response = await triggerLogin(data).unwrap();

      // const token = response.data.tokenOrError;
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhNmFiODNhMDI5YzMxNjU1IiwidXNlck5hbWUiOiJhcGVrc2h5YTEyMyIsImZpcnN0TmFtZSI6IkFwZWtzaHlhIiwibGFzdE5hbWUiOiJSYWhhbmUiLCJzaWQiOm51bGwsInJvbGVzIjpbeyJhcHBJZCI6IkVUUExfU09MVVRJT05fMyIsInJvbGVJZCI6IlI2IiwiYXBwTmFtZSI6IlNjb3V0Iiwicm9sZU5hbWUiOiJPcmdhbmlzYXRpb25fQWRtaW5fU2NvdXQiLCJ1c2VyUm9sZUlkIjoiZGQ4Mzk4MGM2MTUyZDAxMCJ9LHsiYXBwSWQiOiJFVFBMX1NPTFVUSU9OXzMiLCJyb2xlSWQiOiJSNiIsImFwcE5hbWUiOiJTY291dCIsInJvbGVOYW1lIjoiT3JnYW5pc2F0aW9uX0FkbWluX1Njb3V0IiwidXNlclJvbGVJZCI6ImRkODM5ODBjNjE1MmQwMTAifSx7ImFwcElkIjoiRVRQTF9TT0xVVElPTl8zIiwicm9sZUlkIjoiUjYiLCJhcHBOYW1lIjoiU2NvdXQiLCJyb2xlTmFtZSI6Ik9yZ2FuaXNhdGlvbl9BZG1pbl9TY291dCIsInVzZXJSb2xlSWQiOiJkZDgzOTgwYzYxNTJkMDEwIn0seyJhcHBJZCI6IkVUUExfU09MVVRJT05fMyIsInJvbGVJZCI6IlI2IiwiYXBwTmFtZSI6IlNjb3V0Iiwicm9sZU5hbWUiOiJPcmdhbmlzYXRpb25fQWRtaW5fU2NvdXQiLCJ1c2VyUm9sZUlkIjoiZGQ4Mzk4MGM2MTUyZDAxMCJ9XSwibGljZW5zZXMiOlt7ImFwcElkIjoiRVRQTF9TT0xVVElPTl8zIiwiZXhwaXJlc09uIjoiMjAyOC0wNC0wNiIsImxpY2Vuc2VJZCI6IkxJQy1CLVRyb3VibGUiLCJsaWNlbnNlVHlwZUlkIjoiTFQtU2NvdXQtdjIiLCJsaWNlbnNlVHlwZU5hbWUiOiJMVC1TQ09VVC12MiJ9XSwiZmVhdHVyZXMiOlsiU0YwMDEiLCJTRjAwMiIsIlNGMDAzIiwiU0YwMDQiLCJTRjAwNSIsIlNGMDA2IiwiU0YwMDciLCJTRjAwOCIsIlNGMDA5IiwiU0YwMTAiLCJTRjAxMSIsIlNGMDEyIiwiU0YwMTMiLCJTRjAxNCIsIlNGMDE1IiwiU0YwMTYiLCJTRjAxNyIsIlNGMDE4IiwiU0YwMTkiLCJTRjAyMCIsIlNGMDIxIiwiU1VDMDAxIiwiU1VDMDAyIiwiU1VDMDAzIiwiU1VDMDA0IiwiU1VDMDA1IiwiU1VDMDA2IiwiU1VDMDA3IiwiU1VDMDA4IiwiU1VDMDA5IiwiU1VDMDEwIiwiU1VDMDExIiwiU1VDMDEyIiwiU1VDMDEzIiwiU1VDMDE0IiwiU1VDMDE2IiwiU1VDMDE3IiwiU1VDMDE4IiwiU1VDMDE5IiwiU1VDMDIwIiwiU1VDMDIxIiwiU1VDMDIyIl0sIm9yZ19pZCI6IjU2ZjlkYmY4NDJmZDQ1YTEiLCJpYXQiOjE3ODIyOTcxMzUsImV4cCI6MTc4MjMwMDczNSwiaXNzIjoieW91ci1hcHAtbmFtZSJ9.eTu_Rd7JESv2rI3_hBzCPFEeMt0N-O19DUuj_I758FU"
     const result = login(token);

      if (result?.type === "LOGIN_SUCCESS") {
        triggerToast("Login successful!", "success");
      }

      if (result?.type === "RESET_REQUIRED") {
        triggerToast("Please reset your password", "info");
      }
    } catch (err) {
      const fetchError = err as FetchBaseQueryError & {
        data?: { details?: string; error?: string };
      };

      const errorMsg =
        fetchError.data?.details ||
        fetchError.data?.error ||
        "Invalid username or password";

      setError(errorMsg);
      triggerToast(errorMsg, "error");




      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoginForm
        showPassword={showPassword}
        isLoading={isLoading}
        error={error}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        onSubmit={handleSubmit}
      />
    </ThemeProvider>
  );
};

export default Login;
