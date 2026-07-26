import AppRouter from "./routes/AppRouter";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AppProvider>
  );
}

export default App;