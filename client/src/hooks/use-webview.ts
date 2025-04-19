import { useWebView } from "@/contexts/WebViewContext";

/**
 * Custom hook to detect WebView environment.
 * Returns a boolean indicating if the app is running in a WebView.
 */
export function useIsWebView(): boolean {
  const { isWebView } = useWebView();
  return isWebView;
}