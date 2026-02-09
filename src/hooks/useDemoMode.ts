import { useLocalStorage } from "./useLocalStorage";

export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useLocalStorage("deeptrust_demo_mode", true);

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
  };

  return {
    isDemoMode,
    toggleDemoMode,
    enableDemoMode,
    disableDemoMode,
  };
}
