import type { MatchResult } from "./skillMatcher";

interface MatchScoreCardProps {
  matchResult: MatchResult;
  onApply?: () => void;
  onSkip?: () => void;
}

export function MatchScoreCard({ matchResult, onApply, onSkip }: MatchScoreCardProps) {
  const { overallScore, matchedSkills, missingSkills, recommendations, summary } = matchResult;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-blue-100";
    if (score >= 40) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "required":
        return "bg-red-100 text-red-700 border-red-200";
      case "preferred":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "required":
        return "🔴";
      case "preferred":
        return "🟡";
      default:
        return "⚪";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">📊 Job Match Analysis</h3>
        <div
          className={`px-3 py-1 rounded-full text-lg font-bold ${getScoreColor(overallScore)} ${getScoreBackground(overallScore)}`}
        >
          {overallScore}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${
            overallScore >= 80
              ? "bg-green-500"
              : overallScore >= 60
              ? "bg-blue-500"
              : overallScore >= 40
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${overallScore}%` }}
        />
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-600">{summary}</p>

      {/* Matched Skills */}
      {matchedSkills.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-2">
            ✅ Matching Skills ({matchedSkills.length})
          </h4>
          <div className="flex flex-wrap gap-1">
            {matchedSkills.slice(0, 12).map((skill, idx) => (
              <span
                key={idx}
                className={`px-2 py-0.5 text-xs rounded-full ${
                  skill.confidence === "high"
                    ? "bg-green-100 text-green-700"
                    : skill.confidence === "medium"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {skill.skill}
              </span>
            ))}
            {matchedSkills.length > 12 && (
              <span className="px-2 py-0.5 text-xs text-gray-500">
                +{matchedSkills.length - 12} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-2">
            ⚠️ Skill Gaps ({missingSkills.length})
          </h4>
          <div className="space-y-1">
            {missingSkills.slice(0, 6).map((skill, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded-lg border ${getPriorityColor(skill.priority)}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">{getPriorityIcon(skill.priority)}</span>
                  <span className="text-xs font-medium">{skill.skill}</span>
                </div>
                {skill.suggestion && (
                  <span className="text-xs opacity-75 max-w-[50%] truncate">
                    {skill.suggestion}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="text-xs font-medium text-blue-800 mb-2">💡 Recommendations</h4>
          <ul className="space-y-1">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs text-blue-700">
                • {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      {(onApply || onSkip) && (
        <div className="flex gap-2 pt-2">
          {onSkip && (
            <button
              onClick={onSkip}
              className="flex-1 py-2 px-4 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Skip This Job
            </button>
          )}
          {onApply && (
            <button
              onClick={onApply}
              className="flex-1 py-2 px-4 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Apply → Generate CV
            </button>
          )}
        </div>
      )}
    </div>
  );
}
