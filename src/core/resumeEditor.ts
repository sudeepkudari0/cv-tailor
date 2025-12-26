/**
 * Resume Editor
 * Two-pass ATS-aware resume rewriting
 * Ported from auto-apply/automation_core/domains/jobs/resume_editor.py
 */

import { LLMProvider } from "../models/providers/types";
import { PROMPTS } from "../models/prompts";
import { MasterResume, JDAnalysis } from "./types";

export class ResumeEditor {
  constructor(private llm: LLMProvider) {}

  /**
   * Convert master resume to plain text for LLM
   */
  masterResumeToText(resume: MasterResume): string {
    const lines: string[] = [
      `# ${resume.name}`,
      `Email: ${resume.email}`,
    ];

    if (resume.phone) lines.push(`Phone: ${resume.phone}`);
    if (resume.location) lines.push(`Location: ${resume.location}`);
    if (resume.linkedin) lines.push(`LinkedIn: ${resume.linkedin}`);
    if (resume.github) lines.push(`GitHub: ${resume.github}`);
    if (resume.portfolio) lines.push(`Portfolio: ${resume.portfolio}`);

    if (resume.summary) {
      lines.push("", "## Summary", resume.summary);
    }

    if (resume.experience?.length) {
      lines.push("", "## Experience");
      for (const exp of resume.experience) {
        lines.push(`\n### ${exp.title} at ${exp.company}`);
        lines.push(`${exp.dates}${exp.location ? ` | ${exp.location}` : ""}`);
        for (const bullet of exp.bullets) {
          lines.push(`- ${bullet}`);
        }
      }
    }

    if (resume.education?.length) {
      lines.push("", "## Education");
      for (const edu of resume.education) {
        lines.push(`- ${edu.degree} - ${edu.school} (${edu.year})`);
      }
    }

    if (resume.skills?.length) {
      lines.push("", "## Skills");
      lines.push(resume.skills.join(", "));
    }

    if (resume.certifications?.length) {
      lines.push("", "## Certifications");
      for (const cert of resume.certifications) {
        lines.push(`- ${cert}`);
      }
    }

    if (resume.projects?.length) {
      lines.push("", "## Projects");
      for (const proj of resume.projects) {
        lines.push(`\n### ${proj.name}`);
        lines.push(proj.description);
        if (proj.link) lines.push(`Link: ${proj.link}`);
      }
    }

    return lines.join("\n");
  }

  /**
   * Pass 1: Analyze job description for keywords
   */
  async analyzeJD(jobDescription: string): Promise<JDAnalysis> {
    const response = await this.llm.generate(
      PROMPTS.ats_analysis.user(jobDescription),
      {
        systemPrompt: PROMPTS.ats_analysis.system,
        temperature: 0.1,
        forceJson: true,
      }
    );

    return this.parseJsonResponse(response.content);
  }

  /**
   * Pass 2: Rewrite resume using JD analysis
   */
  async rewriteResume(
    masterResume: MasterResume,
    jdAnalysis: JDAnalysis,
    jobTitle: string,
    company: string
  ): Promise<string> {
    const masterText = this.masterResumeToText(masterResume);
    const jdAnalysisStr = JSON.stringify(jdAnalysis, null, 2);

    const response = await this.llm.generate(
      PROMPTS.resume_rewrite.user(masterText, jdAnalysisStr, jobTitle, company),
      {
        systemPrompt: PROMPTS.resume_rewrite.system,
        temperature: 0.2,
      }
    );

    return response.content.trim();
  }

  /**
   * Full optimization pipeline
   */
  async optimize(
    masterResume: MasterResume,
    jobDescription: string,
    jobTitle: string,
    company: string
  ): Promise<{ resume: string; jdAnalysis: JDAnalysis }> {
    // Pass 1: Analyze JD
    const jdAnalysis = await this.analyzeJD(jobDescription);

    // Pass 2: Rewrite resume
    const resume = await this.rewriteResume(masterResume, jdAnalysis, jobTitle, company);

    return { resume, jdAnalysis };
  }

  private parseJsonResponse(content: string): JDAnalysis {
    // Try direct parse
    try {
      return JSON.parse(content);
    } catch {
      // Try extracting from markdown code block
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        return JSON.parse(match[1]);
      }

      // Try finding raw JSON object
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Failed to parse JD analysis JSON");
    }
  }
}
