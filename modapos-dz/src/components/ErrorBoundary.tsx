import { Component, type ReactNode, type ErrorInfo } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught render error:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex h-full w-full items-center justify-center bg-[var(--color-bg-base)]">
          <ErrorState
            title="L'application a rencontré une erreur"
            description={
              this.state.error?.message ??
              "Une erreur inattendue s'est produite. Rechargez la page ou redémarrez l'application."
            }
            onRetry={this.handleRetry}
            retryLabel="Réinitialiser"
          />
        </div>
      );
    }

    return this.props.children;
  }
}
