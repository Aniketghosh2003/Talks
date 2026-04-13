import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f1720",
            color: "#fff",
            fontFamily: "'Segoe UI', sans-serif",
            padding: "24px",
          }}
        >
          <div style={{ maxWidth: "520px", textAlign: "center" }}>
            <h2 style={{ marginBottom: "12px" }}>Something went wrong</h2>
            <p style={{ opacity: 0.85, marginBottom: "20px" }}>
              The app hit an unexpected error. Reload to continue.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                border: "none",
                background: "#00a884",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
