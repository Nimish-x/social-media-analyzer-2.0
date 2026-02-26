import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
                    <h1 className="text-4xl font-bold text-destructive mb-4">Something went wrong</h1>
                    <div className="bg-muted p-6 rounded-lg max-w-2xl w-full overflow-auto border border-border">
                        <h2 className="text-xl font-semibold mb-2 text-red-500">
                            {this.state.error?.toString()}
                        </h2>
                        <details className="whitespace-pre-wrap text-sm text-muted-foreground">
                            {this.state.errorInfo?.componentStack}
                        </details>
                    </div>
                    <Button
                        className="mt-6"
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </Button>
                    <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => window.location.href = '/dashboard'}
                    >
                        Go to Dashboard
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
