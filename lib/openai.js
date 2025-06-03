// lib/openai.js - OpenAI service
export class ContentGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
  }

  async generateContentIdeas(niche, keywords, userId) {
    try {
      // Check trial status first
      const trialCheck = await this.checkTrialStatus(userId);
      if (!trialCheck.isValid) {
        throw new Error(trialCheck.error);
      }

      // Generate content with OpenAI
      const prompt = this.buildPrompt(niche, keywords);
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a social media content strategist who creates viral, engaging content ideas.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const contentText = data.choices[0].message.content;
      
      // Parse and save to database
      const contentIdeas = this.parseContentIdeas(contentText);
      const savedIdeas = await this.saveToDatabase(contentIdeas, userId);
      
      return { success: true, ideas: savedIdeas };
      
    } catch (error) {
      console.error('Content generation error:', error);
      return { success: false, error: error.message };
    }
  }

  buildPrompt(niche, keywords) {
    return `
Generate 10 viral social media content ideas for a business in the "${niche}" niche using keywords: ${keywords}.

CRITICAL FORMATTING REQUIREMENTS:
- Return ONLY valid JSON - no markdown, no explanations, no extra text
- Use exactly this JSON structure with no modifications

Required JSON format:
[
  {
    "id": 1,
    "title": "Exact title here",
    "description": "Brief description of the content idea and why it works",
    "primary_keywords": ["keyword1", "keyword2", "keyword3"],
    "content_type": "blog_post" or "social_media" or "video",
    "engagement_hook": "What makes this content shareable/viral",
    "seo_focus": "Main SEO benefit or search intent targeted"
  }
]

Content Guidelines:
- Make titles compelling and click-worthy with numbers, questions, or power words
- Focus on trending topics in ${niche} and current social media trends
- Include seasonal relevance and current events where applicable
- Prioritize content that solves problems or provides immediate value
- Mix educational, entertaining, and promotional content types
- Target different search intents (informational, commercial, transactional)
- Consider viral potential and shareability factors

Keywords to naturally incorporate: ${keywords}

Return exactly 10 content ideas in the specified JSON format with no additional text.
    `.trim();
  }

  parseContentIdeas(contentText) {
    try {
      // Extract JSON from response
      const jsonStart = contentText.indexOf('[');
      const jsonEnd = contentText.lastIndexOf(']') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No valid JSON found in response');
      }
      
      const jsonString = contentText.slice(jsonStart, jsonEnd);
      const ideas = JSON.parse(jsonString);
      
      if (!Array.isArray(ideas) || ideas.length === 0) {
        throw new Error('Invalid content format received');
      }
      
      return ideas;
    } catch (error) {
      console.error('Error parsing content ideas:', error);
      throw new Error('Failed to parse generated content');
    }
  }

  async checkTrialStatus(userId) {
    try {
      const { supabase } = await import('./supabase');
      
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('trial_end_date, subscription_status, subscription_tier')
        .eq('user_id', userId)
        .single();

      if (error || !userProfile) {
        return { isValid: false, error: 'User profile not found' };
      }

      const trialEndDate = new Date(userProfile.trial_end_date);
      const now = new Date();

      if (userProfile.subscription_status === 'trial' && trialEndDate < now) {
        return { 
          isValid: false, 
          error: 'Your free trial has expired. Please upgrade to continue generating content.' 
        };
      }

      return { 
        isValid: true, 
        profile: userProfile 
      };
    } catch (error) {
      return { isValid: false, error: 'Failed to check trial status' };
    }
  }

  async saveToDatabase(contentIdeas, userId) {
    try {
      const { supabase } = await import('./supabase');
      
      const ideasWithUserId = contentIdeas.map(idea => ({
        ...idea,
        user_id: userId,
        status: 'pending',
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('content_ideas')
        .insert(ideasWithUserId)
        .select();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Database save error:', error);
      throw new Error('Failed to save content ideas to database');
    }
  }
}

// Usage example:
// const generator = new ContentGenerator(process.env.OPENAI_API_KEY);
// const result = await generator.generateContentIdeas('fitness', 'yoga, meditation', userId);