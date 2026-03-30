# FlowithOS Webhook Integration Guide

## Overview

This document explains how FlowithOS should send webhook callbacks to the Miss & Mister Dour SaaS platform after completing video generation missions.

## Webhook Endpoint

```
POST https://your-domain.com/api/trpc/flowithos.callback
```

## Authentication

All webhooks must be signed using HMAC-SHA256 to verify authenticity and prevent tampering.

### Signature Generation

1. **Payload**: Create a JSON string with `jobId` and `status`:
   ```javascript
   const payload = JSON.stringify({ jobId: 123, status: "completed" });
   ```

2. **Sign**: Generate HMAC-SHA256 signature using the shared secret:
   ```javascript
   const crypto = require('crypto');
   const signature = crypto
     .createHmac('sha256', process.env.FLOWITHOS_WEBHOOK_SECRET)
     .update(payload)
     .digest('hex');
   ```

3. **Send**: Include the signature in the webhook request body.

### Example (Node.js)

```javascript
const crypto = require('crypto');
const fetch = require('node-fetch');

async function sendWebhook(jobId, status, outputUrl, logs) {
  // Create payload for signature
  const payload = JSON.stringify({ jobId, status });
  
  // Generate signature
  const signature = crypto
    .createHmac('sha256', process.env.FLOWITHOS_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  // Send webhook
  const response = await fetch('https://your-domain.com/api/trpc/flowithos.callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jobId,
      status,
      outputUrl,
      thumbnailUrl: outputUrl.replace('.mp4', '-thumb.jpg'),
      logs,
      signature, // Include signature
    }),
  });
  
  return response.json();
}

// Example usage
await sendWebhook(
  123,
  'completed',
  'https://storage.example.com/videos/candidate-123.mp4',
  'Video generated successfully in 45 seconds'
);
```

### Example (Python)

```python
import hmac
import hashlib
import json
import requests

def send_webhook(job_id: int, status: str, output_url: str, logs: str):
    # Create payload for signature
    payload = json.dumps({"jobId": job_id, "status": status}, separators=(',', ':'))
    
    # Generate signature
    secret = os.environ['FLOWITHOS_WEBHOOK_SECRET'].encode('utf-8')
    signature = hmac.new(secret, payload.encode('utf-8'), hashlib.sha256).hexdigest()
    
    # Send webhook
    response = requests.post(
        'https://your-domain.com/api/trpc/flowithos.callback',
        json={
            'jobId': job_id,
            'status': status,
            'outputUrl': output_url,
            'thumbnailUrl': output_url.replace('.mp4', '-thumb.jpg'),
            'logs': logs,
            'signature': signature,  # Include signature
        }
    )
    
    return response.json()

# Example usage
send_webhook(
    123,
    'completed',
    'https://storage.example.com/videos/candidate-123.mp4',
    'Video generated successfully in 45 seconds'
)
```

## Webhook Payload

### Request Body

```typescript
{
  jobId: number;                    // Required: Job ID from mission creation
  status: "running" | "completed" | "failed";  // Required: Current job status
  outputUrl?: string;               // Optional: Final video URL (required for "completed")
  thumbnailUrl?: string;            // Optional: Video thumbnail URL
  logs?: string;                    // Optional: Processing logs
  errorMessage?: string;            // Optional: Error message (for "failed" status)
  signature: string;                // Required: HMAC-SHA256 signature
}
```

### Status Transitions

1. **running**: Processing started
   - Sets `processingStartedAt` timestamp
   - Updates job status to "running"

2. **completed**: Processing finished successfully
   - Requires `outputUrl`
   - Sets `processingCompletedAt` timestamp
   - Updates job status to "completed"

3. **failed**: Processing failed
   - Requires `errorMessage`
   - Sets `processingCompletedAt` timestamp
   - Updates job status to "failed"

### Response

```typescript
{
  success: true
}
```

### Error Responses

- **Missing signature**: `401 UNAUTHORIZED - Missing signature`
- **Invalid signature**: `401 UNAUTHORIZED - Invalid signature`
- **Secret not configured**: `500 INTERNAL_SERVER_ERROR - Webhook secret not configured`

## Security Best Practices

1. **Never expose the secret**: Store `FLOWITHOS_WEBHOOK_SECRET` securely in environment variables
2. **Use HTTPS**: Always send webhooks over HTTPS to prevent man-in-the-middle attacks
3. **Verify response**: Check the response status to ensure the webhook was accepted
4. **Retry logic**: Implement exponential backoff for failed webhooks (max 3 retries)
5. **Timeout**: Set a reasonable timeout (30 seconds) for webhook requests

## Testing

You can test the webhook integration using the provided vitest tests:

```bash
pnpm test webhook-signature.test.ts
```

This will verify:
- Valid signatures are accepted
- Invalid signatures are rejected
- Missing signatures are rejected
- Tampered payloads are rejected
- Job status updates work correctly

## Shared Secret

The shared secret `FLOWITHOS_WEBHOOK_SECRET` must be:
- At least 32 characters long
- Randomly generated (e.g., `openssl rand -hex 32`)
- Identical on both FlowithOS and SaaS sides
- Stored securely in environment variables

**Example secret generation**:
```bash
openssl rand -hex 32
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

## Support

For questions or issues with webhook integration, contact the Miss & Mister Dour technical team.
