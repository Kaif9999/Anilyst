'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import { 
  chartTypeDescriptions, 
  colorSchemeDescriptions, 
  analyticsFeatureDescriptions,
  interactiveFeatureDescriptions 
} from './feature-descriptions'

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed right-0 top-0 h-full w-96 bg-gray-900 text-white shadow-xl z-50 overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Features Guide</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Chart Types */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Chart Types</h3>
              <div className="space-y-4">
                {Object.entries(chartTypeDescriptions).map(([type, info]) => (
                  <div key={type} className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-400 mb-2">{info.title}</h4>
                    <p className="text-gray-300 text-sm mb-2">{info.description}</p>
                    <p className="text-gray-400 text-sm italic">{info.use}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Color Schemes */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Color Schemes</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(colorSchemeDescriptions).map(([scheme, description]) => (
                  <div key={scheme} className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-400 mb-2 capitalize">{scheme}</h4>
                    <p className="text-gray-300 text-sm">{description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Analytics Features */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Analytics Features</h3>
              <div className="space-y-4">
                {Object.entries(analyticsFeatureDescriptions).map(([feature, info]) => (
                  <div key={feature} className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-400 mb-2">{info.title}</h4>
                    <p className="text-gray-300 text-sm mb-2">{info.description}</p>
                    <ul className="space-y-1">
                      {info.features.map((item, index) => (
                        <li key={index} className="text-gray-400 text-sm flex items-center">
                          <ChevronRight className="w-4 h-4 mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Interactive Features */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Interactive Features</h3>
              <div className="space-y-4">
                {Object.entries(interactiveFeatureDescriptions).map(([feature, info]) => (
                  <div key={feature} className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-400 mb-2">{info.title}</h4>
                    <p className="text-gray-300 text-sm mb-2">{info.description}</p>
                    <ul className="space-y-1">
                      {info.features.map((item, index) => (
                        <li key={index} className="text-gray-400 text-sm flex items-center">
                          <ChevronRight className="w-4 h-4 mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Tips */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Quick Tips</h3>
              <div className="bg-gray-800 p-4 rounded-lg space-y-2">
                <p className="text-gray-300 text-sm">• Hover over any button or control for a detailed description</p>
                <p className="text-gray-300 text-sm">• Use keyboard shortcuts for quick actions (coming soon)</p>
                <p className="text-gray-300 text-sm">• Double-click chart elements for detailed information</p>
                <p className="text-gray-300 text-sm">• Right-click for context menu options</p>
                <p className="text-gray-300 text-sm">• Drag to zoom in on specific areas</p>
              </div>
            </section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 