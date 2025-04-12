
import React from 'react';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';

const NotificationBar: React.FC = () => {
  return (
    <div className="notification-bar flex justify-between items-center">
      <NotificationCenter />
      <Link to="/community" className="flex items-center text-sm text-seekup-purple hover:text-seekup-purple/80 font-medium">
        <Award className="h-4 w-4 mr-1" />
        Community Impact
      </Link>
    </div>
  );
};

export default NotificationBar;
