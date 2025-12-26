/**
 * Cover Letter Generator
 * Ported from auto-apply/automation_core/domains/jobs/cover_letter.py
 */

import { LLMProvider } from "../models/providers/types";
import { PROMPTS } from "../models/prompts";

export class CoverLetterGenerator {
  constructor(private llm: LLMProvider) {}

  /**
   * Generate a cover letter for a job posting
   */
  async generate(
    company: string,
    jobTitle: string,
    jobDescription: string,
    resumeText: string,
    tone: string = "professional"
  ): Promise<string> {
    // Truncate JD if too long
    const jdSummary = jobDescription.length > 3000 
      ? jobDescription.slice(0, 3000) 
      : jobDescription;

    const response = await this.llm.generate(
      PROMPTS.cover_letter.user(company, jobTitle, jdSummary, resumeText, tone),
      {
        systemPrompt: PROMPTS.cover_letter.system,
        temperature: 0.2,
      }
    );

    return response.content.trim();
  }
}
