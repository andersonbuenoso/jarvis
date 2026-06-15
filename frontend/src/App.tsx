import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./features/auth/AuthContext";
import { ThemeProvider } from "./features/theme/ThemeContext";
import { AppRoutes } from "./routes/AppRoutes";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
