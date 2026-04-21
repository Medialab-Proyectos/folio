import { surveyCarsApi } from './survey-cars';
import type { SurveyCarRead } from './types';

// ─── Inspection persistence via survey-cars ──────────────────────────────────
// Each inspection point is stored as a survey-car entry with:
//   car_id   = vehicle UUID
//   view_position = JSON: { part, status, severity?, notes?, eventType, timestamp, photoCount }
//   image    = first photo (if any)
//
// Additional photos for the same point are stored as separate survey-car entries
// with view_position JSON containing { part, photoIndex, parentPart: true }

interface InspectionPointMeta {
  part: string;
  status: 'ok' | 'damage';
  severity?: 'low' | 'medium' | 'high';
  notes?: string;
  eventType: 'checkin' | 'checkout';
  timestamp: string;
  photoCount: number;
}

interface InspectionPointExtraMeta {
  part: string;
  photoIndex: number;
  extraPhoto: true;
  eventType: 'checkin' | 'checkout';
  timestamp: string;
}

type PointMeta = InspectionPointMeta | InspectionPointExtraMeta;

function isMainMeta(meta: PointMeta): meta is InspectionPointMeta {
  return 'status' in meta;
}

/** Convert a base64 data URL to a File object */
function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}

/** Route backend photo URLs through Next.js proxy to avoid mixed-content issues */
const BACKEND_ORIGIN = 'http://34.233.63.96:8001';
function formatPhotoUrl(path: string): string {
  if (typeof window === 'undefined') return path;
  if (!path || path.startsWith('data:')) return path;
  if (path.startsWith(BACKEND_ORIGIN)) {
    return '/api/proxy/' + path.slice(BACKEND_ORIGIN.length).replace(/^\//, '');
  }
  if (path.startsWith('http')) return path;
  return '/api/proxy/' + path.replace(/^\//, '');
}

/** Parse view_position JSON safely — returns null if not an inspection entry */
function parseMeta(viewPosition?: string): PointMeta | null {
  if (!viewPosition) return null;
  try {
    const meta = JSON.parse(viewPosition);
    if (meta && typeof meta.part === 'string' && (meta.status || meta.extraPhoto)) {
      return meta as PointMeta;
    }
  } catch {
    // Not JSON — regular survey photo (front, rear, etc.)
  }
  return null;
}

export interface InspectionPoint {
  part: string;
  status: 'ok' | 'damage';
  severity?: 'low' | 'medium' | 'high';
  notes?: string;
  photos: string[];  // URLs from backend
}

export interface InspectionData {
  points: InspectionPoint[];
  eventType: 'checkin' | 'checkout';
  timestamp: string;
}

export const inspectionsApi = {
  /**
   * Save inspection data for a vehicle.
   * Deletes previous inspection entries for this car, then creates new ones.
   */
  async save(
    carId: string,
    eventType: 'checkin' | 'checkout',
    partData: Record<string, { photos: string[]; notes: string; severity?: 'low' | 'medium' | 'high' }>,
    okParts: string[],
    selectedParts: string[],
  ): Promise<void> {
    const timestamp = new Date().toISOString();

    // 1) Delete old inspection survey-cars for this car
    await this.deleteForCar(carId);

    // 2) Create new entries for each point that has data
    const allParts = new Set([...Object.keys(partData), ...okParts, ...selectedParts]);

    for (const part of allParts) {
      const data = partData[part];
      const isOk = okParts.includes(part);
      const isDamage = selectedParts.includes(part);
      if (!data && !isOk && !isDamage) continue;

      const status: 'ok' | 'damage' = isDamage ? 'damage' : 'ok';
      const photos = data?.photos || [];

      const meta: InspectionPointMeta = {
        part,
        status,
        severity: data?.severity,
        notes: data?.notes || undefined,
        eventType,
        timestamp,
        photoCount: photos.length,
      };

      // Create main entry (with first photo if available)
      const mainPhoto = photos[0] && photos[0].startsWith('data:')
        ? dataUrlToFile(photos[0], `${part}_0.jpg`)
        : undefined;

      await surveyCarsApi.create({
        car_id: carId,
        view_position: JSON.stringify(meta),
        survey_car_status: 1,
        image: mainPhoto,
      });

      // Create extra entries for additional photos
      for (let i = 1; i < photos.length; i++) {
        const extraMeta: InspectionPointExtraMeta = {
          part,
          photoIndex: i,
          extraPhoto: true,
          eventType,
          timestamp,
        };
        const extraPhoto = photos[i] && photos[i].startsWith('data:')
          ? dataUrlToFile(photos[i], `${part}_${i}.jpg`)
          : undefined;

        await surveyCarsApi.create({
          car_id: carId,
          view_position: JSON.stringify(extraMeta),
          survey_car_status: 1,
          image: extraPhoto,
        });
      }
    }
  },

  /**
   * Load inspection data for a vehicle from backend.
   * Returns null if no inspection data found.
   */
  async load(carId: string): Promise<InspectionData | null> {
    const allSurveys: SurveyCarRead[] = await surveyCarsApi.list({ car_id: carId });

    // Filter to inspection entries only
    const inspectionEntries: { survey: SurveyCarRead; meta: PointMeta }[] = [];
    for (const s of allSurveys) {
      const meta = parseMeta(s.view_position);
      if (meta) inspectionEntries.push({ survey: s, meta });
    }

    if (inspectionEntries.length === 0) return null;

    // Group by part
    const byPart = new Map<string, { main?: { survey: SurveyCarRead; meta: InspectionPointMeta }; extras: { survey: SurveyCarRead; index: number }[] }>();

    for (const entry of inspectionEntries) {
      const { meta, survey } = entry;
      if (!byPart.has(meta.part)) byPart.set(meta.part, { extras: [] });
      const group = byPart.get(meta.part)!;

      if (isMainMeta(meta)) {
        group.main = { survey, meta };
      } else {
        group.extras.push({ survey, index: meta.photoIndex });
      }
    }

    const points: InspectionPoint[] = [];
    let latestEventType: 'checkin' | 'checkout' = 'checkin';
    let latestTimestamp = '';

    for (const [part, group] of byPart) {
      if (!group.main) continue;
      const { meta, survey: mainSurvey } = group.main;

      // Build photo URLs array (routed through proxy)
      const photos: string[] = [];
      const mainUrl = mainSurvey.file_url;
      if (mainUrl) photos.push(formatPhotoUrl(mainUrl));

      // Sort extras by index and add their URLs
      group.extras.sort((a, b) => a.index - b.index);
      for (const extra of group.extras) {
        if (extra.survey.file_url) photos.push(formatPhotoUrl(extra.survey.file_url));
      }

      points.push({
        part,
        status: meta.status,
        severity: meta.severity,
        notes: meta.notes,
        photos,
      });

      if (meta.timestamp > latestTimestamp) {
        latestTimestamp = meta.timestamp;
        latestEventType = meta.eventType;
      }
    }

    return { points, eventType: latestEventType, timestamp: latestTimestamp };
  },

  /**
   * Delete all inspection survey-car entries for a car.
   */
  async deleteForCar(carId: string): Promise<void> {
    const allSurveys: SurveyCarRead[] = await surveyCarsApi.list({ car_id: carId });
    for (const s of allSurveys) {
      const meta = parseMeta(s.view_position);
      if (meta) {
        try {
          await surveyCarsApi.delete(s.id);
        } catch {
          // ignore deletion errors
        }
      }
    }
  },
};
