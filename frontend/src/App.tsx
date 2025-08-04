import { Routes, Route, Navigate} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignUp from "./components/SignUpPage";
import ChatLayout from "./components/ChatLayout";
import { ThemeProvider } from "./contexts/ThemeProvider";



function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/loggedInUser/:username" element={<ChatLayout />} />
    </Routes>
    </ThemeProvider>
  );
}

export default App;
