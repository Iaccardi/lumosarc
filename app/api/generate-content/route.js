// app/api/generate-content/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  console.log('🚀 Enhanced content generation API called')
  
  try {
    const body = await request.json()
    console.log('📝 Request body:', body)
    
    const { 
      niche, 
      keywords, 
      user_id, 
      platformQuantities, 
      useWizardData, 
      totalQuantity,
      selectedPlatforms,
      objective 
    } = body

    // Validate required fields
    if (!user_id || (!niche && !objective)) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { success: false, error: 'Missing required fields: user_id and objective are required' },
        { status: 400 }
      )
    }

    if (!platformQuantities || Object.keys(platformQuantities).length === 0) {
      console.log('❌ No platforms selected')
      return NextResponse.json(
        { success: false, error: 'At least one platform must be selected' },
        { status: 400 }
      )
    }

    console.log('✅ All required fields present')

    // Step 1: Check trial status
    console.log('🔍 Checking trial status...')
    const trialCheck = await checkTrialStatus(user_id, totalQuantity || 1)
    
    if (!trialCheck.isValid) {
      console.log('❌ Trial check failed:', trialCheck.error)
      return NextResponse.json(
        { success: false, error: trialCheck.error },
        { status: 403 }
      )
    }

    console.log('✅ Trial check passed')

    // Step 2: Get wizard data if requested
    let wizardData = null
    if (useWizardData) {
      wizardData = await getWizardData(user_id)
      console.log('📊 Wizard data loaded:', !!wizardData)
    }

    // Step 3: Generate platform-specific content with enhanced context
    console.log('🤖 Starting enhanced content generation...')
    const contentIdeas = await generateEnhancedContent(
      objective || niche, 
      keywords, 
      platformQuantities, 
      wizardData,
      selectedPlatforms
    )
    console.log('✅ Content generation complete. Ideas count:', contentIdeas.length)

    // Step 4: Save to database
    console.log('💾 Saving to database...')
    const savedIdeas = await saveToDatabase(contentIdeas, user_id)
    console.log('✅ Database save complete. Saved count:', savedIdeas.length)

    return NextResponse.json({
      success: true,
      ideas: savedIdeas,
      count: savedIdeas.length,
      platformBreakdown: getPlatformBreakdown(savedIdeas),
      message: `Successfully generated ${savedIdeas.length} content ideas!`
    })

  } catch (error) {
    console.error('💥 Content generation error:', error)
    
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}

async function checkTrialStatus(userId, requestedQuantity) {
  try {
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('trial_end_date, subscription_status, subscription_tier')
      .eq('user_id', userId)
      .single()

    if (error || !userProfile) {
      return { isValid: false, error: 'User profile not found' }
    }

    const { data: usageStats, error: usageError } = await supabase
      .rpc('get_user_usage_stats', { p_user_id: userId })

    if (usageError) {
      console.error('Usage stats error:', usageError)
    }

    const currentUsage = usageStats?.[0]?.ideas_this_month || 0
    const tierLimits = {
      starter: 50,
      professional: 200,
      enterprise: 999999
    }
    const userLimit = tierLimits[userProfile.subscription_tier] || 50

    if (currentUsage + requestedQuantity > userLimit) {
      return { 
        isValid: false, 
        error: `Cannot generate ${requestedQuantity} posts. You have ${userLimit - currentUsage} posts remaining this month.` 
      }
    }

    const trialEndDate = new Date(userProfile.trial_end_date)
    const now = new Date()

    if (userProfile.subscription_status === 'trial' && trialEndDate < now) {
      return { 
        isValid: false, 
        error: 'Your free trial has expired. Please upgrade to continue generating content.' 
      }
    }

    return { 
      isValid: true, 
      profile: userProfile,
      usage: {
        current: currentUsage,
        limit: userLimit,
        remaining: userLimit - currentUsage
      }
    }
  } catch (error) {
    console.error('Trial check error:', error)
    return { isValid: false, error: 'Failed to check trial status' }
  }
}

async function getWizardData(userId) {
  try {
    const [brandResponse, contentResponse] = await Promise.all([
      supabase.from('brand_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('content_preferences').select('*').eq('user_id', userId).single()
    ])

    const brandProfile = brandResponse.data
    const contentPrefs = contentResponse.data

    if (!brandProfile && !contentPrefs) {
      return null
    }

    // Merge the data
    const wizardPayload = contentPrefs?.wizard_payload || {}
    
    return {
      // Business context
      businessName: wizardPayload.businessName || 'your business',
      businessNiche: wizardPayload.businessNiche || 'business',
      primaryGoal: wizardPayload.primaryGoal || '',
      website: wizardPayload.website || '',
      
      // Audience context
      targetAudience: wizardPayload.targetAudience || '',
      audienceAge: wizardPayload.audienceAge || '',
      audienceLocation: wizardPayload.audienceLocation || '',
      audiencePainPoints: wizardPayload.audiencePainPoints || [],
      
      // Brand voice
      brandVoice: brandProfile?.brand_voice || wizardPayload.brandVoice || 'professional',
      writingStyle: brandProfile?.writing_style || wizardPayload.writingStyle || 'informative',
      brandValues: brandProfile?.brand_values || wizardPayload.brandValues || [],
      avoidTopics: brandProfile?.avoid_topics || wizardPayload.avoidTopics || [],
      
      // Content strategy
      keywords: wizardPayload.keywords || '',
      contentPillars: wizardPayload.contentPillars || [],
      contentTypes: wizardPayload.contentTypes || [],
      
      // Goals & CTAs
      primaryCTA: wizardPayload.primaryCTA || '',
      leadMagnets: wizardPayload.leadMagnets || [],
      trackingMetrics: wizardPayload.trackingMetrics || []
    }
    
  } catch (error) {
    console.error('Error loading wizard data:', error)
    return null
  }
}

async function generateEnhancedContent(objective, keywords, platformQuantities, wizardData, selectedPlatforms) {
  console.log('🤖 Enhanced platform content generation started')
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is missing!')
    throw new Error('OpenAI API key is not configured')
  }

  const allContentIdeas = []

  // Generate content for each platform with quantity > 0
  for (const [platform, quantity] of Object.entries(platformQuantities)) {
    if (quantity > 0) {
      console.log(`🎯 Generating ${quantity} posts for ${platform}`)
      
      const platformFormats = selectedPlatforms?.[platform]?.formats || ['Post']
      
      const platformContent = await generateForPlatformEnhanced(
        platform, 
        quantity, 
        objective, 
        keywords, 
        wizardData,
        platformFormats
      )
      
      allContentIdeas.push(...platformContent)
    }
  }

  return allContentIdeas
}

async function generateForPlatformEnhanced(platform, quantity, objective, keywords, wizardData, formats) {
  const prompt = buildEnhancedPrompt(platform, quantity, objective, keywords, wizardData, formats)
  console.log(`📝 Generated enhanced prompt for ${platform}, length:`, prompt.length)
  
  try {
    console.log(`📡 Making OpenAI API call for ${platform}...`)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: getEnhancedSystemPrompt(platform, wizardData)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ OpenAI response received for ${platform}. Usage:`, data.usage)
    
    const contentText = data.choices[0].message.content
    const parsedIdeas = parseContentIdeas(contentText, platform)
    console.log(`✅ Parsed ${parsedIdeas.length} ideas for ${platform}`)
    
    return parsedIdeas
  } catch (error) {
    console.error(`💥 OpenAI generation error for ${platform}:`, error)
    throw error
  }
}

function getEnhancedSystemPrompt(platform, wizardData) {
  const basePrompt = 'You are an expert social media strategist and content creator who understands what makes content go viral and drive business results.'
  
  let contextPrompt = basePrompt
  
  if (wizardData) {
    contextPrompt += ` You're creating content for ${wizardData.businessName || 'a business'} in the ${wizardData.businessNiche || 'general'} industry. Their brand voice is ${wizardData.brandVoice || 'professional'} with a ${wizardData.writingStyle || 'informative'} writing style.`
    
    if (wizardData.targetAudience) {
      contextPrompt += ` Their target audience is: ${wizardData.targetAudience}.`
    }
    
    if (wizardData.primaryGoal) {
      contextPrompt += ` Their primary business goal is: ${wizardData.primaryGoal}.`
    }
  }
  
  const platformSpecific = {
    instagram: `${contextPrompt} You specialize in Instagram content that drives engagement through stunning visuals, compelling captions, and strategic hashtag use. Focus on visual storytelling, lifestyle content, and community building.`,
    
    facebook: `${contextPrompt} You specialize in Facebook content that builds communities and drives meaningful conversations. Focus on shareable posts, community engagement, and content that performs well in Facebook's algorithm.`,
    
    twitter: `${contextPrompt} You specialize in Twitter/X content that captures attention in the fast-moving timeline. Focus on trending topics, concise messaging, threads that tell stories, and real-time engagement.`,
    
    linkedin: `${contextPrompt} You specialize in LinkedIn content that builds professional authority and drives business results. Focus on thought leadership, industry insights, professional development, and B2B engagement.`,
    
    tiktok: `${contextPrompt} You specialize in TikTok content that captures the platform's unique culture and trends. Focus on entertaining, authentic content that hooks viewers in the first 3 seconds and encourages engagement.`,
    
    youtube: `${contextPrompt} You specialize in YouTube content strategy, including video concepts, SEO optimization, and audience retention. Focus on valuable, educational content that builds subscriber loyalty.`,
    
    pinterest: `${contextPrompt} You specialize in Pinterest content that gets pinned and drives traffic. Focus on visually appealing content, seasonal trends, and content that solves problems or provides inspiration.`,
    
    blog: `${contextPrompt} You specialize in blog content that ranks in search engines and provides deep value. Focus on comprehensive, SEO-optimized articles that establish authority and drive organic traffic.`
  }

  return platformSpecific[platform] || basePrompt
}

function buildEnhancedPrompt(platform, quantity, objective, keywords, wizardData, formats) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  let contextSection = ''
  if (wizardData) {
    contextSection = `
BUSINESS CONTEXT:
- Business: ${wizardData.businessName} (${wizardData.businessNiche})
- Primary Goal: ${wizardData.primaryGoal}
- Target Audience: ${wizardData.targetAudience}
- Age Group: ${wizardData.audienceAge}
- Location: ${wizardData.audienceLocation}
- Pain Points: ${wizardData.audiencePainPoints?.join(', ') || 'Not specified'}
- Brand Voice: ${wizardData.brandVoice}
- Writing Style: ${wizardData.writingStyle}
- Brand Values: ${wizardData.brandValues?.join(', ') || 'Not specified'}
- Avoid Topics: ${wizardData.avoidTopics?.join(', ') || 'None specified'}
- Content Pillars: ${wizardData.contentPillars?.join(', ') || 'Not specified'}
- Primary CTA: ${wizardData.primaryCTA}
- Website: ${wizardData.website}
`
  }

  const formatsList = formats?.join(', ') || 'Standard posts'
  const platformSpecs = getPlatformSpecifications(platform)
  
  return `
Create ${quantity} high-performing ${platform} content ideas based on this objective:

CONTENT OBJECTIVE: ${objective}

${contextSection}

PLATFORM: ${platformSpecs.name}
FORMATS: ${formatsList}
CURRENT DATE: ${currentDate}
KEYWORDS TO INCLUDE: ${keywords || 'engagement, social media'}

PLATFORM REQUIREMENTS:
${platformSpecs.requirements}

${platformSpecs.needsImages ? `
IMAGE REQUIREMENTS:
- Each post MUST include a detailed image description
- Images should align with brand voice and target audience
- Describe composition, colors, style, and mood
- Make images shareable and attention-grabbing
- Include specific visual elements that support the content message
` : ''}

CONTENT STRATEGY:
- Create platform-native content that fits ${platform}'s unique culture
- Use trending formats and current events relevant to the business
- Address specific audience pain points and interests
- Include clear calls-to-action that align with business goals
- Optimize for ${platform}'s algorithm and best practices
- Make each post unique, valuable, and engaging
- Incorporate seasonal relevance where appropriate

CRITICAL FORMATTING:
Return ONLY valid JSON with this exact structure:

[
  {
    "title": "Compelling, click-worthy title",
    "description": "Detailed description explaining the content strategy and why it works",
    "content_body": "The complete ${platform} post/script ready to publish",
    "primary_keywords": ["keyword1", "keyword2", "keyword3"],
    "platform": "${platform}",
    "content_type": "${platformSpecs.defaultType}",
    "engagement_hook": "What makes this content shareable and engaging",
    "call_to_action": "Specific, actionable CTA for this platform",
    "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
    ${platformSpecs.needsImages ? `"image_description": "Detailed description of the required visual content",` : ''}
    "optimal_posting_time": "Best time to post for maximum engagement",
    "engagement_strategy": "Specific tactics to maximize reach and engagement",
    "seo_focus": "SEO/discoverability optimization strategy"
  }
]

Generate exactly ${quantity} unique, high-quality content ideas in valid JSON format.
  `.trim()
}

function getPlatformSpecifications(platform) {
  const specs = {
    instagram: {
      name: 'Instagram',
      needsImages: true,
      defaultType: 'instagram_post',
      requirements: `
- Captions: 125-150 words optimal, engaging hooks in first line
- Use 5-10 relevant hashtags (mix of popular and niche)
- Include call-to-action encouraging engagement
- Visual-first content that stops the scroll
- Stories and Reels should be vertical (9:16 ratio)
- Focus on authentic, behind-the-scenes, and lifestyle content`
    },
    facebook: {
      name: 'Facebook',
      needsImages: true,
      defaultType: 'facebook_post',
      requirements: `
- Posts: 40-80 words for optimal engagement
- Use 1-2 hashtags (Facebook is less hashtag-focused)
- Encourage comments and shares with questions
- Community-building focus with conversation starters
- Visual content with engaging captions
- Link posts should have compelling preview text`
    },
    twitter: {
      name: 'Twitter/X',
      needsImages: false,
      defaultType: 'tweet',
      requirements: `
- Tweets: 280 characters max, 71-100 characters optimal for retweets
- Threads: Break longer content into connected tweets
- Use 1-2 relevant hashtags and trending topics
- Real-time engagement and conversation focus
- Quick, punchy, and shareable content
- Include mentions when relevant`
    },
    linkedin: {
      name: 'LinkedIn',
      needsImages: true,
      defaultType: 'linkedin_post',
      requirements: `
- Posts: 150-300 words optimal for engagement
- Professional tone but personable and authentic
- Industry insights and thought leadership content
- Use 3-5 industry-specific hashtags
- Focus on business value and professional growth
- Use line breaks for readability`
    },
    tiktok: {
      name: 'TikTok',
      needsImages: false,
      defaultType: 'tiktok_video',
      requirements: `
- Video scripts: 15-60 seconds optimal
- Hook viewers in first 3 seconds
- Trend-aware content using current sounds and effects
- Vertical video format (9:16) - describe video concept
- Use trending hashtags and participate in challenges
- Authentic, entertaining, and relatable content`
    },
    youtube: {
      name: 'YouTube',
      needsImages: true,
      defaultType: 'youtube_video',
      requirements: `
- Video concepts with detailed descriptions
- SEO-optimized titles (60 characters max)
- Compelling thumbnail descriptions
- 8-15 minute videos for optimal retention
- Include suggested timestamps and chapters
- Educational, entertaining, or inspirational content`
    },
    pinterest: {
      name: 'Pinterest',
      needsImages: true,
      defaultType: 'pinterest_pin',
      requirements: `
- Pin descriptions: 100-500 characters
- Vertical images (2:3 or 1:2.1 ratio) with text overlay
- SEO-optimized with relevant keywords
- Seasonal and trend-aware content
- DIY, tutorials, and inspirational content focus
- Rich pins for enhanced functionality`
    },
    blog: {
      name: 'Blog',
      needsImages: true,
      defaultType: 'blog_post',
      requirements: `
- Long-form content: 1,500-3,000 words
- SEO-optimized structure with H2/H3 headers
- Featured image and in-content image suggestions
- Internal and external linking opportunities
- Comprehensive, authoritative content
- Clear takeaways and actionable advice`
    }
  }

  return specs[platform] || specs.instagram
}

function parseContentIdeas(contentText, platform) {
  try {
    // Find JSON in the response
    const jsonStart = contentText.indexOf('[')
    const jsonEnd = contentText.lastIndexOf(']') + 1
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No valid JSON found in OpenAI response')
    }
    
    const jsonString = contentText.slice(jsonStart, jsonEnd)
    const ideas = JSON.parse(jsonString)
    
    if (!Array.isArray(ideas) || ideas.length === 0) {
      throw new Error('Invalid content format received from OpenAI')
    }
    
    // Validate and normalize each idea
    const validatedIdeas = ideas.map((idea, index) => ({
      title: idea.title || `${platform} Content Idea ${index + 1}`,
      description: idea.description || 'No description provided',
      content_body: idea.content_body || idea.content || '',
      primary_keywords: Array.isArray(idea.primary_keywords) ? idea.primary_keywords : [],
      platform: platform,
      content_type: idea.content_type || platform,
      engagement_hook: idea.engagement_hook || 'Engaging content designed to capture attention',
      call_to_action: idea.call_to_action || 'Engage with this post',
      hashtags: Array.isArray(idea.hashtags) ? idea.hashtags : [],
      image_description: idea.image_description || null,
      optimal_posting_time: idea.optimal_posting_time || 'Peak engagement hours for your audience',
      engagement_strategy: idea.engagement_strategy || 'Standard engagement optimization',
      seo_focus: idea.seo_focus || 'Optimized for platform discovery'
    }))
    
    return validatedIdeas
    
  } catch (error) {
    console.error('Error parsing OpenAI response:', error)
    console.error('Raw content:', contentText)
    throw new Error('Failed to parse generated content ideas')
  }
}

async function saveToDatabase(contentIdeas, userId) {
  try {
    console.log('💾 Saving to database for user_id:', userId)
    console.log('💾 Ideas to save:', contentIdeas.length)
    
    const ideasWithMetadata = contentIdeas.map(idea => ({
      title: idea.title,
      description: idea.description,
      content_body: idea.content_body,
      primary_keywords: idea.primary_keywords,
      platform: idea.platform,
      content_type: idea.content_type,
      engagement_hook: idea.engagement_hook,
      call_to_action: idea.call_to_action,
      hashtags: idea.hashtags,
      image_description: idea.image_description,
      optimal_posting_time: idea.optimal_posting_time,
      engagement_strategy: idea.engagement_strategy,
      seo_focus: idea.seo_focus,
      user_id: userId,
      status: 'pending',
      created_at: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('content_ideas')
      .insert(ideasWithMetadata)
      .select()

    if (error) {
      console.error('❌ Database error:', error)
      throw new Error(`Failed to save to database: ${error.message}`)
    }

    console.log('✅ Database save successful. Saved ideas:', data.length)
    return data
  } catch (error) {
    console.error('Database save error:', error)
    throw new Error('Failed to save content ideas to database')
  }
}

function getPlatformBreakdown(savedIdeas) {
  const breakdown = {}
  savedIdeas.forEach(idea => {
    breakdown[idea.platform] = (breakdown[idea.platform] || 0) + 1
  })
  return breakdown
}