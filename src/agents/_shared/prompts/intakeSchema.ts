import { z } from "zod";

/**
 * Schema for the structured output of the Intake Agent.
 * This defines the canonical shape of an inbound job application
 * after AI parsing + normalization.
 */

export const IntakeSchema = z.object({
  candidate: z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().url().optional(),
    portfolio: z.string().url().optional(),
  }),

  experience: z.array(
    z.object({
      company: z.string().optional(),
      title: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),

  skills: z.array(z.string()).optional(),

  summary: z.string().optional(),

  source: z.string().optional(),

  metadata: z.object({
    rawText: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
  }).optional(),
});

export type IntakeResult = z.infer<typeof IntakeSchema>;
