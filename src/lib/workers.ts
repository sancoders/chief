import "server-only";
import { db } from "./db";

export type WorkerListItem = {
  id: string;
  name: string;
  photo: string | null;
  bio: string;
  zones: string[];
  services: string[];
  hourlyRate: number;
  yearsExperience: number;
  verified: boolean;
  rating: number | null;
  reviewCount: number;
};

type Filters = {
  zone?: string;
  service?: string;
  maxRate?: number;
};

function toListItem(worker: {
  id: string;
  bio: string;
  zones: string;
  services: string;
  hourlyRate: number;
  yearsExperience: number;
  user: { name: string; photo: string | null; verificationStatus: string };
  bookings: { review: { rating: number } | null }[];
}): WorkerListItem {
  const ratings = worker.bookings
    .map((b) => b.review?.rating)
    .filter((r): r is number => r != null);
  return {
    id: worker.id,
    name: worker.user.name,
    photo: worker.user.photo,
    bio: worker.bio,
    zones: JSON.parse(worker.zones),
    services: JSON.parse(worker.services),
    hourlyRate: worker.hourlyRate,
    yearsExperience: worker.yearsExperience,
    verified: worker.user.verificationStatus === "VERIFICADA",
    rating: ratings.length
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null,
    reviewCount: ratings.length,
  };
}

const workerInclude = {
  user: { select: { name: true, photo: true, verificationStatus: true } },
  bookings: { select: { review: { select: { rating: true } } } },
} as const;

export async function listWorkers(filters: Filters): Promise<WorkerListItem[]> {
  const workers = await db.workerProfile.findMany({
    where: { user: { verificationStatus: "VERIFICADA" } },
    include: workerInclude,
    orderBy: { createdAt: "asc" },
  });

  return workers
    .map(toListItem)
    .filter((w) => !filters.zone || w.zones.includes(filters.zone))
    .filter((w) => !filters.service || w.services.includes(filters.service))
    .filter((w) => !filters.maxRate || w.hourlyRate <= filters.maxRate)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
}

export async function getWorker(id: string) {
  const worker = await db.workerProfile.findUnique({
    where: { id },
    include: {
      ...workerInclude,
      bookings: {
        select: {
          review: {
            select: { rating: true, comment: true, createdAt: true },
          },
        },
      },
    },
  });
  if (!worker) return null;

  const reviews = worker.bookings
    .map((b) => b.review)
    .filter((r): r is NonNullable<typeof r> => r != null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    ...toListItem({
      ...worker,
      bookings: worker.bookings.map((b) => ({
        review: b.review ? { rating: b.review.rating } : null,
      })),
    }),
    reviews,
  };
}
