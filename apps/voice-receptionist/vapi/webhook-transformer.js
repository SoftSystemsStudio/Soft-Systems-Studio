/**
 * Vapi to Legacy Payload Transformer
 *
 * Use this in an n8n "Code" node at the start of your webhook workflow
 * to transform Vapi's end-of-call report into your existing payload format.
 *
 * Input: Vapi end-of-call-report webhook payload
 * Output: Legacy CallPayload format expected by existing n8n workflows
 */

// For n8n: paste this code into a "Code" node
// The input is available as `$input.all()` or `items`

function transformVapiPayload(vapiPayload) {
  const message = vapiPayload.message || vapiPayload;
  const call = message.call || {};
  const analysis = message.analysis || {};
  const structuredData = analysis.structuredData || {};

  // Parse timestamps
  const startedAt = call.startedAt ? new Date(call.startedAt) : new Date();
  const endedAt = call.endedAt ? new Date(call.endedAt) : new Date();
  const durationSeconds = Math.round((endedAt - startedAt) / 1000);

  // Detect urgency from transcript or structured data
  const urgencyKeywords = [
    'severe pain',
    'heavy bleeding',
    'fainting',
    'newborn breathing',
    'water broke',
    'decreased fetal movement',
    'dolor severo',
    'sangrado abundante',
    'desmayo',
    'respiración del recién nacido',
    'rompió fuente',
    'disminución movimiento fetal',
  ];

  const transcript = (message.transcript || '').toLowerCase();
  const urgencyDetected =
    structuredData.urgency_detected ||
    urgencyKeywords.some((kw) => transcript.includes(kw));

  // Build legacy payload
  return {
    schema_version: '1.0',
    client: {
      client_id: 'midwifery_prattville',
      name: 'Prattville Midwifery, LLC',
      timezone: 'America/Chicago',
    },
    call: {
      call_id: call.id || `vapi_${Date.now()}`,
      direction: 'inbound',
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      duration_seconds: durationSeconds,
      language: {
        detected: structuredData.language || 'en-US',
        confirmed: structuredData.language || 'en-US',
        confidence: 1.0,
      },
      caller: {
        phone_e164: call.customer?.number || call.phoneNumber || 'unknown',
        name: structuredData.name || 'Unknown',
        callback_phone_e164:
          structuredData.callback_phone ||
          call.customer?.number ||
          call.phoneNumber ||
          'unknown',
      },
      routing: {
        business_hours: isBusinessHours(),
        after_hours: !isBusinessHours(),
        clinic_hours_source: 'config',
        handoff_attempted: false,
        handoff_target: 'none',
        handoff_result: 'not_applicable',
      },
      intent: {
        primary: structuredData.primary_intent || 'other',
        secondary: '',
        category: structuredData.pregnancy_related ? 'pregnancy' : 'general',
      },
      urgency: {
        level: urgencyDetected ? 'on_call' : 'normal',
        trigger_phrases: urgencyDetected
          ? urgencyKeywords.filter((kw) => transcript.includes(kw))
          : [],
        presented_911_directive: urgencyDetected,
      },
      intake: {
        pregnancy_related: structuredData.pregnancy_related || false,
        estimated_due_date: structuredData.estimated_due_date || null,
        gestational_weeks: structuredData.gestational_weeks || null,
        care_interest: 'not_applicable',
        preferred_contact_method: 'phone',
        preferred_callback_windows:
          structuredData.preferred_callback_windows || [],
        notes: structuredData.notes || '',
      },
      actions: {
        quiz_link_offered: false,
        quiz_link_sent: false,
        scheduling_requested: structuredData.scheduling_requested || false,
        appointment_booked: false,
        appointment_details: {},
        message_taken: true,
      },
      artifacts: {
        transcript_available: !!message.transcript,
        call_summary: analysis.summary || message.summary || '',
        redactions_applied: false,
        full_transcript: message.transcript || '',
      },
    },
    // Include original Vapi data for reference
    _vapi_original: {
      call_id: call.id,
      assistant_id: call.assistantId,
      recording_url: message.recordingUrl,
      stereo_recording_url: message.stereoRecordingUrl,
    },
  };
}

// Simple business hours check (America/Chicago timezone)
function isBusinessHours() {
  const now = new Date();
  // Convert to Chicago time
  const chicagoTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Chicago' })
  );
  const day = chicagoTime.getDay(); // 0 = Sunday
  const hour = chicagoTime.getHours();

  // Monday-Friday 8am-5pm
  if (day >= 1 && day <= 5 && hour >= 8 && hour < 17) {
    return true;
  }
  return false;
}

// ============================================
// n8n Code Node Export
// ============================================
// If using in n8n, uncomment the following:

// for (const item of $input.all()) {
//   const transformed = transformVapiPayload(item.json);
//   item.json = transformed;
// }
// return $input.all();

// ============================================
// Standalone Export (for testing)
// ============================================
module.exports = { transformVapiPayload, isBusinessHours };

// Example usage for testing:
// const testPayload = require('./test-vapi-payload.json');
// console.log(JSON.stringify(transformVapiPayload(testPayload), null, 2));
