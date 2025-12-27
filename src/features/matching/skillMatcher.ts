/**
 * Skill Matcher
 * Compares resume skills against job requirements
 */

import type { MasterResume } from "../../core/types";
import { extractSkillsFromText } from "../detection/llmDetector";

export interface MatchResult {
  overallScore: number;
  matchedSkills: SkillMatch[];
  missingSkills: SkillGap[];
  recommendations: string[];
  summary: string;
}

export interface SkillMatch {
  skill: string;
  source: "resume" | "experience" | "projects";
  confidence: "high" | "medium" | "low";
}

export interface SkillGap {
  skill: string;
  priority: "required" | "preferred" | "nice_to_have";
  mentions: number;
  suggestion?: string;
}

/**
 * Extract all skills from a master resume
 */
export function extractResumeSkills(resume: MasterResume): Set<string> {
  const skills = new Set<string>();

  // Direct skills - can be array of strings or object with categories
  if (resume.skills) {
    if (Array.isArray(resume.skills)) {
      resume.skills.forEach((skill) => {
        if (typeof skill === "string") {
          skills.add(skill.toLowerCase());
        }
      });
    } else if (typeof resume.skills === "object") {
      Object.values(resume.skills).flat().forEach((skill) => {
        if (typeof skill === "string") {
          skills.add(skill.toLowerCase());
        }
      });
    }
  }

  // Skills from experience descriptions (bullets)
  if (resume.experience) {
    for (const exp of resume.experience) {
      for (const bullet of exp.bullets || []) {
        const foundSkills = extractSkillsFromText(bullet);
        foundSkills.forEach((s) => skills.add(s.toLowerCase()));
      }
    }
  }

  // Skills from projects
  if (resume.projects) {
    for (const project of resume.projects) {
      if (project.description) {
        const foundSkills = extractSkillsFromText(project.description);
        foundSkills.forEach((s) => skills.add(s.toLowerCase()));
      }
    }
  }

  return skills;
}

/**
 * Extract skills from job description with priority
 */
export function extractJDSkills(jdText: string): Map<string, number> {
  const skillMentions = new Map<string, number>();

  // Find all skills mentioned
  const foundSkills = extractSkillsFromText(jdText);

  for (const skill of foundSkills) {
    const lowerSkill = skill.toLowerCase();
    // Count occurrences
    const regex = new RegExp(`\\b${escapeRegex(lowerSkill)}\\b`, "gi");
    const matches = jdText.match(regex);
    skillMentions.set(lowerSkill, matches?.length || 1);
  }

  // Also look for explicit requirement patterns
  const requirementPatterns = [
    /required:?\s*([^.]+)/gi,
    /must have:?\s*([^.]+)/gi,
    /essential:?\s*([^.]+)/gi,
    /mandatory:?\s*([^.]+)/gi,
  ];

  for (const pattern of requirementPatterns) {
    const matches = jdText.matchAll(pattern);
    for (const match of matches) {
      const skills = extractSkillsFromText(match[1]);
      skills.forEach((s) => {
        const key = s.toLowerCase();
        skillMentions.set(key, (skillMentions.get(key) || 0) + 3); // Boost priority
      });
    }
  }

  return skillMentions;
}

/**
 * Calculate match score between resume and job description
 */
export function calculateMatch(
  resume: MasterResume,
  jdText: string
): MatchResult {
  const resumeSkills = extractResumeSkills(resume);
  const jdSkillMentions = extractJDSkills(jdText);

  const matchedSkills: SkillMatch[] = [];
  const missingSkills: SkillGap[] = [];

  // Sort JD skills by mention count (priority)
  const sortedJDSkills = Array.from(jdSkillMentions.entries())
    .sort((a, b) => b[1] - a[1]);

  let matchedCount = 0;
  let totalWeight = 0;
  let matchedWeight = 0;

  for (const [skill, mentions] of sortedJDSkills) {
    const weight = Math.min(mentions, 5); // Cap weight at 5
    totalWeight += weight;

    // Check if resume has this skill (or similar)
    const hasSkill = resumeSkills.has(skill) || 
      Array.from(resumeSkills).some((rs) => 
        rs.includes(skill) || skill.includes(rs)
      );

    if (hasSkill) {
      matchedCount++;
      matchedWeight += weight;
      matchedSkills.push({
        skill: capitalizeSkill(skill),
        source: "resume",
        confidence: mentions >= 3 ? "high" : mentions >= 2 ? "medium" : "low",
      });
    } else {
      // Determine priority based on mention count
      let priority: "required" | "preferred" | "nice_to_have";
      if (mentions >= 3) priority = "required";
      else if (mentions >= 2) priority = "preferred";
      else priority = "nice_to_have";

      missingSkills.push({
        skill: capitalizeSkill(skill),
        priority,
        mentions,
        suggestion: getSuggestion(skill, resumeSkills),
      });
    }
  }

  // Calculate overall score
  const overallScore = totalWeight > 0 
    ? Math.round((matchedWeight / totalWeight) * 100) 
    : 0;

  // Generate recommendations
  const recommendations: string[] = [];

  // Required skills gap
  const requiredMissing = missingSkills.filter((s) => s.priority === "required");
  if (requiredMissing.length > 0) {
    recommendations.push(
      `Critical gap: ${requiredMissing.map((s) => s.skill).slice(0, 3).join(", ")} - mentioned frequently in JD.`
    );
  }

  // Strong match areas
  const highMatches = matchedSkills.filter((s) => s.confidence === "high");
  if (highMatches.length > 0) {
    recommendations.push(
      `Highlight your ${highMatches.slice(0, 3).map((s) => s.skill).join(", ")} experience prominently.`
    );
  }

  // Generate summary
  let summary: string;
  if (overallScore >= 80) {
    summary = "Excellent match! Your skills align very well with this role.";
  } else if (overallScore >= 60) {
    summary = "Good match. You have most required skills with some gaps to address.";
  } else if (overallScore >= 40) {
    summary = "Moderate match. Consider highlighting transferable skills and addressing key gaps.";
  } else {
    summary = "Lower match. This role may require significant skill development.";
  }

  return {
    overallScore,
    matchedSkills,
    missingSkills: missingSkills.slice(0, 10), // Limit to top 10
    recommendations,
    summary,
  };
}

// Helper functions
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function capitalizeSkill(skill: string): string {
  // Handle common acronyms
  const acronyms = ["api", "aws", "gcp", "sql", "css", "html", "ci", "cd", "ai", "ml"];
  if (acronyms.includes(skill.toLowerCase())) {
    return skill.toUpperCase();
  }
  
  // Capitalize first letter of each word
  return skill
    .split(/[\s-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getSuggestion(skill: string, resumeSkills: Set<string>): string | undefined {
  // Check for related skills in resume
  const related: Record<string, string[]> = {
    python: ["django", "flask", "fastapi"],
    javascript: ["typescript", "node", "react", "vue", "angular"],
    react: ["javascript", "typescript", "next.js", "redux"],
    aws: ["cloud", "azure", "gcp", "docker", "kubernetes"],
    kubernetes: ["docker", "aws", "gcp", "devops"],
    postgresql: ["sql", "mysql", "database"],
    ml: ["python", "data science", "tensorflow", "pytorch"],
  };

  const lowerSkill = skill.toLowerCase();
  const relatedSkills = related[lowerSkill];

  if (relatedSkills) {
    const found = relatedSkills.find((r) => 
      Array.from(resumeSkills).some((rs) => rs.includes(r))
    );
    if (found) {
      return `You have experience with ${found} - consider highlighting as transferable.`;
    }
  }

  return undefined;
}
