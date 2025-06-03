'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Copy, Check, Calendar, Share2, Edit, Trash2, MoreHorizontal,
  Image as ImageIcon, Hash, Target, TrendingUp, Clock, Play, FileText,
  Layers, Camera, ExternalLink, ChevronRight, Eye
} from 'lucide-react'

/* ───────────────────────────────────────────────────────── Platform + type meta */
const PLATFORM_CONFIG = {
  instagram : { gradient:'from-pink-500 to-purple-600', icon:'📷', name:'Instagram' , color:'bg-pink-100 text-pink-800' },
  facebook  : { gradient:'from-blue-600 to-blue-700',   icon:'📘', name:'Facebook'  , color:'bg-blue-100 text-blue-800' },
  twitter   : { gradient:'from-gray-800 to-black',      icon:'🐦', name:'Twitter/X' , color:'bg-gray-100 text-gray-800' },
  linkedin  : { gradient:'from-blue-700 to-blue-800',   icon:'💼', name:'LinkedIn'  , color:'bg-blue-100 text-blue-800' },
  youtube   : { gradient:'from-red-600 to-red-700',     icon:'📹', name:'YouTube'   , color:'bg-red-100 text-red-800' },
  blog      : { gradient:'from-green-600 to-green-700', icon:'📝', name:'Blog'      , color:'bg-green-100 text-green-800' },
  pinterest : { gradient:'from-red-500 to-red-600',     icon:'📌', name:'Pinterest' , color:'bg-red-100 text-red-800' }
}

const CONTENT_TYPE_ICONS = {
  video        : Play,
  social_media : Share2,
  blog_post    : FileText,
  carousel     : Layers,
  story        : Camera
}

/* ───────────────────────────────────────────────────────── Helpers */
const formatDate = d => new Date(d).toLocaleDateString('en-US',{ month:'short', day:'numeric' })

const scoreColor = score =>
  score>=80 ? 'text-green-600 bg-green-50'
: score>=60 ? 'text-yellow-600 bg-yellow-50'
            : 'text-red-600 bg-red-50'

const statusColor = status => ({
  approved  : 'bg-green-100 text-green-800',
  scheduled : 'bg-blue-100  text-blue-800',
  published : 'bg-purple-100 text-purple-800',
  draft     : 'bg-gray-100  text-gray-800'
}[status] ?? 'bg-yellow-100 text-yellow-800')

/* ───────────────────────────────────────────────────────── Row component */
function ContentListItem ({ idea, keywordScores, onUpdate }) {
  const [copiedKey , setCopiedKey ] = useState(null)
  const [expanded  , setExpanded  ] = useState(false)
  const [menuOpen  , setMenuOpen  ] = useState(false)
  const menuRef = useRef(null)

  /* close dropdown on outside click */
  useEffect(()=>{
    if(!menuOpen) return
    const handler = e => { if(menuRef.current && !menuRef.current.contains(e.target)){ setMenuOpen(false) } }
    document.addEventListener('mousedown',handler)
    return ()=>document.removeEventListener('mousedown',handler)
  },[menuOpen])

  /* ───── derived/meta */
  const platform = PLATFORM_CONFIG[idea.platform] ?? { icon:'📄', name:'Unknown', color:'bg-gray-100 text-gray-800' }
  const ContentTypeIcon = CONTENT_TYPE_ICONS[idea.content_type] ?? FileText

  const score = (() => {
    if(!Array.isArray(idea.primary_keywords)||idea.primary_keywords.length===0) return 50
    const avg = idea.primary_keywords.reduce((s,k)=>s+(keywordScores[k]?.trendScore??50),0)/idea.primary_keywords.length
    const typeBonus = { video:10, social_media:5, carousel:8, story:3 }[idea.content_type] ?? 0
    return Math.round(avg+typeBonus)
  })()

  /* ───── actions */
  const copy = async (txt,key)=>{
    try{ await navigator.clipboard.writeText(txt); setCopiedKey(key)
      setTimeout(()=>setCopiedKey(null),2000)
    }catch(e){ console.error('copy failed',e) }
  }

  const mutateStatus = newStatus =>{
    onUpdate?.(idea.id,{ status:newStatus })
    setMenuOpen(false)
  }

  /* ───── render */
  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
      {/* ───── main row */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* avatar */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium ${platform.color}`}>
            {platform.icon}
          </div>

          {/* centre */}
          <div className="flex-1 min-w-0">
            <header className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{idea.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${platform.color}`}>{platform.name}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500 capitalize">
                    <ContentTypeIcon size={12}/>{idea.content_type?.replace('_',' ')}
                  </span>
                </div>
              </div>

              {/* quick status + controls */}
              <div className="flex items-center gap-2 ml-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor(idea.status)}`}>
                  {idea.status || 'pending'}
                </span>

                <button onClick={()=>copy(idea.content_body||idea.description,`${idea.id}-content`)}
                        title="Copy content"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                  {copiedKey===`${idea.id}-content`? <Check size={14}/> : <Copy size={14}/> }
                </button>

                <button onClick={()=>setExpanded(!expanded)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
                  <Eye size={14}/>
                </button>

                {/* dropdown */}
                <div className="relative" ref={menuRef}>
                  <button onClick={()=>setMenuOpen(o=>!o)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
                    <MoreHorizontal size={14}/>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-9 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-fade-in">
                      <button onClick={()=>mutateStatus('approved')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                        <Check size={14}/> Approve</button>
                      <button onClick={()=>mutateStatus('scheduled')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                        <Calendar size={14}/> Schedule</button>
                      <button onClick={()=>mutateStatus('published')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                        <Share2 size={14}/> Publish now</button>
                      <hr/>
                      <button onClick={()=>onUpdate?.(idea.id,'delete')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={14}/> Delete</button>
                    </div>
                  )}
                </div>

                {/* caret */}
                <button onClick={()=>setExpanded(!expanded)} className="p-1 text-gray-400 hover:text-gray-600">
                  <ChevronRight size={16} className={`transition-transform ${expanded?'rotate-90':''}`}/>
                </button>
              </div>
            </header>

            {/* description + meta */}
            <p className="text-sm text-gray-600 line-clamp-2 mt-2">{idea.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${scoreColor(score)}`}>
                <TrendingUp size={10} className="mr-1"/>{score}/100
              </span>
              {idea.primary_keywords?.length>0 && (
                <span className="flex items-center gap-1"><Hash size={12}/>{idea.primary_keywords.length} keywords</span>
              )}
              {idea.image_description && <span className="flex items-center gap-1 text-green-600"><ImageIcon size={12}/>Image</span>}
              {idea.call_to_action && <span className="flex items-center gap-1 text-blue-600"><Target size={12}/>CTA</span>}
              <span className="flex items-center gap-1"><Clock size={12}/>{formatDate(idea.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───── expand */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-5">
          {/* ready content */}
          {idea.content_body && (
            <section>
              <header className="flex items-center justify-between mb-2">
                <h4 className="flex items-center gap-1 text-sm font-medium"><FileText size={14}/> Ready-to-post</h4>
                <button onClick={()=>copy(idea.content_body,`${idea.id}-body`)}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  {copiedKey===`${idea.id}-body`? <Check size={12}/> : <Copy size={12}/> } Copy
                </button>
              </header>
              <pre className="whitespace-pre-wrap bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800">
                {idea.content_body}
              </pre>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {idea.primary_keywords?.length>0 && (
              <section>
                <h4 className="flex items-center gap-1 text-sm font-medium mb-2"><Hash size={14}/> Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {idea.primary_keywords.map((k,i)=>{
                    const kd=keywordScores[k.toLowerCase()]
                    const dot = kd ? kd.trendScore>=80?'bg-green-500':kd.trendScore>=60?'bg-yellow-500':'bg-red-500' : 'bg-gray-300'
                    return (
                      <span key={i} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white border border-gray-200 rounded-full">
                        {k}<span className={`ml-1 w-2 h-2 rounded-full ${dot}`}/>
                      </span>
                    )})}
                </div>
              </section>
            )}
            {idea.hashtags?.length>0 && (
              <section>
                <h4 className="flex items-center gap-1 text-sm font-medium mb-2"><Hash size={14} className="text-blue-500"/> Hashtags</h4>
                <div className="flex flex-wrap gap-1">
                  {idea.hashtags.map((h,i)=>(
                    <span key={i}
                          onClick={()=>copy(h.startsWith('#')?h:`#${h}`,`${idea.id}-tag-${i}`)}
                          className="cursor-pointer text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200">
                      {h.startsWith('#')?h:`#${h}`}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {idea.call_to_action && (
            <section>
              <h4 className="flex items-center gap-1 text-sm font-medium mb-2"><Target size={14} className="text-blue-500"/> Call to action</h4>
              <p className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">{idea.call_to_action}</p>
            </section>
          )}

          {idea.image_description && (
            <section>
              <h4 className="flex items-center gap-1 text-sm font-medium mb-2"><ImageIcon size={14} className="text-green-500"/> Image concept</h4>
              <p className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">{idea.image_description}</p>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-3">
            {idea.optimal_posting_time && (
              <p className="text-sm"><span className="font-medium">Best time: </span>{idea.optimal_posting_time}</p>
            )}
            {idea.seo_focus && (
              <p className="text-sm"><span className="font-medium">SEO focus: </span>{idea.seo_focus}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ───────────────────────────────────────────────────────── List wrapper */
export default function ContentList ({ ideas = [], keywordScores = {}, onIdeaUpdate }) {
  return (
    <div className="space-y-4">
      {ideas.map(idea=>(
        <ContentListItem
          key={idea.id}
          idea={idea}
          keywordScores={keywordScores}
          onUpdate={onIdeaUpdate}
        />
      ))}
    </div>
  )
}