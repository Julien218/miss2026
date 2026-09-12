// Stockage production Miss & Mister Dour
// Cloudflare R2 est S3-compatible et déjà configuré dans Railway.

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

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

const PRIVATE_MAGIC = Buffer.from("MMDPRIV1", "ascii");
const PRIVATE_IV_LENGTH = 12;
const PRIVATE_TAG_LENGTH = 16;

function getPrivateStorageKey(): Buffer {
  const secret = process.env.PRIVATE_STORAGE_KEY?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("PRIVATE_STORAGE_KEY must be configured with at least 32 characters");
  }
  return createHash("sha256").update(secret, "utf8").digest();
}

function encryptPrivateData(data: Buffer | Uint8Array | string): Buffer {
  const clear = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  const iv = randomBytes(PRIVATE_IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", getPrivateStorageKey(), iv);
  cipher.setAAD(PRIVATE_MAGIC);
  const encrypted = Buffer.concat([cipher.update(clear), cipher.final()]);
  return Buffer.concat([PRIVATE_MAGIC, iv, cipher.getAuthTag(), encrypted]);
}

function decryptPrivateData(payload: Buffer): Buffer {
  const header = payload.subarray(0, PRIVATE_MAGIC.length);
  if (!header.equals(PRIVATE_MAGIC)) {
    throw new Error("Private object is not encrypted with the expected format");
  }
  const ivStart = PRIVATE_MAGIC.length;
  const tagStart = ivStart + PRIVATE_IV_LENGTH;
  const dataStart = tagStart + PRIVATE_TAG_LENGTH;
  const decipher = createDecipheriv("aes-256-gcm", getPrivateStorageKey(), payload.subarray(ivStart, tagStart));
  decipher.setAAD(PRIVATE_MAGIC);
  decipher.setAuthTag(payload.subarray(tagStart, dataStart));
  return Buffer.concat([decipher.update(payload.subarray(dataStart)), decipher.final()]);
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
 * Store an encrypted document. The media bucket may have a public URL, so
 * confidentiality is provided by AES-256-GCM before the object reaches R2.
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
      Body: encryptPrivateData(data),
      ContentType: "application/octet-stream",
      CacheControl: "private, no-store",
      Metadata: { originalContentType: contentType },
    })
  );

  return { key };
}

export async function storageGetPrivate(
  relKey: string
): Promise<{ key: string; data: Buffer; contentType: string }> {
  const config = getR2Config();
  const client = getR2Client(config);
  const key = normalizeKey(relKey);
  const object = await client.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }));
  if (!object.Body) throw new Error("Private object has no content");
  const encrypted = Buffer.from(await object.Body.transformToByteArray());
  return {
    key,
    data: decryptPrivateData(encrypted),
    contentType: object.Metadata?.originalcontenttype || "application/octet-stream",
  };
}
