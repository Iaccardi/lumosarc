// components/content/PlatformCard.js - Modern Design
'use client'

import { Plus, Minus, Check } from 'lucide-react'

export default function PlatformCard({ cfg, state, onChange, disabled }) {
  const inc = () => onChange({ ...state, qty: state.qty + 1 })
  const dec = () => onChange({ ...state, qty: Math.max(0, state.qty - 1) })
  
  const toggleType = t => {
    const has = state.types.includes(t)
    const newTypes = has 
      ? state.types.filter(x => x !== t) 
      : [...state.types, t]
    
    onChange({ ...state, types: newTypes })
  }

  const isActive = state.qty > 0

  return (
    <div className={`
      group relative bg-white rounded-xl border transition-all duration-200 overflow-hidden
      ${isActive 
        ? 'border-blue-500 shadow-lg ring-1 ring-blue-500/20' 
        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }
    `}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`
              w-12 h-12 rounded-lg bg-gradient-to-br ${cfg.color} 
              flex items-center justify-center text-white text-xl shadow-sm
            `}>
              {cfg.icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{cfg.name}</h4>
              <p className="text-sm text-gray-500">{cfg.audience}</p>
            </div>
          </div>
          
          {/* Quantity Stepper - Inline & Clean */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={dec}
              disabled={state.qty === 0}
              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center
                       hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors text-gray-600 hover:text-gray-900"
            >
              <Minus size={16} />
            </button>
            
            <div className="w-12 h-8 flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-900">{state.qty}</span>
            </div>
            
            <button
              type="button"
              onClick={inc}
              disabled={disabled}
              className="w-8 h-8 rounded-lg border border-blue-300 bg-blue-50 flex items-center justify-center
                       hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors text-blue-600"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Content Types as Chips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Content Types</span>
            {state.types.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {state.types.length} selected
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {cfg.types.map(type => {
              const isSelected = state.types.includes(type)
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {type}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Active State Indicator */}
      {isActive && (
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 font-medium">
              {state.qty} post{state.qty > 1 ? 's' : ''} selected
            </span>
            <Check size={16} className="text-blue-600" />
          </div>
        </div>
      )}

      {/* Selection indicator */}
      {isActive && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
          {state.qty}
        </div>
      )}
    </div>
  )
}