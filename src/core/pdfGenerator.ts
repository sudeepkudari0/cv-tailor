/**
 * PDF Generator - Using jsPDF directly without html2canvas
 * This avoids the oklch color parsing issue from html2canvas
 */

import { jsPDF } from "jspdf";
import { MasterResume } from "./types";

interface ParsedSection {
  type: "header" | "section" | "bullet" | "text";
  content: string;
  subContent?: string;
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
      sections.push({ type: "header", content: trimmed.replace("# ", "") });
    }
    // Contact info
    else if (trimmed.match(/^(Email|Phone|Location|LinkedIn|GitHub|Portfolio):/)) {
      sections.push({ type: "text", content: trimmed });
    }
    // Section header (## Section)
    else if (trimmed.startsWith("## ")) {
      currentSection = trimmed.replace("## ", "");
      sections.push({ type: "section", content: currentSection.toUpperCase() });
    }
    // Job/Project header (### Title at Company)
    else if (trimmed.startsWith("### ")) {
      sections.push({ type: "text", content: trimmed.replace("### ", "") });
    }
    // Bullet point
    else if (trimmed.startsWith("- ")) {
      sections.push({ type: "bullet", content: trimmed.replace("- ", "") });
    }
    // Date/location line
    else if (trimmed.includes("|") || trimmed.match(/^\d{4}/)) {
      sections.push({ type: "text", content: trimmed, subContent: "date" });
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
  
  // Create PDF (Letter size: 8.5 x 11 inches)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  
  // Colors
  const headerColor = "#1e40af"; // Blue
  const textColor = "#333333";
  const secondaryColor = "#666666";
  
  for (const section of sections) {
    // Check for page overflow
    if (y > 700) {
      doc.addPage();
      y = margin;
    }
    
    switch (section.type) {
      case "header":
        // Name - large and centered
        doc.setFontSize(22);
        doc.setTextColor(headerColor);
        doc.setFont("helvetica", "bold");
        doc.text(section.content, pageWidth / 2, y, { align: "center" });
        y += 30;
        break;
        
      case "section":
        // Section header
        y += 8;
        doc.setFontSize(12);
        doc.setTextColor(headerColor);
        doc.setFont("helvetica", "bold");
        doc.text(section.content, margin, y);
        // Underline
        y += 3;
        doc.setDrawColor(headerColor);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 15;
        break;
        
      case "bullet":
        // Bullet point
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.setFont("helvetica", "normal");
        const bulletText = `• ${section.content}`;
        const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 15);
        doc.text(bulletLines, margin + 10, y);
        y += bulletLines.length * 12 + 3;
        break;
        
      case "text":
        if (section.subContent === "date") {
          // Date/location - smaller, secondary color
          doc.setFontSize(9);
          doc.setTextColor(secondaryColor);
          doc.setFont("helvetica", "italic");
        } else if (section.content.includes(" at ") || section.content.includes(" @ ")) {
          // Job title - bold
          doc.setFontSize(11);
          doc.setTextColor(textColor);
          doc.setFont("helvetica", "bold");
        } else if (section.content.includes(":")) {
          // Contact info
          doc.setFontSize(9);
          doc.setTextColor(secondaryColor);
          doc.setFont("helvetica", "normal");
        } else {
          // Regular text
          doc.setFontSize(10);
          doc.setTextColor(textColor);
          doc.setFont("helvetica", "normal");
        }
        
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
  const sections = parseResumeForPDF(resumeText);
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  
  const headerColor = "#1e40af";
  const textColor = "#333333";
  const secondaryColor = "#666666";
  
  for (const section of sections) {
    if (y > 700) {
      doc.addPage();
      y = margin;
    }
    
    switch (section.type) {
      case "header":
        doc.setFontSize(22);
        doc.setTextColor(headerColor);
        doc.setFont("helvetica", "bold");
        doc.text(section.content, pageWidth / 2, y, { align: "center" });
        y += 30;
        break;
        
      case "section":
        y += 8;
        doc.setFontSize(12);
        doc.setTextColor(headerColor);
        doc.setFont("helvetica", "bold");
        doc.text(section.content, margin, y);
        y += 3;
        doc.setDrawColor(headerColor);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 15;
        break;
        
      case "bullet":
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.setFont("helvetica", "normal");
        const bulletText = `• ${section.content}`;
        const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 15);
        doc.text(bulletLines, margin + 10, y);
        y += bulletLines.length * 12 + 3;
        break;
        
      case "text":
        if (section.subContent === "date") {
          doc.setFontSize(9);
          doc.setTextColor(secondaryColor);
          doc.setFont("helvetica", "italic");
        } else if (section.content.includes(" at ") || section.content.includes(" @ ")) {
          doc.setFontSize(11);
          doc.setTextColor(textColor);
          doc.setFont("helvetica", "bold");
        } else if (section.content.includes(":")) {
          doc.setFontSize(9);
          doc.setTextColor(secondaryColor);
          doc.setFont("helvetica", "normal");
        } else {
          doc.setFontSize(10);
          doc.setTextColor(textColor);
          doc.setFont("helvetica", "normal");
        }
        
        const textLines = doc.splitTextToSize(section.content, contentWidth);
        doc.text(textLines, margin, y);
        y += textLines.length * 12 + 2;
        break;
    }
  }
  
  return doc.output("blob");
}
