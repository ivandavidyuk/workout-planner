import "../styles/globals.css";
import type { AppProps } from "next/app";
import { WorkoutProvider } from "../context/WorkoutContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WorkoutProvider>
      <Component {...pageProps} />
    </WorkoutProvider>
  );
}

export default MyApp;
