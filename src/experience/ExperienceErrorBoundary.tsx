import { Component, ErrorInfo, ReactNode } from "react";

type Props = {
  children: ReactNode;
  onError: (error: Error, info: ErrorInfo) => void;
};

type State = { error: Error | null };

export default class ExperienceErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError(error, info);
  }

  render() {
    return this.state.error ? null : this.props.children;
  }
}
