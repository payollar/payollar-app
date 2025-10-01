import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Uploaded file:", file.url);
      return { url: file.url };
    }),
    portfolioUploader: f({
      image: { maxFileSize: "16MB" }, // images up to 16MB
      video: { maxFileSize: "64MB" }, // videos up to 64MB
    }).onUploadComplete(async ({ file }) => {
      console.log("Uploaded portfolio file:", file.ufsUrl);
      return {
        url: file.ufsUrl,
        key: file.key,
        type: file.type,
        name: file.name,
        size: file.size,
      };
    }),
};

