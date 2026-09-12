// Stockage production Miss & Mister Dour
// Cloudflare R2 est S3-compatible et déjà configuré dans Railway.

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type R2Config = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl?: string;
};

let cachedClient: S3Client | null = null;
let cachedSignature = "";

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function getR2Config(): R2Config {
  const endpoint = process.env.R2_ENDPOINT?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET?.trim();
  const publicUrl = process.env.R2_PUBLIC_URL?.trim();

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "R2 storage is not configured: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET are required"
    );
  }

  return {
    endpoint: endpoint.replace(/\/+$/, ""),
    accessKeyId,
    secretAccessKey,
    bucket,
    publicUrl: publicUrl ? publicUrl.replace(/\/+$/, "") : undefined,
  };
}

function getR2Client(config: R2Config): S3Client {
  const signature = `${config.endpoint}|${config.accessKeyId}`;
  if (!cachedClient || cachedSignature !== signature) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    cachedSignature = signature;
  }
  return cachedClient;
}

function buildPublicUrl(publicUrl: string, key: string): string {
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${publicUrl}/${encodedKey}`;
}

function toBody(data: Buffer | Uint8Array | string): Buffer | Uint8Array | string {
  if (typeof data === "string") return data;
  if (Buffer.isBuffer(data)) return data;
  return new Uint8Array(data);
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const config = getR2Config();
  const client = getR2Client(config);
  const key = normalizeKey(relKey);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: toBody(data),
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  if (config.publicUrl) {
    return { key, url: buildPublicUrl(config.publicUrl, key) };
  }

  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: config.bucket, Key: key }),
    { expiresIn: 60 * 60 * 24 * 7 }
  );
  return { key, url };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const config = getR2Config();
  const client = getR2Client(config);
  const key = normalizeKey(relKey);

  if (config.publicUrl) {
    return { key, url: buildPublicUrl(config.publicUrl, key) };
  }

  return {
    key,
    url: await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: config.bucket, Key: key }),
      { expiresIn: 60 * 60 }
    ),
  };
}

/**
 * Store a non-public document. Unlike media assets, this helper never builds a
 * permanent public URL; callers must request a short-lived signed URL.
 */
export async function storagePutPrivate(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string }> {
  const config = getR2Config();
  const client = getR2Client(config);
  const key = normalizeKey(relKey);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: toBody(data),
      ContentType: contentType,
      CacheControl: "private, no-store",
    })
  );

  return { key };
}

export async function storageGetPrivate(
  relKey: string,
  expiresInSeconds = 15 * 60
): Promise<{ key: string; url: string }> {
  const config = getR2Config();
  const client = getR2Client(config);
  const key = normalizeKey(relKey);
  const expiresIn = Math.min(60 * 60, Math.max(60, Math.round(expiresInSeconds)));

  return {
    key,
    url: await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: config.bucket, Key: key }),
      { expiresIn }
    ),
  };
}
