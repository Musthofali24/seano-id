import useLoadingTimeout from "../hooks/useLoadingTimeout";

const LoadingWrapper = ({
  loading,
  hasData,
  timeout = 5000,
  children,
  fallback = null,
}) => {
  const { loading: timeoutLoading } = useLoadingTimeout(loading, timeout);

  // Show loading only if still loading and within timeout
  const shouldShowLoading = timeoutLoading && loading && !hasData;

  if (shouldShowLoading) {
    return fallback || children;
  }

  return children;
};

export default LoadingWrapper;
