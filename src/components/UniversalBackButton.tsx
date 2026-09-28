/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ActiveView } from './Navbar';

interface UniversalBackButtonProps {
  currentView: ActiveView;
  setView: (view: ActiveView) => void;
  onBack?: () => void;
}

export const UniversalBackButton: React.FC<UniversalBackButtonProps> = ({
  currentView,
  setView,
  onBack
}) => {
  // Navigation back button is now natively integrated into the sticky Navbar top-left contextual taskbar to prevent duplicate stacked bars.
  return null;
};
