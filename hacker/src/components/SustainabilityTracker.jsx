import React, { useState } from 'react';
import { Leaf, Zap, TrendingDown, Award, BarChart3, Recycle } from 'lucide-react';
import { dataStore } from '../utils/dataStore';

const SustainabilityTracker = ({ equipmentId, equipment }) => {
  const [activeTab, setActiveTab] = useState('energy');

  // Calculate sustainability metrics
  const calculateEnergyMetrics = () => {
    const age = new Date().getFullYear() - new Date(equipment.purchaseDate).getFullYear();
    const healthScore = equipment.healthScore;
    
    // Estimate energy consumption based on equipment type and health
    let baseConsumption = 100; // kWh per month
    let efficiencyRating = 3; // 1-5 stars
    
    if (equipment.name.toLowerCase().includes('server')) {
      baseConsumption = 500;
      efficiencyRating = healthScore > 80 ? 4 : healthScore > 60 ? 3 : 2;
    } else if (equipment.name.toLowerCase().includes('cnc')) {
      baseConsumption = 800;
      efficiencyRating = healthScore > 80 ? 3 : healthScore > 60 ? 2 : 1;
    } else if (equipment.name.toLowerCase().includes('chiller')) {
      baseConsumption = 1200;
      efficiencyRating = healthScore > 80 ? 4 : healthScore > 60 ? 3 : 2;
    } else if (equipment.name.toLowerCase().includes('generator')) {
      baseConsumption = 2000;
      efficiencyRating = healthScore > 80 ? 3 : healthScore > 60 ? 2 : 1;
    }

    // Adjust consumption based on health and age
    const healthMultiplier = healthScore < 40 ? 1.5 : healthScore < 70 ? 1.2 : 1.0;
    const ageMultiplier = age > 5 ? 1.3 : age > 3 ? 1.1 : 1.0;
    
    const currentConsumption = Math.round(baseConsumption * healthMultiplier * ageMultiplier);
    const optimalConsumption = Math.round(baseConsumption * 0.8); // 20% improvement with new equipment
    const potentialSavings = currentConsumption - optimalConsumption;
    
    return {
      currentConsumption,
      optimalConsumption,
      potentialSavings,
      efficiencyRating,
      annualCost: Math.round(currentConsumption * 12 * 0.12), // $0.12 per kWh
      potentialAnnualSavings: Math.round(potentialSavings * 12 * 0.12)
    };
  };

  const calculateCarbonFootprint = () => {
    const energyMetrics = calculateEnergyMetrics();
    const carbonFactor = 0.4; // kg CO2 per kWh (average grid mix)
    
    const currentEmissions = Math.round(energyMetrics.currentConsumption * carbonFactor);
    const optimalEmissions = Math.round(energyMetrics.optimalConsumption * carbonFactor);
    const emissionReduction = currentEmissions - optimalEmissions;
    
    return {
      currentEmissions,
      optimalEmissions,
      emissionReduction,
      annualEmissions: Math.round(currentEmissions * 12),
      potentialAnnualReduction: Math.round(emissionReduction * 12)
    };
  };

  const calculateWasteMetrics = () => {
    const requests = dataStore.getRequests().filter(r => r.equipmentId === equipmentId);
    const correctiveRequests = requests.filter(r => r.type === 'Corrective');
    
    // Estimate waste generated from repairs
    const partsWaste = correctiveRequests.length * 2.5; // kg per repair
    const oilWaste = correctiveRequests.length * 1.2; // liters per repair
    const metalWaste = correctiveRequests.length * 0.8; // kg per repair
    
    return {
      partsWaste: Math.round(partsWaste * 10) / 10,
      oilWaste: Math.round(oilWaste * 10) / 10,
      metalWaste: Math.round(metalWaste * 10) / 10,
      totalWaste: Math.round((partsWaste + metalWaste) * 10) / 10,
      recyclingPotential: Math.round((metalWaste * 0.9 + partsWaste * 0.3) * 10) / 10
    };
  };

  const energyMetrics = calculateEnergyMetrics();
  const carbonMetrics = calculateCarbonFootprint();
  const wasteMetrics = calculateWasteMetrics();

  const getEfficiencyStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getSustainabilityGrade = () => {
    const energyScore = energyMetrics.efficiencyRating * 20;
    const healthScore = equipment.healthScore;
    const wasteScore = wasteMetrics.recyclingPotential > 2 ? 80 : 60;
    
    const overallScore = (energyScore + healthScore + wasteScore) / 3;
    
    if (overallScore >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (overallScore >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (overallScore >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (overallScore >= 50) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const sustainabilityGrade = getSustainabilityGrade();

  const tabs = [
    { id: 'energy', label: 'Energy Impact', icon: Zap },
    { id: 'carbon', label: 'Carbon Footprint', icon: Leaf },
    { id: 'waste', label: 'Waste & Recycling', icon: Recycle }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Leaf className="h-6 w-6 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Sustainability Impact</h3>
        </div>
        
        {/* Sustainability Grade */}
        <div className={`px-4 py-2 rounded-lg ${sustainabilityGrade.bg}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${sustainabilityGrade.color}`}>
              {sustainabilityGrade.grade}
            </div>
            <div className="text-xs text-gray-600">Eco Rating</div>
          </div>
        </div>
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
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Energy Impact Tab */}
      {activeTab === 'energy' && (
        <div className="space-y-4">
          {/* Energy Efficiency Rating */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">Energy Efficiency Rating</h4>
              <div className="text-2xl">{getEfficiencyStars(energyMetrics.efficiencyRating)}</div>
            </div>
            <p className="text-sm text-blue-800">
              {energyMetrics.efficiencyRating}/5 stars - {
                energyMetrics.efficiencyRating >= 4 ? 'Excellent' :
                energyMetrics.efficiencyRating >= 3 ? 'Good' :
                energyMetrics.efficiencyRating >= 2 ? 'Fair' : 'Poor'
              } efficiency
            </p>
          </div>

          {/* Energy Consumption */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {energyMetrics.currentConsumption}
              </div>
              <div className="text-sm text-gray-600">kWh/month (Current)</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {energyMetrics.optimalConsumption}
              </div>
              <div className="text-sm text-green-800">kWh/month (Optimal)</div>
            </div>
          </div>

          {/* Potential Savings */}
          <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingDown className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-900">Potential Energy Savings</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {energyMetrics.potentialSavings} kWh/month
                </div>
                <div className="text-sm text-green-800">Energy reduction</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  ${energyMetrics.potentialAnnualSavings}
                </div>
                <div className="text-sm text-green-800">Annual cost savings</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Energy Optimization Tips</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Regular maintenance improves energy efficiency by 10-15%</li>
              <li>• Consider upgrading to energy-efficient components</li>
              <li>• Monitor usage patterns to optimize operating schedules</li>
              {energyMetrics.efficiencyRating < 3 && (
                <li>• Equipment replacement may provide significant energy savings</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Carbon Footprint Tab */}
      {activeTab === 'carbon' && (
        <div className="space-y-4">
          {/* Current Emissions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {carbonMetrics.currentEmissions}
              </div>
              <div className="text-sm text-red-800">kg CO₂/month (Current)</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {carbonMetrics.optimalEmissions}
              </div>
              <div className="text-sm text-green-800">kg CO₂/month (Target)</div>
            </div>
          </div>

          {/* Annual Impact */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Annual Carbon Impact</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {carbonMetrics.annualEmissions} kg CO₂
                </div>
                <div className="text-sm text-blue-800">Current annual emissions</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  -{carbonMetrics.potentialAnnualReduction} kg CO₂
                </div>
                <div className="text-sm text-green-800">Potential reduction</div>
              </div>
            </div>
          </div>

          {/* Carbon Offset Equivalent */}
          <div className="p-4 bg-green-100 rounded-lg">
            <div className="flex items-center mb-2">
              <Award className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-900">Carbon Offset Equivalent</h4>
            </div>
            <p className="text-sm text-green-800">
              Reducing emissions by {carbonMetrics.potentialAnnualReduction} kg CO₂ annually is equivalent to:
            </p>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>🌳 Planting {Math.round(carbonMetrics.potentialAnnualReduction / 22)} trees</li>
              <li>🚗 Removing a car for {Math.round(carbonMetrics.potentialAnnualReduction / 4600 * 365)} days</li>
              <li>💡 Powering {Math.round(carbonMetrics.potentialAnnualReduction / 400)} homes for 1 month</li>
            </ul>
          </div>
        </div>
      )}

      {/* Waste & Recycling Tab */}
      {activeTab === 'waste' && (
        <div className="space-y-4">
          {/* Waste Generation */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <div className="text-lg font-bold text-orange-600">
                {wasteMetrics.partsWaste} kg
              </div>
              <div className="text-sm text-orange-800">Parts Waste</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">
                {wasteMetrics.oilWaste} L
              </div>
              <div className="text-sm text-blue-800">Oil Waste</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-600">
                {wasteMetrics.metalWaste} kg
              </div>
              <div className="text-sm text-gray-800">Metal Waste</div>
            </div>
          </div>

          {/* Recycling Potential */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Recycle className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-900">Recycling Potential</h4>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {wasteMetrics.recyclingPotential} kg
                </div>
                <div className="text-sm text-green-800">Recyclable materials</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {Math.round((wasteMetrics.recyclingPotential / wasteMetrics.totalWaste) * 100)}%
                </div>
                <div className="text-sm text-green-800">Recycling rate</div>
              </div>
            </div>
          </div>

          {/* Waste Reduction Tips */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Waste Reduction Strategies</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Implement predictive maintenance to reduce part failures</li>
              <li>• Use remanufactured parts when possible</li>
              <li>• Establish proper oil recycling programs</li>
              <li>• Partner with certified waste management companies</li>
              <li>• Track and report waste metrics for continuous improvement</li>
            </ul>
          </div>

          {/* Environmental Certifications */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Environmental Compliance</h4>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-blue-800">ISO 14001 Ready</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-blue-800">EPA Compliant</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-blue-800">LEED Contributing</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SustainabilityTracker;