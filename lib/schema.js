import { z } from "zod";

export const doctorFormSchema = z.object({
  specialty: z.string().min(1, "Specialty is required"),
  experience: z
    .number({ invalid_type_error: "Experience must be a number" })
    .int()
    .min(0, "Experience must be at least 0 years")
    .max(70, "Experience must be less than 70 years"),
  credentialUrl: z
    .string()
    .url("Please enter a valid URL")
    .min(1, "Credential URL is required"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  portfolioUrls: z
    .array(z.string().url("Please enter a valid URL"))
    .min(1, "At least one portfolio link is required")
    .max(10, "Maximum 10 portfolio links allowed")
    .or(z.array(z.string()).default([])),
  skills: z
    .array(z.string().min(1, "Skill name cannot be empty"))
    .min(1, "At least one skill is required")
    .max(20, "Maximum 20 skills allowed")
    .or(z.array(z.string()).default([])),
});
