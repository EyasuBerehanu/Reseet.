import React from 'react';

interface ScoreBarProps {
  score: number; // 0-100
  showLabel?: boolean;
}

export function ScoreBar({ score, showLabel = false }: ScoreBarProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return '#558E00'; // green
    if (score >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Likely';
    if (score >= 40) return 'Maybe';
    return 'Unlikely';
  };

  return (
    <div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            backgroundColor: getScoreColor(score),
          }}
        />
      </div>
      {showLabel && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-gray-900">Score: {score} / 100</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-600">{getScoreLabel(score)}</span>
        </div>
      )}
    </div>
  );
}
