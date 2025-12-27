import React from 'react';
import { 
  Brain, 
  QrCode, 
  DollarSign, 
  Award, 
  Zap, 
  TrendingUp,
  Smartphone,
  Target,
  Shield,
  Sparkles,
  Leaf
} from 'lucide-react';

const FeatureShowcase = ({ onClose }) => {
  const features = [
    {
      icon: Brain,
      title: 'AI Failure Prediction',
      description: 'Smart algorithms predict equipment failures before they happen',
      color: 'bg-purple-100 text-purple-600',
      benefits: ['Prevent unexpected breakdowns', 'Optimize maintenance schedules', '70% reduction in emergency repairs']
    },
    {
      icon: QrCode,
      title: 'QR Code Equipment Access',
      description: 'Instant equipment access via mobile QR code scanning',
      color: 'bg-blue-100 text-blue-600',
      benefits: ['Field-friendly mobile access', 'Quick breakdown reporting', 'No more searching for equipment']
    },
    {
      icon: DollarSign,
      title: 'Smart Cost Analysis',
      description: 'Data-driven replacement vs repair decisions',
      color: 'bg-green-100 text-green-600',
      benefits: ['ROI-based decisions', 'Cost optimization', 'Financial transparency']
    },
    {
      icon: Award,
      title: 'Skill-Based Matching',
      description: 'Match technicians to equipment based on skills and availability',
      color: 'bg-orange-100 text-orange-600',
      benefits: ['Right person for the job', 'Improved fix rates', 'Balanced workloads']
    },
    {
      icon: Smartphone,
      title: 'Voice Commands',
      description: 'Hands-free maintenance operations with voice control',
      color: 'bg-indigo-100 text-indigo-600',
      benefits: ['Hands-free operation', 'Field-friendly interface', 'Natural language processing']
    },
    {
      icon: Shield,
      title: 'Safety Lockout-Tagout',
      description: 'OSHA-compliant digital safety protocols',
      color: 'bg-red-100 text-red-600',
      benefits: ['OSHA compliance', 'Digital safety tracking', 'Accident prevention']
    },
    {
      icon: Leaf,
      title: 'Sustainability Tracking',
      description: 'Monitor environmental impact and energy efficiency',
      color: 'bg-green-200 text-green-800',
      benefits: ['Carbon footprint tracking', 'Energy optimization', 'Waste reduction']
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'Health score trends and maintenance optimization',
      color: 'bg-yellow-100 text-yellow-600',
      benefits: ['Data-driven insights', 'Trend analysis', 'Performance optimization']
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-90vh overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">GearGuard Unique Features</h2>
                <p className="text-blue-100">Advanced maintenance management capabilities</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Differentiators */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            What Makes GearGuard Different
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Predictive vs Reactive</h4>
                  <p className="text-sm text-gray-600">Prevents failures instead of just tracking them</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Smartphone className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Mobile-First Design</h4>
                  <p className="text-sm text-gray-600">QR codes bridge digital and physical operations</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <Brain className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">AI-Powered Intelligence</h4>
                  <p className="text-sm text-gray-600">Smart automation that actually works</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <DollarSign className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Financial Intelligence</h4>
                  <p className="text-sm text-gray-600">Data-driven cost optimization and ROI analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 rounded-b-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Experience Smart Maintenance?</h3>
            <p className="text-gray-600 mb-4">
              Explore the equipment page to see AI insights, generate QR codes, and experience 
              the future of maintenance management.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;