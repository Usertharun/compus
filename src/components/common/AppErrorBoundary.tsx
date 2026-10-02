import { Component, type ReactNode } from 'react';
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-bold">Compus couldn’t load this page</h1>
      <p className="text-sm text-muted-foreground">Reload to try again. If this keeps happening, contact the Compus owner.</p>
      <button className="rounded-xl bg-primary text-primary-foreground px-5 py-3" onClick={() => window.location.reload()}>Reload Compus</button>
    </main>;
    return this.props.children;
  }
}
