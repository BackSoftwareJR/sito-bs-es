'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import ModernSite from '../../components/ModernSite';

const TerminalExperience = dynamic(
  () => import('../../components/TerminalExperience'),
  { ssr: false }
);

export default function HomePage() {
  const [showTerminal, setShowTerminal] = useState(false);

  return (
    <>
      <ModernSite onSwitchToTerminal={() => setShowTerminal(true)} />
      {showTerminal && (
        <TerminalExperience onSwitchToModern={() => setShowTerminal(false)} />
      )}
    </>
  );
}
