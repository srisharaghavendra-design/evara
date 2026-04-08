import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ fontFamily: "monospace", padding: 40, background: "#0D0D0F", color: "#FF453A", minHeight: "100vh" }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>⚠️ evara crashed</div>
          <div style={{ fontSize: 14, color: "#FF9F0A", marginBottom: 8 }}>
            {this.state.error.message}
          </div>
          <pre style={{ fontSize: 11, color: "#636366", whiteSpace: "pre-wrap" }}>
            {this.state.error.stack?.slice(0, 600)}
          </pre>
          <button onClick={() => window.location.reload()} 
            style={{ marginTop: 24, padding: "10px 24px", background: "#0A84FF", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
