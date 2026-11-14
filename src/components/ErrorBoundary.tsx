import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('FlowState ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F8F7F4] p-6 text-[#18221D] dark:bg-[#0F1612] dark:text-[#EEF2EE]">
          <div className="max-w-md rounded-xl border border-[#E2E6DF] bg-white p-8 dark:border-[#2C3A33] dark:bg-[#16201B]">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm text-[#5B6860] dark:text-[#A3B0A8]">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-[#2F5D46] px-4 py-2 text-sm font-medium text-white hover:bg-[#264C39]"
            >
              Reload Sanctuary
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
