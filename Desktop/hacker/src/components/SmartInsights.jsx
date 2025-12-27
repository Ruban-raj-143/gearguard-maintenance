import React, { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  DollarSign,
  Zap
} from 'lucide-react';
import { FailurePredictionEngine, CostCalculator } from '../utils/smartFeatures';
import { formatDate } from '../utils/helpers';

const SmartInsights = ({ equipmentId, equipment }) => {
  const [activeTab, setActiveTab] = useState('prediction');

  const prediction = FailurePredictionEngine.calculateRiskLevel(equipmentId);
  const nextFailure = FailurePredictionEngine.predictNextFailure(equipmentId);
  const costAnalysis = CostCalculator.calculateMaintenanceCosts(equipmentId);

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-orange-600 bg-orange-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'prediction', label: 'AI Prediction', icon: Brain },
    { id: 'cost', label: 'Cost Analysis', icon: DollarSign },
    { id: 'recommendations', label: 'Smart Tips', icon: Zap }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <Brain className="h-6 w-6 text-purple-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Smart Insights</h3>
        <span className="ml-2 text-sm text-gray-500">AI-Powered Analytics</span>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Prediction Tab */}
      {activeTab === 'prediction' && (
        <div className="space-y-4">
          {/* Risk Level */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Failure Risk Level</h4>
              <p className="text-sm text-gray-600">Based on AI analysis of multiple factors</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(prediction.level)}`}>
                {prediction.level} Risk
              </span>
              <div className="text-xs text-gray-500 mt-1">
                {prediction.confidence}% confidence
              </div>
            </div>
          </div>

          {/* Next Predicted Failure */}
          {nextFailure && (
            <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-orange-600 mr-2" />
                <h4 className="font-medium text-orange-900">Predicted Next Issue</h4>
              </div>
              <p className="text-sm text-orange-800 mb-2">
                Estimated: {formatDate(nextFailure.predictedDate)} 
                <span className="ml-2 text-orange-600">
                  ({nextFailure.daysToFailure} days from now)
                </span>
              </p>
              <div className="text-xs text-orange-700">
                Confidence: {nextFailure.confidence}%
              </div>
            </div>
          )}

          {/* Risk Factors */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Risk Factors Detected</h4>
            <div className="space-y-2">
              {prediction.reasons.map((reason, index) => (
                <div key={index} className="flex items-center p-2 bg-yellow-50 rounded">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 flex-shrink-0" />
                  <span className="text-sm text-yellow-800">{reason}</span>
                </div>
              ))}
              {prediction.reasons.length === 0 && (
                <div className="flex items-center p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">No major risk factors detected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cost Analysis Tab */}
      {activeTab === 'cost' && costAnalysis && (
        <div className="space-y-4">
          {/* Total Costs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${costAnalysis.totalMaintenanceCost.toLocaleString()}
              </div>
              <div className="text-sm text-blue-800">Total Maintenance Cost</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${costAnalysis.estimatedCurrentValue.toLocaleString()}
              </div>
              <div className="text-sm text-green-800">Estimated Current Value</div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Cost Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Emergency Repairs:</span>
                <span className="text-sm font-medium text-red-600">
                  ${costAnalysis.correctiveCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Planned Maintenance:</span>
                <span className="text-sm font-medium text-green-600">
                  ${costAnalysis.preventiveCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Downtime Cost:</span>
                <span className="text-sm font-medium text-orange-600">
                  ${costAnalysis.costBreakdown.downtime.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Replacement Decision */}
          <div className={`p-4 rounded-lg ${
            costAnalysis.shouldReplace ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center mb-2">
              {costAnalysis.shouldReplace ? (
                <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
              ) : (
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              )}
              <h4 className={`font-medium ${
                costAnalysis.shouldReplace ? 'text-red-900' : 'text-green-900'
              }`}>
                Financial Recommendation
              </h4>
            </div>
            <p className={`text-sm ${
              costAnalysis.shouldReplace ? 'text-red-800' : 'text-green-800'
            }`}>
              {costAnalysis.recommendation}
            </p>
            <div className="text-xs text-gray-600 mt-1">
              Maintenance-to-Value Ratio: {Math.round(costAnalysis.maintenanceToValueRatio * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && nextFailure && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">AI Recommendations</h4>
            <div className="space-y-3">
              {nextFailure.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start p-3 bg-purple-50 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-purple-900 font-medium">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Scheduling */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Smart Scheduling Suggestion</h4>
            <p className="text-sm text-blue-800">
              Based on risk analysis, schedule next preventive maintenance within{' '}
              <span className="font-medium">
                {prediction.level === 'High' ? '1 week' : 
                 prediction.level === 'Medium' ? '2 weeks' : '1 month'}
              </span>
            </p>
          </div>

          {/* Performance Optimization */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Performance Optimization</h4>
            <p className="text-sm text-green-800">
              Increase preventive maintenance frequency by{' '}
              <span className="font-medium">
                {prediction.level === 'High' ? '50%' : 
                 prediction.level === 'Medium' ? '25%' : '0%'}
              </span>
              {' '}to improve equipment reliability and reduce emergency repairs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartInsights;