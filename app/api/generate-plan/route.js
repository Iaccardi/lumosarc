// app/api/generate-plan/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  console.log('🚀 Generate Plan API called');
  
  try {
    // Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing environment variables');
      return NextResponse.json(
        { 
          error: 'Server configuration error - missing environment variables',
          details: {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
          }
        },
        { status: 500 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('📝 Request body received:', { user_id: body?.user_id, hasWizard: !!body?.wizard });
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

    // Split wizard payload into two chunks
    const { brandProfile, wizardPayload } = splitWizard(wizard);
    console.log('📦 Split wizard data:', { 
      brandProfile: Object.keys(brandProfile || {}), 
      wizardPayload: Object.keys(wizardPayload || {}) 
    });

    // Upsert brand_profiles
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

    console.log('✅ Brand profiles saved');

    // Upsert content_preferences
    console.log('💾 Upserting content_preferences...');
    const { error: cpErr } = await supabase
      .from("content_preferences")
      .upsert({ user_id, wizard_payload: wizardPayload });

    if (cpErr) {
      console.error('❌ Content preferences error:', cpErr);
      return NextResponse.json(
        { error: `Content preferences error: ${cpErr.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Content preferences saved');

    return NextResponse.json({ 
      ok: true, 
      message: 'Wizard data saved successfully',
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

// Helper: split wizard payload into two chunks
function splitWizard(wizard = {}) {
  const {
    brandVoice,
    writingStyle,
    avoidTopics,
    brandValues,
    contentTone,
    visualStyle,
    colorPalette,
    logoUrl,
    brandAssets,
    // everything else stays in wizardPayload
    ...rest
  } = wizard;

  const brandProfile = {
    brand_voice: brandVoice ?? null,
    writing_style: writingStyle ?? null,
    avoid_topics: avoidTopics?.length ? avoidTopics : null,
    brand_values: brandValues?.length ? brandValues : null,
    content_tone: contentTone ?? null,
    visual_style: visualStyle ?? null,
    color_palette: colorPalette?.length ? colorPalette : null,
    logo_url: logoUrl ?? null,
    brand_assets: brandAssets ?? null,
  };

  return { brandProfile, wizardPayload: rest };
}

// Also handle GET requests for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Generate Plan API is working', 
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  });
}