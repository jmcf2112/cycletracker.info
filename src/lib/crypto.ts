/**
 * AES-256-GCM encryption for localStorage data.
 * Key is derived via PBKDF2 from a stable device fingerprint.
 */

const SALT = new TextEncoder().encode('cycletracker-v2-salt');
const ITERATIONS = 100_000;

async function getKeyMaterial(): Promise<CryptoKey> {
  // Use a stable identifier; if a user is authenticated their ID would be better,
  // but this module must work offline/pre-auth, so we use a per-browser seed.
  let seed = localStorage.getItem('_ct_device_seed');
  if (!seed) {
    seed = crypto.randomUUID();
    localStorage.setItem('_ct_device_seed', seed);
  }
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(seed),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
}

async function deriveKey(keyMaterial: CryptoKey): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: SALT, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptData(plaintext: string): Promise<string> {
  const keyMaterial = await getKeyMaterial();
  const key = await deriveKey(keyMaterial);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  // Pack iv + ciphertext as base64
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return 'enc:' + btoa(String.fromCharCode(...combined));
}

export async function decryptData(stored: string): Promise<string> {
  if (!stored.startsWith('enc:')) {
    // plaintext legacy data – return as-is for migration
    return stored;
  }
  const raw = stored.slice(4);
  const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
  const iv = bytes.slice(0, 12);
  const ciphertext = bytes.slice(12);

  const keyMaterial = await getKeyMaterial();
  const key = await deriveKey(keyMaterial);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}
