import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  profileImage: f(
    { image: { maxFileSize: "4MB" } },
    {
      awaitServerData: false,
    }
  ).onUploadComplete(async ({ file }) => {
    return { url: file.url || `https://utfs.io/f/${file.key}` };
  }),
  /** Optional hero/cover image for creator services (same limits as profile photos) */
  serviceImage: f(
    { image: { maxFileSize: "4MB" } },
    { awaitServerData: false }
  ).onUploadComplete(async ({ file }) => {
    return { url: file.url || `https://utfs.io/f/${file.key}` };
  }),
  portfolioUploader: f(
    {
      image: { maxFileSize: "16MB" },
      video: { maxFileSize: "64MB" },
    },
    {
      awaitServerData: false,
    }
  ).onUploadComplete(async ({ file }) => {
    return {
      url: file.url || `https://utfs.io/f/${file.key}`,
      key: file.key,
      type: file.type,
      name: file.name,
      size: file.size,
    };
  }),
  mediaAgencyImage: f({ image: { maxFileSize: "8MB" } })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
  transmissionCertificate: f(
    {
      image: { maxFileSize: "10MB" },
      pdf: { maxFileSize: "10MB" },
    },
    {
      awaitServerData: false,
    }
  )
    .onUploadComplete(async ({ file }) => {
      return {
        url: file.url || `https://utfs.io/f/${file.key}`,
        key: file.key,
        type: file.type,
        name: file.name,
        size: file.size,
      };
    }),
  /** Delivery report proof: screenshots, PDFs, short videos */
  deliveryProof: f(
    {
      image: { maxFileSize: "16MB", maxFileCount: 8 },
      pdf: { maxFileSize: "16MB", maxFileCount: 8 },
      video: { maxFileSize: "64MB", maxFileCount: 4 },
    },
    {
      awaitServerData: false,
    }
  ).onUploadComplete(async ({ file }) => {
    return {
      url: file.url || `https://utfs.io/f/${file.key}`,
      key: file.key,
      type: file.type,
      name: file.name,
      size: file.size,
    };
  }),
  /** Client media creatives: TVC, jingle, produced spots, stills (multi) */
  mediaCampaignAsset: f(
    {
      video: { maxFileSize: "128MB", maxFileCount: 8 },
      audio: { maxFileSize: "64MB", maxFileCount: 8 },
      image: { maxFileSize: "16MB", maxFileCount: 8 },
      pdf: { maxFileSize: "16MB", maxFileCount: 8 },
      blob: { maxFileSize: "64MB", maxFileCount: 8 },
    },
    {
      awaitServerData: false,
    }
  ).onUploadComplete(async ({ file }) => {
    return {
      url: file.url || `https://utfs.io/f/${file.key}`,
      key: file.key,
      type: file.type,
      name: file.name,
      size: file.size,
    };
  }),
};

