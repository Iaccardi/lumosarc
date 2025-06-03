// app/api/get-plan/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple in-memory cache (use Redis in production)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(user_id) {
  return `wizard_data_${user_id}`;
}

function getFromCache(key) {
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log('🚀 Cache hit for:', key);
    return cached.data;
  }
  if (cached) {
    cache.delete(key); // Remove expired entry
  }
  return null;
}

function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Prevent memory leaks - keep only 100 entries
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
}

export async function GET(request) {
  console.log('🔍 Get Plan API called');
  
  try {
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get user_id from query parameters
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      console.log('❌ Missing user_id parameter');
      return NextResponse.json(
        { error: 'user_id parameter is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(user_id);
    const cachedResult = getFromCache(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    console.log('🔍 Cache miss - fetching from database for user:', user_id);

    // Fetch brand profile
    const { data: brandProfile, error: brandError } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // Fetch content preferences  
    const { data: contentPrefs, error: prefsError } = await supabase
      .from('content_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // Check if we have any data
    const hasBrandData = brandProfile && !brandError;
    const hasPrefsData = contentPrefs && !prefsError;
    const hasData = hasBrandData || hasPrefsData;

    console.log('📊 Data found:', { 
      hasBrandData, 
      hasPrefsData, 
      hasData,
      brandError: brandError?.message,
      prefsError: prefsError?.message
    });

    const result = hasData ? {
      hasData: true,
      brandProfile: hasBrandData ? brandProfile : null,
      wizardData: hasPrefsData ? contentPrefs.wizard_payload : {},
      lastUpdated: hasBrandData ? brandProfile.updated_at : 
                   hasPrefsData ? contentPrefs.updated_at : null
    } : {
      hasData: false,
      message: 'No existing plan found'
    };

    // Cache the result
    setCache(cacheKey, result);

    console.log('✅ Returning data and caching result');
    return NextResponse.json(result);

  } catch (err) {
    console.error('💥 Get plan error:', err);
    return NextResponse.json(
      { 
        error: 'Failed to fetch plan data',
        details: err.message 
      },
      { status: 500 }
    );
  }
}

// Clear cache when data is updated
export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, action } = body;
    
    if (action === 'clear_cache' && user_id) {
      const cacheKey = getCacheKey(user_id);
      cache.delete(cacheKey);
      console.log('🗑️ Cache cleared for user:', user_id);
      
      return NextResponse.json({ 
        success: true,
        message: 'Cache cleared' 
      });
    }
    
    return NextResponse.json({ 
      error: 'Use GET method to retrieve plan data' 
    }, { status: 405 });
  } catch (err) {
    return NextResponse.json({ 
      error: 'Invalid request' 
    }, { status: 400 });
  }
}