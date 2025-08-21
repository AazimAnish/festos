declare module 'react-qr-scanner' {
  import { CSSProperties, Component } from 'react';

  interface VideoConstraints {
    facingMode?: string | string[];
    [key: string]: unknown;
  }

  interface CustomMediaTrackConstraints {
    video?: VideoConstraints;
    audio?: boolean;
    [key: string]: unknown;
  }

  export interface QrScannerProps {
    delay?: number;
    style?: CSSProperties;
    onError?: (error: Error) => void;
    onScan?: (data: string | null) => void;
    constraints?: CustomMediaTrackConstraints;
    className?: string;
  }

  export default class QrScanner extends Component<QrScannerProps> {}
}
