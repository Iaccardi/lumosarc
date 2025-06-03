'use client'

import { useState, useEffect } from 'react'
import {
  ChevronLeft, ChevronRight, Loader2, Check, X,
  CalendarPlus, Sparkles, Wand2, Image, RefreshCw
} from 'lucide-react'

/* ───────── PLATFORM METADATA (Video Formats & YouTube Removed) ───────── */
const PLATFORMS = [
  { id:'instagram', icon:'📷', name:'Instagram', grad:'from-pink-500 to-purple-600', types:['Post','Story'] },
  { id:'facebook',  icon:'📘', name:'Facebook',  grad:'from-blue-600 to-blue-700',   types:['Post','Story'] },
  { id:'linkedin',  icon:'💼', name:'LinkedIn',  grad:'from-blue-700 to-blue-800',   types:['Post','Article'] },
  { id:'twitter',   icon:'🐦', name:'Twitter/X', grad:'from-gray-800 to-black',      types:['Tweet','Thread'] },
  { id:'pinterest', icon:'📌', name:'Pinterest', grad:'from-red-500 to-red-600',     types:['Pin','Board'] },
  { id:'threads',   icon:'🧵', name:'Threads',   grad:'from-gray-800 to-black',      types:['Thread','Reply'] },
  { id:'blog',      icon:'📝', name:'Blog Post', grad:'from-green-600 to-green-700', types:['Article','Tutorial'] }
]

/* ───────── BUTTON SHORTCUT ───────── */
const NavBtn = ({ dir='next', children, ...p }) => (
  <button
    {...p}
    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-1 disabled:opacity-40 transition-colors"
  >
    {dir==='prev' && <ChevronLeft size={16}/>}
    {children}
    {dir==='next' && <ChevronRight size={16}/>}
  </button>
)

/* ───────── MAIN COMPONENT ───────── */
export default function GenerationForm({
  usage       = { limit:0, currentMonth:0 },
  onComplete  = () => {},
  onCancel    = () => {}
}) {
  /* wizard step pointer */
  const [step, setStep] = useState(0)     // 0..4

  /* selections */
  const [platforms, setPlatforms]     = useState({})   // id -> { type }
  const [objective, setObjective]     = useState('')
  const [variations, setVariations]   = useState(1)
  const [imageNeeded, setImageNeeded] = useState(false)
  const [imagePrompt, setImagePrompt] = useState('')

  /* preview */
  const [previews, setPreviews] = useState([])         // [{platformId,platformName,type,body,img}]
  const [busy, setBusy]         = useState(false)

  /* cleanup invalid platforms on mount */
  useEffect(() => {
    setPlatforms(prev => {
      const validPlatforms = {}
      const validPlatformIds = PLATFORMS.map(p => p.id)
      
      for (const [id, config] of Object.entries(prev)) {
        if (validPlatformIds.includes(id)) {
          validPlatforms[id] = config
        }
      }
      
      return validPlatforms
    })
  }, [])

  /* helpers */
  const next = () => setStep(s=>s+1)
  const prev = () => setStep(s=>s-1)

  /* ── toggle a platform */
  const togglePlatform = id => {
    setPlatforms(prev => {
      const copy = { ...prev }
      if (copy[id]) {
        delete copy[id]
      } else {
        const meta = PLATFORMS.find(p=>p.id===id)
        if (meta) { // Safety check
          copy[id] = { type: meta.types[0] }
        }
      }
      return copy
    })
  }

  /* ── change content type for a platform */
  const setType = (id, t) =>
    setPlatforms(prev => ({ ...prev, [id]: { type: t } }))

  /* ── derive validations */
  const platformsValid = Object.keys(platforms).length > 0 &&
    Object.values(platforms).every(p=>!!p.type)

  /* ───────────────── AI suggestions (swap for real calls) */
  const aiObjective = async () => {
    if (!user?.id) {
      alert('Please log in to get personalized suggestions')
      return
    }

    // Check if platforms are selected
    if (Object.keys(platforms).length === 0) {
      alert('Please select at least one platform first')
      return
    }

    setBusy(true)
    
    try {
      // Convert platforms state to API format
      const selectedPlatforms = {}
      const selectedFormats = {}
      
      Object.entries(platforms).forEach(([platformId, config]) => {
        selectedPlatforms[platformId] = true
        if (!selectedFormats[platformId]) {
          selectedFormats[platformId] = []
        }
        selectedFormats[platformId].push(config.type)
      })

      console.log('🎯 Calling suggest-content-objectives API...')
      const response = await fetch('/api/suggest-content-objectives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          selectedPlatforms,
          selectedFormats
        })
      })

      const result = await response.json()

      if (result.success && result.suggestions?.length > 0) {
        // Use the first suggestion as the objective
        const firstSuggestion = result.suggestions[0]
        const suggestedObjective = `${firstSuggestion.title}: ${firstSuggestion.description}\n\nExpected Outcome: ${firstSuggestion.expectedOutcome}\nContent Angle: ${firstSuggestion.contentAngle}`
        
        setObjective(suggestedObjective)
        console.log('✅ Content objective suggested successfully')
      } else {
        console.error('❌ API Error:', result.error)
        alert(result.error || 'Failed to get suggestions. Please try again.')
      }
    } catch (error) {
      console.error('❌ Suggestion error:', error)
      alert('Failed to get suggestions. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  
  const aiImage = async () => {
    setBusy(true)
    await new Promise(r=>setTimeout(r,500))
    setImagePrompt('High-energy lifestyle photo of someone using the fitness product, bright background.')
    setBusy(false)
  }
  
  const aiPreview = async () => {
    if(!platformsValid) {
      alert('Please choose at least one platform and format')
      return
    }
    if(!objective.trim()) {
      alert('Please write an objective')
      return
    }
    
    setBusy(true)
    await new Promise(r=>setTimeout(r,1000))

    const newPreviews = []
    for (let v = 1; v <= variations; v++) {
      for (const id of Object.keys(platforms)) {
        const meta = PLATFORMS.find(p=>p.id===id)
        if (!meta) continue // Safety check
        newPreviews.push({
          platformId:id,
          platformName:meta.name,
          icon:meta.icon,
          type:platforms[id].type,
          body:`(${v}/${variations}) ${objective} — tailored for ${meta.name} ${platforms[id].type}`,
          img:imageNeeded ? imagePrompt : null
        })
      }
    }
    setPreviews(newPreviews)
    setBusy(false)
    next()
  }

  const regenerate = () => {
    setPreviews([])
    setStep(2)
  }

  const finish = () => {
    alert('Content scheduled!')
    onComplete()
  }

  /* ───────── RENDER ───────── */
  return (
    <div className="bg-white border rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600">
        <h2 className="flex items-center gap-2 text-white font-semibold">
          <Sparkles size={18}/> Content Generator
        </h2>
        <button onClick={onCancel} className="text-white/80 hover:text-white transition-colors">
          <X size={20}/>
        </button>
      </div>

      {/* progress bar */}
      <div className="h-1 bg-gray-200">
        <div className="h-full bg-blue-600 transition-all duration-300" style={{width:`${((step+1)/5)*100}%`}} />
      </div>

      <div className="p-6 space-y-6">

        {/* STEP 0: platform + format */}
        {step===0 && (
          <>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Choose platform(s)</h3>
              <p className="text-sm text-gray-600 mb-4">Select the social media platforms where you want to post content</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PLATFORMS.map(p=>(
                <button key={p.id}
                  onClick={()=>togglePlatform(p.id)}
                  className={`border-2 rounded-lg px-3 py-3 flex items-center gap-2 text-gray-900 transition-all
                    ${platforms[p.id] 
                      ? 'border-blue-600 bg-blue-50 shadow-sm' 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}>
                  <span className={`w-6 h-6 flex items-center justify-center rounded text-white text-sm bg-gradient-to-br ${p.grad || 'from-gray-500 to-gray-600'}`}>
                    {p.icon}
                  </span>
                  <span className="text-sm font-medium">{p.name}</span>
                </button>
              ))}
            </div>

            {Object.keys(platforms).length > 0 && (
              <>
                <div className="pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Select content format for each platform</h4>
                  <div className="space-y-6">
                    {Object.keys(platforms).map(id=>{
                      const meta = PLATFORMS.find(p=>p.id===id)
                      if (!meta) return null // Safety check
                      return (
                        <div key={id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`w-6 h-6 flex items-center justify-center rounded text-white text-sm bg-gradient-to-br ${meta.grad}`}>
                              {meta.icon}
                            </span>
                            <span className="font-medium text-gray-900">{meta.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {meta.types.map(t=>(
                              <button 
                                key={t} 
                                onClick={()=>setType(id,t)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                                  ${platforms[id]?.type===t
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end pt-6 border-t">
              <NavBtn dir="next" disabled={!platformsValid} onClick={next}>Next</NavBtn>
            </div>
          </>
        )}

        {/* STEP 1: objective + variations */}
        {step===1 && (
          <>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">What's your objective?</h3>
              <p className="text-sm text-gray-600 mb-4">Describe what you want to achieve with this content</p>
            </div>
            
            <textarea 
              rows={4} 
              value={objective} 
              onChange={e=>setObjective(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder='e.g. "I want to promote my new fitness product and educate my audience about its benefits"'
            />
            
            <button 
              type="button" 
              onClick={aiObjective}
              disabled={busy || Object.keys(platforms).length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {busy ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>}
              {busy ? 'Getting suggestions...' : 'Suggest Content Ideas'}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              {Object.keys(platforms).length === 0 
                ? 'Select platforms above to get personalized suggestions'
                : 'Get AI-powered suggestions based on your content strategy'
              }
            </p>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">How many variations per platform?</label>
              <input 
                type="number" 
                min={1} 
                max={5} 
                value={variations}
                onChange={e=>setVariations(Number(e.target.value))}
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-500"/>
              <p className="text-xs text-gray-500 mt-1">Generate multiple versions to test what works best</p>
            </div>

            <div className="flex justify-between pt-6 border-t">
              <NavBtn dir="prev" onClick={prev}>Back</NavBtn>
              <NavBtn dir="next" disabled={!objective.trim()} onClick={next}>Next</NavBtn>
            </div>
          </>
        )}

        {/* STEP 2: image prompt */}
        {step===2 && (
          <>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Add an image?</h3>
              <p className="text-sm text-gray-600 mb-4">Visual content performs better on most platforms</p>
            </div>

            <label className="flex items-center gap-3 mb-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input 
                type="checkbox" 
                checked={imageNeeded} 
                onChange={e=>setImageNeeded(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"/>
              <span className="text-sm font-medium">Yes, generate an image for this content</span>
            </label>

            {imageNeeded && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Image description</label>
                <textarea 
                  rows={3} 
                  value={imagePrompt} 
                  onChange={e=>setImagePrompt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the image you'd like to generate (e.g., 'Professional photo of a modern gym with people exercising, bright lighting, motivational atmosphere')"/>
                <button 
                  type="button" 
                  onClick={aiImage}
                  disabled={busy}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50">
                  {busy ? <Loader2 className="animate-spin" size={14}/> : <Image size={14}/>}
                  Suggest image prompt
                </button>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <NavBtn dir="prev" onClick={prev}>Back</NavBtn>
              <button 
                onClick={aiPreview}
                disabled={busy}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 disabled:opacity-40 transition-colors">
                {busy ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16}/>}
                Generate Content
              </button>
            </div>
          </>
        )}

        {/* STEP 3: preview list */}
        {step===3 && (
          <>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Preview your content ({previews.length} posts)</h3>
              <p className="text-sm text-gray-600 mb-4">Review and approve your generated content before scheduling</p>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {previews.map((p,i)=>(
                <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                  <div className="flex items-center gap-2">
                    <span>{p.icon}</span>
                    <span className="font-semibold text-gray-900">{p.platformName}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{p.type}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="whitespace-pre-wrap text-sm text-gray-800">{p.body}</p>
                  </div>
                  {p.img && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Image size={14} className="text-green-600"/>
                        <span className="text-xs font-medium text-green-800">Image to be generated:</span>
                      </div>
                      <p className="text-xs text-green-700">{p.img}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-6 border-t">
              <button 
                onClick={regenerate} 
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Regenerate
              </button>
              <NavBtn dir="next" onClick={next}>Approve & Schedule</NavBtn>
            </div>
          </>
        )}

        {/* STEP 4: schedule */}
        {step===4 && (
          <>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Schedule your posts</h3>
              <p className="text-sm text-gray-600 mb-4">Choose when to publish your {previews.length} posts</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Posting schedule</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500">
                  <option value="now">Post immediately</option>
                  <option value="best">Best times today (AI optimized)</option>
                  <option value="spread">Spread over next 7 days</option>
                  <option value="custom">Custom schedule</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start date (optional)</label>
                <input 
                  type="date" 
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"/>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t">
              <NavBtn dir="prev" onClick={prev}>Back</NavBtn>
              <button 
                onClick={finish} 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <CalendarPlus size={16}/> 
                Schedule {previews.length} post{previews.length!==1 ? 's' : ''}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}