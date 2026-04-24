import React from 'react';

import { useIsMobile } from '@shared/hooks/useIsMobile';

import { DesktopView } from './DesktopView';
import { MobileView } from './MobileView';

export const CustomerListPage: React.FC = () => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileView /> : <DesktopView />;
};
