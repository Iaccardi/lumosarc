// components/content/IdeasList.js
'use client'

import { useState } from 'react'
import IdeaCard from './IdeaCard'

export default function IdeasList({ ideas, keywordScores }) {
  if (!ideas || ideas.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="text-gray-400 text-6xl mb-4">💭</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No ideas to display</h3>
        <p className="text-gray-600">Generate some content ideas to see them here</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ul className="space-y-6">
        {ideas.map(idea => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            keywordScores={keywordScores}
          />
        ))}
      </ul>
    </div>
  )
}