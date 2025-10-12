import React from 'react';
import { Bell } from 'lucide-react';

interface LiveIndicatorProps {
  isConnected: boolean;
  unreadCount?: number;
}

const LiveIndicator: React.FC<LiveIndicatorProps> = ({ isConnected, unreadCount = 0 }) => {
  return (
    <div className="flex items-center space-x-2">
      {isConnected && (
        <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      )}
      {unreadCount > 0 && (
        <div className="relative">
          <Bell className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveIndicator;