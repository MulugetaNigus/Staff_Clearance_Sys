import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actionButton?: {
    text: string;
    onClick: () => void;
    color?: 'blue' | 'green' | 'purple' | 'orange';
  };
  illustration?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = '📋',
  actionButton,
  illustration
}) => {
  const getButtonColorClasses = (color: string = 'blue') => {
    const colorMap = {
      blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
      orange: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center max-w-md mx-auto">
        {/* Icon or Illustration */}
        <div className="mb-8">
          {illustration ? (
            illustration
          ) : (
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
              <span className="text-4xl">{icon}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          {description}
        </p>

        {/* Action Button */}
        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white transition-colors duration-200 ${getButtonColorClasses(actionButton.color)} focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {actionButton.text}
            <svg
              className="ml-2 -mr-1 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* Additional Help Text */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-600">
            💡 <strong>Need help?</strong> Contact your HR department or system administrator for assistance with the clearance process.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
