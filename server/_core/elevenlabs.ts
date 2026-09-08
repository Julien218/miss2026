import crypto from "crypto";

/**
 * ElevenLabs TTS Integration
 * Server-side only, cache by hash, store Asset
 */

interface TTSOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

interface TTSResponse {
  audioUrl: string;
  hash: string;
  cached: boolean;
}

/**
 * Generate audio from text using ElevenLabs TTS
 * @param options TTS options
 * @returns Audio URL and metadata
 */
export async function generateTTS(options: TTSOptions): Promise<TTSResponse> {
  const {
    text,
    voiceId = "21m00Tcm4TlvDq8ikWAM", // Default: Rachel voice
    modelId = "eleven_multilingual_v2",
    stability = 0.5,
    similarityBoost = 0.75,
  } = options;

  // Calculate hash for caching
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify({ text, voiceId, modelId, stability, similarityBoost }))
    .digest("hex");

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY not configured");
  }

  try {
    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");
    
    // In production, upload to S3 and return URL
    // For now, return data URL (temporary)
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    return {
      audioUrl,
      hash,
      cached: false,
    };
  } catch (error: any) {
    throw new Error(`Failed to generate TTS: ${error.message}`);
  }
}

/**
 * Get available voices from ElevenLabs
 */
export async function getVoices() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY not configured");
  }

  try {
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();
    return data.voices;
  } catch (error: any) {
    throw new Error(`Failed to fetch voices: ${error.message}`);
  }
}
