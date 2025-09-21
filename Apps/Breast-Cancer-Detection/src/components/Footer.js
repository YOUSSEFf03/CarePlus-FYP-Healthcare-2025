import React from 'react';
import { Heart, Shield, Users } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 backdrop-blur-md border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <Heart className="w-6 h-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Healthcare AI</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Advanced AI technology for early breast cancer detection and analysis.
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Privacy First</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Your medical images are processed securely and never stored permanently.
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end mb-4">
              <Users className="w-6 h-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Research Based</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Built on extensive medical research and clinical validation studies.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 CancerAI. This tool is for research purposes only. 
            Always consult with healthcare professionals for medical decisions.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
