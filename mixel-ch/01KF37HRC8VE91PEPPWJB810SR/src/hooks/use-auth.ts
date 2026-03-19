export function useAuth() {
  return {
    isAuthenticated: false,
    isLoading: false,
    error: null as Error | null,
    signinRedirect: async () => {
      throw new Error("Hosted sign-in has been removed from this site.");
    },
    removeUser: async () => undefined,
  };
}

export function useUser() {
  return {
    user: null,
    isLoading: false,
    error: null as Error | null,
  };
}
