// src/components/QRScanner.jsx
import React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

export const QRScanner = ({ onDecoded }) => {
  return (
    <Scanner
      onScan={(result) => {
        if (result && result[0]?.rawValue) {
          onDecoded(result[0].rawValue);
        }
      }}
      onError={(error) => {
        console.error(error);
      }}
      components={{
        audio: false,
        torch: true,
        zoom: true
      }}
      videoStyle={{ width: '100%' }}
    />
  );
};
