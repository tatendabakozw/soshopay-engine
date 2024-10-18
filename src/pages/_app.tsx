import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <div className="text-zinc-700">
    <Component {...pageProps} />
  </div>
}
