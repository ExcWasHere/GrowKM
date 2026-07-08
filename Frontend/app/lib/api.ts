import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const currentPath = window.location.pathname;
    window.location.href = `/sign-in?redirect=${encodeURIComponent(currentPath)}`;
    throw new Error('Unauthorized - redirecting to sign-in');
  }

  return response;
};