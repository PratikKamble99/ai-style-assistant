import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

interface Recommendation {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'bg-red-100',
          iconColor: 'text-red-600',
          title: 'text-red-900',
          message: 'text-red-700',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'medium':
        return {
          container: 'bg-amber-50 border-amber-200',
          icon: 'bg-amber-100',
          iconColor: 'text-amber-600',
          title: 'text-amber-900',
          message: 'text-amber-700',
          button: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'bg-blue-100',
          iconColor: 'text-blue-600',
          title: 'text-blue-900',
          message: 'text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'style_tip':
        return Sparkles;
      case 'seasonal_update':
        return TrendingUp;
      default:
        return AlertCircle;
    }
  };

  const styles = getPriorityStyles(recommendation.priority);
  const Icon = getIcon(recommendation.type);

  return (
    <div className={`border rounded-xl p-6 ${styles.container}`}>
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${styles.icon}`}>
          <Icon className={`w-6 h-6 ${styles.iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold mb-2 ${styles.title}`}>
            {recommendation.title}
          </h3>
          <p className={`mb-4 ${styles.message}`}>
            {recommendation.message}
          </p>
          {recommendation.actionUrl && (
            <Link
              to={recommendation.actionUrl}
              className={`inline-block px-4 py-2 rounded-lg font-medium transition-colors ${styles.button}`}
            >
              Take Action
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;