/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VoiceModal } from './VoiceModal';

interface VoiceViewProps {
  onSwitchToChat: (transcript: string) => void;
  ceoMode: boolean;
}

export const VoiceView: React.FC<VoiceViewProps> = ({
  onSwitchToChat,
  ceoMode
}) => {
  return (
    <VoiceModal
      isOpen={true}
      onClose={() => onSwitchToChat('')}
      ceoMode={ceoMode}
      onSwitchToChat={onSwitchToChat}
    />
  );
};
