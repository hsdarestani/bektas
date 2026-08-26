import { Component, ErrorInfo, ReactNode } from "react";

type Props = {
  children: ReactNode;
  resetKey: number;
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

  componentDidUpdate(previous: Props) {
    if (previous.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    return this.state.error ? null : this.props.children;
  }
}
