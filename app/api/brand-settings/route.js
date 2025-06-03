// app/api/brand-settings/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  console.log('🎨 Brand Settings API called');
  
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
      console.log('📝 Request body received:', { user_id: body?.user_id, hasData: !!body?.wizard });
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { user_id, wizard } = body;

    if (!user_id || !wizard) {
      console.log('❌ Missing required fields:', { user_id: !!user_id, wizard: !!wizard });
      return NextResponse.json(
        { error: "user_id and wizard payload required" },
        { status: 400 }
      );
    }

    console.log('✅ All validations passed');

    // Split wizard data according to database schema
    const { brandProfile, brandSettings, contentPreferences } = splitBrandWizard(wizard);
    console.log('📦 Split brand data:', { 
      brandProfile: Object.keys(brandProfile || {}), 
      brandSettings: Object.keys(brandSettings || {}),
      contentPreferences: Object.keys(contentPreferences || {}) 
    });

    // Upsert brand_profiles table
    console.log('💾 Upserting brand_profiles...');
    const { error: bpErr } = await supabase
      .from("brand_profiles")
      .upsert({ user_id, ...brandProfile });

    if (bpErr) {
      console.error('❌ Brand profiles error:', bpErr);
      return NextResponse.json(
        { error: `Brand profiles error: ${bpErr.message}` },
        { status: 500 }
      );
    }

    // Upsert brand_settings table
    console.log('💾 Upserting brand_settings...');
    const { error: bsErr } = await supabase
      .from("brand_settings")
      .upsert({ user_id, ...brandSettings });

    if (bsErr) {
      console.error('❌ Brand settings error:', bsErr);
      return NextResponse.json(
        { error: `Brand settings error: ${bsErr.message}` },
        { status: 500 }
      );
    }

    // Upsert content_preferences table
    console.log('💾 Upserting content_preferences...');
    const { error: cpErr } = await supabase
      .from("content_preferences")
      .upsert({ user_id, wizard_payload: contentPreferences });

    if (cpErr) {
      console.error('❌ Content preferences error:', cpErr);
      return NextResponse.json(
        { error: `Content preferences error: ${cpErr.message}` },
        { status: 500 }
      );
    }

    console.log('✅ All brand settings saved successfully');

    return NextResponse.json({ 
      ok: true, 
      message: 'Brand settings saved successfully',
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (err) {
    console.error('💥 Unexpected error:', err);
    return NextResponse.json(
      { 
        error: err.message || "Internal server error",
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  console.log('🔍 Get Brand Settings API called');
  
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id parameter is required' },
        { status: 400 }
      );
    }

    // Fetch all brand-related data
    const [brandProfileResponse, brandSettingsResponse, contentPrefsResponse] = await Promise.all([
      supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user_id)
        .single(),
      supabase
        .from('brand_settings')
        .select('*')
        .eq('user_id', user_id)
        .single(),
      supabase
        .from('content_preferences')
        .select('*')
        .eq('user_id', user_id)
        .single()
    ]);

    const brandProfile = brandProfileResponse.data;
    const brandSettings = brandSettingsResponse.data;
    const contentPrefs = contentPrefsResponse.data;

    const hasData = brandProfile || brandSettings || contentPrefs;

    if (!hasData) {
      return NextResponse.json({
        hasData: false,
        message: 'No brand settings found'
      });
    }

    // Merge all data back into wizard format
    const mergedData = {
      // From content_preferences.wizard_payload
      ...(contentPrefs?.wizard_payload || {}),
      
      // From brand_profiles
      brandVoice: brandProfile?.brand_voice,
      writingStyle: brandProfile?.writing_style,
      avoidTopics: brandProfile?.avoid_topics || [],
      brandValues: brandProfile?.brand_values || [],
      contentTone: brandProfile?.content_tone,
      visualStyle: brandProfile?.visual_style,
      colorPalette: brandProfile?.color_palette || [],
      logoUrl: brandProfile?.logo_url,
      brandAssets: brandProfile?.brand_assets || [],
      
      // From brand_settings
      businessName: brandSettings?.brand_name,
      primaryColor: brandSettings?.primary_color,
      secondaryColor: brandSettings?.secondary_color,
      tone: brandSettings?.tone,
      targetAudience: brandSettings?.target_audience,
    };

    return NextResponse.json({
      hasData: true,
      brandProfile,
      brandSettings,
      wizardData: mergedData,
      lastUpdated: brandProfile?.updated_at || brandSettings?.updated_at || contentPrefs?.updated_at
    });

  } catch (err) {
    console.error('💥 Get brand settings error:', err);
    return NextResponse.json(
      { 
        error: 'Failed to fetch brand settings',
        details: err.message 
      },
      { status: 500 }
    );
  }
}

// Helper function to split wizard data according to database schema
function splitBrandWizard(wizard = {}) {
  const {
    // brand_profiles fields
    brandVoice,
    writingStyle,
    avoidTopics,
    brandValues,
    contentTone,
    visualStyle,
    colorPalette,
    logoUrl,
    brandAssets,
    
    // brand_settings fields  
    businessName,
    primaryColor,
    secondaryColor,
    tone,
    targetAudience,
    
    // Everything else goes to content_preferences.wizard_payload
    ...rest
  } = wizard;

  const brandProfile = {
    brand_voice: brandVoice || null,
    writing_style: writingStyle || null,
    avoid_topics: avoidTopics?.length ? avoidTopics : null,
    brand_values: brandValues?.length ? brandValues : null,
    content_tone: contentTone || null,
    visual_style: visualStyle || null,
    color_palette: colorPalette?.length ? colorPalette : null,
    logo_url: logoUrl || null,
    brand_assets: brandAssets || null,
  };

  const brandSettings = {
    brand_name: businessName || null,
    primary_color: primaryColor || colorPalette?.[0] || '#3B82F6',
    secondary_color: secondaryColor || colorPalette?.[1] || '#8B5CF6', 
    logo_url: logoUrl || null,
    tone: tone || brandVoice || 'professional',
    target_audience: targetAudience || null,
    brand_values: brandValues?.join(', ') || null,
  };

  // Content preferences gets the full wizard payload for future content generation
  const contentPreferences = {
    ...wizard, // Keep everything for content generation context
  };

  return { brandProfile, brandSettings, contentPreferences };
}