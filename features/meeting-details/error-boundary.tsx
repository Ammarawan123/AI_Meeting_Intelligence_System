"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Card } from "@/shared/ui/card";

interface Props {
  children: ReactNode;
  title: string;
}

interface State {
  hasError: boolean;
}

export class PanelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`${this.props.title} panel failed:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900">{this.props.title}</h3>
          <p className="mt-2 text-sm text-rose-600">This panel could not load. Please try refreshing the meeting.</p>
        </Card>
      );
    }

    return this.props.children;
  }
}
