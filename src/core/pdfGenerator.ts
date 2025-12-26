/**
 * PDF Generator - Using jsPDF directly
 * Features: Clickable links, proper header styling, professional layout
 */

import { jsPDF } from "jspdf";
import { MasterResume } from "./types";

interface ParsedSection {
  type: "name" | "contact" | "section" | "job" | "date" | "bullet" | "text" | "link" | "skills";
  content: string;
  link?: string;
}

/**
 * Parse resume text into structured sections
 */
function parseResumeForPDF(text: string): ParsedSection[] {
  const lines = text.split("\n");
  const sections: ParsedSection[] = [];
  
  let currentSection = "";
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Main title (# Name)
    if (trimmed.startsWith("# ")) {
      sections.push({ type: "name", content: trimmed.replace("# ", "") });
    }
    // Contact info with potential links
    else if (trimmed.match(/^(Email|Phone|Location|LinkedIn|GitHub|Portfolio):/)) {
      const [label, value] = trimmed.split(": ");
      let link: string | undefined;
      
      if (label === "Email" && value) {
        link = `mailto:${value}`;
      } else if (label === "LinkedIn" && value) {
        link = value.startsWith("http") ? value : `https://${value}`;
      } else if (label === "GitHub" && value) {
        link = value.startsWith("http") ? value : `https://${value}`;
      } else if (label === "Portfolio" && value) {
        link = value.startsWith("http") ? value : `https://${value}`;
      }
      
      sections.push({ type: "contact", content: trimmed, link });
    }
    // Section header (## Section)
    else if (trimmed.startsWith("## ")) {
      currentSection = trimmed.replace("## ", "");
      sections.push({ type: "section", content: currentSection.toUpperCase() });
    }
    // Job/Project header (### Title at Company)
    else if (trimmed.startsWith("### ")) {
      sections.push({ type: "job", content: trimmed.replace("### ", "") });
    }
    // Link lines
    else if (trimmed.startsWith("Link:")) {
      const url = trimmed.replace("Link:", "").trim();
      sections.push({ type: "link", content: url, link: url.startsWith("http") ? url : `https://${url}` });
    }
    // Bullet point
    else if (trimmed.startsWith("- ")) {
      sections.push({ type: "bullet", content: trimmed.replace("- ", "") });
    }
    // Date/location line
    else if (trimmed.includes("|") || (trimmed.match(/^\d{4}/) && !trimmed.includes("-"))) {
      sections.push({ type: "date", content: trimmed });
    }
    // Skills (comma-separated)
    else if (currentSection.toLowerCase() === "skills" && trimmed.includes(",")) {
      sections.push({ type: "skills", content: trimmed });
    }
    // Regular text
    else {
      sections.push({ type: "text", content: trimmed });
    }
  }
  
  return sections;
}

/**
 * Generate PDF from resume text using jsPDF directly
 */
export async function generateResumePDF(
  resumeText: string,
  filename: string,
  _masterResume?: MasterResume
): Promise<void> {
  const sections = parseResumeForPDF(resumeText);
  
  // Create PDF (Letter size)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  
  // Colors - more vibrant
  const primaryColor: [number, number, number] = [30, 64, 175]; // #1e40af - blue
  const textColor: [number, number, number] = [33, 33, 33]; // #212121 - almost black
  const secondaryColor: [number, number, number] = [100, 100, 100]; // #646464
  const linkColor: [number, number, number] = [37, 99, 235]; // #2563eb
  
  for (const section of sections) {
    // Check for page overflow
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    
    switch (section.type) {
      case "name":
        // Name - large, bold, centered, blue
        doc.setFontSize(24);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(section.content, pageWidth / 2, y, { align: "center" });
        y += 25;
        break;
        
      case "contact":
        // Contact info - smaller, centered, with clickable links
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        
        if (section.link) {
          doc.setTextColor(...linkColor);
          const textWidth = doc.getTextWidth(section.content);
          const x = (pageWidth - textWidth) / 2;
          doc.textWithLink(section.content, x, y, { url: section.link });
        } else {
          doc.setTextColor(...secondaryColor);
          doc.text(section.content, pageWidth / 2, y, { align: "center" });
        }
        y += 12;
        break;
        
      case "section":
        // Section header - blue, bold, with line
        y += 12;
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(section.content, margin, y);
        y += 4;
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(1.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;
        break;
        
      case "job":
        // Job title - bold black
        doc.setFontSize(11);
        doc.setTextColor(...textColor);
        doc.setFont("helvetica", "bold");
        const jobLines = doc.splitTextToSize(section.content, contentWidth);
        doc.text(jobLines, margin, y);
        y += jobLines.length * 13;
        break;
        
      case "date":
        // Date/location - italic, gray
        doc.setFontSize(9);
        doc.setTextColor(...secondaryColor);
        doc.setFont("helvetica", "italic");
        doc.text(section.content, margin, y);
        y += 12;
        break;
        
      case "bullet":
        // Bullet point - normal text with bullet
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.setFont("helvetica", "normal");
        const bulletText = `• ${section.content}`;
        const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 10);
        doc.text(bulletLines, margin + 8, y);
        y += bulletLines.length * 12 + 2;
        break;
        
      case "skills":
        // Skills - wrapped text
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.setFont("helvetica", "normal");
        const skillLines = doc.splitTextToSize(section.content, contentWidth);
        doc.text(skillLines, margin, y);
        y += skillLines.length * 12 + 2;
        break;
        
      case "link":
        // Clickable link
        doc.setFontSize(9);
        doc.setTextColor(...linkColor);
        doc.setFont("helvetica", "normal");
        if (section.link) {
          doc.textWithLink(section.content, margin, y, { url: section.link });
        } else {
          doc.text(section.content, margin, y);
        }
        y += 12;
        break;
        
      case "text":
        // Regular text
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.setFont("helvetica", "normal");
        const textLines = doc.splitTextToSize(section.content, contentWidth);
        doc.text(textLines, margin, y);
        y += textLines.length * 12 + 2;
        break;
    }
  }
  
  // Save
  doc.save(filename);
}

/**
 * Generate PDF Blob
 */
export async function generateResumePDFBlob(
  resumeText: string,
  _masterResume?: MasterResume
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });
  
  // Simplified - just return blob
  const sections = parseResumeForPDF(resumeText);
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  
  const primaryColor: [number, number, number] = [30, 64, 175];
  const textColor: [number, number, number] = [33, 33, 33];
  const secondaryColor: [number, number, number] = [100, 100, 100];
  const linkColor: [number, number, number] = [37, 99, 235];
  
  for (const section of sections) {
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    
    switch (section.type) {
      case "name":
        doc.setFontSize(24);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(section.content, pageWidth / 2, y, { align: "center" });
        y += 25;
        break;
      case "contact":
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        if (section.link) {
          doc.setTextColor(...linkColor);
          doc.textWithLink(section.content, pageWidth / 2, y, { url: section.link, align: "center" });
        } else {
          doc.setTextColor(...secondaryColor);
          doc.text(section.content, pageWidth / 2, y, { align: "center" });
        }
        y += 12;
        break;
      case "section":
        y += 12;
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(section.content, margin, y);
        y += 4;
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(1.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;
        break;
      case "job":
        doc.setFontSize(11);
        doc.setTextColor(...textColor);
        doc.setFont("helvetica", "bold");
        doc.text(section.content, margin, y);
        y += 13;
        break;
      case "date":
        doc.setFontSize(9);
        doc.setTextColor(...secondaryColor);
        doc.setFont("helvetica", "italic");
        doc.text(section.content, margin, y);
        y += 12;
        break;
      case "bullet":
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.setFont("helvetica", "normal");
        const bulletLines = doc.splitTextToSize(`• ${section.content}`, contentWidth - 10);
        doc.text(bulletLines, margin + 8, y);
        y += bulletLines.length * 12 + 2;
        break;
      default:
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(section.content, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 12 + 2;
    }
  }
  
  return doc.output("blob");
}
