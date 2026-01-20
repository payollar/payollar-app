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
  transmissionCertificate: f({
    image: { maxFileSize: "10MB" },
    pdf: { maxFileSize: "10MB" },
  })
    .onUploadComplete(async ({ file }) => {
      return {
        url: file.url,
        key: file.key,
        type: file.type,
        name: file.name,
        size: file.size,
      };
    }),
};

