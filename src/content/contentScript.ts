/**
 * Content Script for CV-Tailor
 * - Detects job descriptions using multiple strategies
 * - Auto-fills application forms
 * - Works with common ATS platforms (Workday, Greenhouse, Lever, etc.)
 */

// Message types
interface Message {
  type: string;
  data?: any;
}

// Schema.org JobPosting detection (inline for content script)
interface SchemaJobPosting {
  title?: string;
  company?: string;
  description?: string;
  location?: string;
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  console.log("[CV-Tailor] Received message:", message.type);
  handleMessage(message, sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(message: Message, sendResponse: (response: any) => void) {
  try {
    switch (message.type) {
      case "DETECT_JD":
        const result = detectJobDescriptionMultiStrategy();
        console.log("[CV-Tailor] Detection result:", {
          jdLength: result.jd.length,
          title: result.jobTitle,
          company: result.company,
          method: result.method,
        });
        sendResponse({ success: true, data: result });
        break;

      case "FILL_FORM":
        console.log("[CV-Tailor] Filling form with data:", Object.keys(message.data));
        const filledCount = await fillForm(message.data);
        console.log("[CV-Tailor] Filled", filledCount, "fields");
        sendResponse({ success: true, data: { filledCount } });
        break;

      case "GET_FORM_FIELDS":
        const fields = getFormFields();
        sendResponse({ success: true, data: fields });
        break;

      case "PING":
        sendResponse({ success: true, data: "pong" });
        break;

      default:
        sendResponse({ success: false, error: "Unknown message type" });
    }
  } catch (error: any) {
    console.error("[CV-Tailor] Error:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Multi-strategy job description detection
 * Tries multiple methods in order of reliability
 */
function detectJobDescriptionMultiStrategy(): {
  jd: string;
  jobTitle: string;
  company: string;
  method: string;
} {
  // Strategy 1: Schema.org JSON-LD (most reliable)
  const schemaResult = detectFromSchemaOrg();
  if (schemaResult && schemaResult.description && schemaResult.description.length > 200) {
    console.log("[CV-Tailor] Using Schema.org detection");
    return {
      jd: schemaResult.description,
      jobTitle: schemaResult.title || detectJobTitle() || "",
      company: schemaResult.company || detectCompany() || "",
      method: "schema_org",
    };
  }

  // Strategy 2: OpenGraph/Meta tags
  const metaResult = detectFromMetaTags();
  if (metaResult.description && metaResult.description.length > 200) {
    console.log("[CV-Tailor] Using meta tag detection");
    return {
      jd: metaResult.description,
      jobTitle: metaResult.title || detectJobTitle() || "",
      company: detectCompany() || "",
      method: "meta_tags",
    };
  }

  // Strategy 3: CSS Selector-based detection
  const selectorResult = detectFromSelectors();
  const jobInfo = detectJobInfo();
  
  return {
    jd: selectorResult,
    jobTitle: jobInfo.jobTitle,
    company: jobInfo.company,
    method: "css_selectors",
  };
}

/**
 * Strategy 1: Extract from Schema.org JSON-LD
 */
function detectFromSchemaOrg(): SchemaJobPosting | null {
  try {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');

    for (const script of scripts) {
      const content = script.textContent;
      if (!content) continue;

      try {
        const data = JSON.parse(content);
        const jobPosting = findJobPosting(data);

        if (jobPosting) {
          return {
            title: extractString(jobPosting.title),
            company: extractCompanyName(jobPosting.hiringOrganization),
            description: cleanHtml(extractString(jobPosting.description) || ""),
            location: extractLocation(jobPosting.jobLocation),
          };
        }
      } catch {
        continue;
      }
    }
  } catch (error) {
    console.error("[CV-Tailor] Schema.org detection error:", error);
  }

  return null;
}

function findJobPosting(data: any): any | null {
  if (!data) return null;

  if (data["@type"] === "JobPosting") return data;
  if (Array.isArray(data["@type"]) && data["@type"].includes("JobPosting")) return data;

  if (Array.isArray(data["@graph"])) {
    for (const item of data["@graph"]) {
      const found = findJobPosting(item);
      if (found) return found;
    }
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findJobPosting(item);
      if (found) return found;
    }
  }

  return null;
}

function extractString(value: any): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    return value["@value"] || value.value || value.name;
  }
  return undefined;
}

function extractCompanyName(org: any): string | undefined {
  if (!org) return undefined;
  if (typeof org === "string") return org;
  return org.name || org.legalName;
}

function extractLocation(location: any): string | undefined {
  if (!location) return undefined;
  if (typeof location === "string") return location;

  if (location.address) {
    const addr = location.address;
    const parts = [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean);
    return parts.join(", ");
  }

  if (Array.isArray(location)) {
    return location.map((l) => extractLocation(l)).filter(Boolean).join(" | ");
  }

  return location.name;
}

/**
 * Strategy 2: Extract from meta tags
 */
function detectFromMetaTags(): { title: string; description: string } {
  const result = { title: "", description: "" };

  // OpenGraph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');

  if (ogTitle) result.title = ogTitle.getAttribute("content") || "";
  if (ogDesc) result.description = ogDesc.getAttribute("content") || "";

  // Twitter cards
  if (!result.title) {
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) result.title = twitterTitle.getAttribute("content") || "";
  }
  if (!result.description) {
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) result.description = twitterDesc.getAttribute("content") || "";
  }

  // Standard meta description
  if (!result.description) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) result.description = metaDesc.getAttribute("content") || "";
  }

  return result;
}

/**
 * Strategy 3: CSS Selector-based detection (original approach, enhanced)
 */
function detectFromSelectors(): string {
  // Expanded selectors for job descriptions across platforms
  const selectors = [
    // Generic patterns
    '[class*="job-description"]',
    '[class*="job_description"]',
    '[class*="jobDescription"]',
    '[id*="job-description"]',
    '[id*="job_description"]',
    '[data-testid*="description"]',
    '[data-automation-id*="description"]',

    // Workday
    '[data-automation-id="jobPostingDescription"]',
    ".job-posting-section",
    '[data-automation-id="jobReqDescriptionSection"]',

    // Greenhouse
    "#content .job-description",
    ".job-content",
    ".content-intro",

    // Lever
    ".posting-headline",
    ".content .posting-categories + div",
    '[data-qa="job-description"]',

    // LinkedIn
    ".description__text",
    ".jobs-description",
    ".job-view-layout",
    ".jobs-description-content__text",
    ".jobs-box__html-content",

    // Indeed
    "#jobDescriptionText",
    ".jobsearch-jobDescriptionText",
    '[id*="jobDetails"]',

    // Glassdoor
    ".desc",
    ".eeOeq",
    '[data-test="jobDescriptionContent"]',

    // Naukri
    ".job-desc",
    ".jd-desc",
    '[class*="jd-container"]',

    // Monster
    ".job-description",
    "#JobDescription",

    // ZipRecruiter
    ".job_description",
    '[class*="job-description"]',

    // Dice
    ".job-description",
    "#jobDescription",

    // Wellfound (AngelList)
    '[class*="description"]',
    ".jobs-overview",

    // SmartRecruiters
    ".job-sections",
    '[class*="jobDetails"]',

    // iCIMS
    ".iCIMS_JobContent",
    ".iCIMS_InfoMsg_Job",

    // Taleo
    ".job-description",
    '[id*="requisitionDesc"]',

    // Generic fallbacks
    '[role="main"]',
    "main",
    "article",
  ];

  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element && element.textContent && element.textContent.length > 200) {
        return cleanText(element.textContent);
      }
    } catch {
      // Invalid selector, skip
    }
  }

  // Fallback: look for large text blocks in main content area
  const mainContent = document.querySelector("main") || document.querySelector("#main") || document.body;
  const allParagraphs = mainContent.querySelectorAll("p, div, section");
  let longestText = "";

  for (const el of allParagraphs) {
    const text = el.textContent || "";
    // Look for job-related content
    if (
      text.length > longestText.length &&
      text.length > 500 &&
      (text.toLowerCase().includes("responsibilities") ||
        text.toLowerCase().includes("requirements") ||
        text.toLowerCase().includes("qualifications") ||
        text.toLowerCase().includes("experience"))
    ) {
      longestText = text;
    }
  }

  if (longestText.length > 200) {
    return cleanText(longestText);
  }

  // Last resort fallback
  for (const el of allParagraphs) {
    const text = el.textContent || "";
    if (text.length > longestText.length && text.length > 500) {
      longestText = text;
    }
  }

  return cleanText(longestText);
}

/**
 * Detect job title from page
 */
function detectJobTitle(): string {
  const selectors = [
    "h1",
    '[class*="job-title"]',
    '[class*="jobTitle"]',
    '[data-testid*="title"]',
    ".posting-headline h2",
    ".jobs-details-top-card__job-title",
    ".top-card-layout__title",
    '[data-automation-id="jobPostingTitle"]',
    ".job-title",
    '[class*="title"]',
  ];

  for (const selector of selectors) {
    try {
      const el = document.querySelector(selector);
      if (el && el.textContent && el.textContent.length > 2 && el.textContent.length < 150) {
        const text = cleanText(el.textContent);
        // Avoid navigation/header text
        if (!text.toLowerCase().includes("menu") && !text.toLowerCase().includes("search")) {
          return text;
        }
      }
    } catch {
      continue;
    }
  }

  return "";
}

/**
 * Detect company name from page
 */
function detectCompany(): string {
  const selectors = [
    '[class*="company-name"]',
    '[class*="companyName"]',
    '[class*="company_name"]',
    '[data-testid*="company"]',
    ".posting-categories .company",
    ".jobs-details-top-card__company-url",
    ".employer-name",
    ".top-card-layout__second-subline",
    '[data-automation-id="jobPostingHeader"]',
    '[class*="employer"]',
    '[class*="organization"]',
  ];

  for (const selector of selectors) {
    try {
      const el = document.querySelector(selector);
      if (el && el.textContent && el.textContent.length > 1 && el.textContent.length < 100) {
        return cleanText(el.textContent);
      }
    } catch {
      continue;
    }
  }

  return "";
}

/**
 * Detect job title and company from the page (combined for backward compatibility)
 */
function detectJobInfo(): { jobTitle: string; company: string } {
  let jobTitle = detectJobTitle();
  let company = detectCompany();

  // Try to get from page title as fallback
  if (!jobTitle || !company) {
    const pageTitle = document.title;
    // Common patterns: "Job Title at Company" or "Job Title - Company"
    const match = pageTitle.match(/^(.+?)\s+(?:at|@|-|–|—|\|)\s+(.+?)(?:\s+[-|]|$)/i);
    if (match) {
      if (!jobTitle) jobTitle = match[1].trim();
      if (!company) company = match[2].trim();
    }
  }

  return { jobTitle, company };
}

/**
 * Get fillable form fields on the page
 */
function getFormFields(): Array<{ name: string; type: string; label: string; value: string }> {
  const fields: Array<{ name: string; type: string; label: string; value: string }> = [];

  const inputs = document.querySelectorAll("input, textarea, select");

  for (const input of inputs) {
    const el = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    // Skip hidden and submit inputs
    if (el.type === "hidden" || el.type === "submit" || el.type === "button") continue;

    // Get label
    let label = "";
    const labelEl = document.querySelector(`label[for="${el.id}"]`);
    if (labelEl) {
      label = labelEl.textContent || "";
    } else {
      // Try to find nearby label
      const parent = el.closest("div, fieldset, label");
      if (parent) {
        const nearLabel = parent.querySelector("label, span, div");
        if (nearLabel && nearLabel !== el) {
          label = nearLabel.textContent || "";
        }
      }
    }

    fields.push({
      name: el.name || el.id || "",
      type: el.tagName.toLowerCase() + (el.type ? `-${el.type}` : ""),
      label: cleanText(label).slice(0, 100),
      value: el.value || "",
    });
  }

  return fields;
}

/**
 * Fill form with provided data - returns count of filled fields
 */
async function fillForm(data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  coverLetter?: string;
  resumeText?: string;
}): Promise<number> {
  // Field matchers - map data keys to common field identifiers
  const fieldMatchers: Record<string, string[]> = {
    firstName: ["first_name", "firstname", "fname", "first-name", "given", "first name", "givenname"],
    lastName: ["last_name", "lastname", "lname", "last-name", "surname", "family", "last name", "familyname"],
    email: ["email", "e-mail", "emailaddress", "e_mail", "mail"],
    phone: ["phone", "telephone", "tel", "mobile", "cell", "phonenumber", "phone number"],
    linkedin: ["linkedin", "linked-in", "linked_in", "linkedinurl"],
    github: ["github", "git-hub", "githuburl"],
    portfolio: ["portfolio", "website", "url", "personal", "personalwebsite", "personalurl", "web"],
    coverLetter: ["cover", "letter", "coverletter", "cover_letter", "cover letter", "motivation"],
  };

  let filledCount = 0;
  const inputs = document.querySelectorAll("input, textarea");

  console.log("[CV-Tailor] Found", inputs.length, "input fields");

  for (const input of inputs) {
    const el = input as HTMLInputElement | HTMLTextAreaElement;
    if (
      el.type === "hidden" ||
      el.type === "submit" ||
      el.type === "file" ||
      el.type === "checkbox" ||
      el.type === "radio"
    )
      continue;

    // Build identifier from all available attributes
    const identifier = [
      el.name,
      el.id,
      el.placeholder,
      el.className,
      el.getAttribute("aria-label"),
      el.getAttribute("data-testid"),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    // Get label text
    let labelText = "";
    const labelEl = document.querySelector(`label[for="${el.id}"]`);
    if (labelEl) {
      labelText = (labelEl.textContent || "").toLowerCase();
    } else {
      // Check parent for label
      const parent = el.closest("div, fieldset, label, section");
      if (parent) {
        const nearLabel = parent.querySelector("label, span.label, div.label");
        if (nearLabel) {
          labelText = (nearLabel.textContent || "").toLowerCase();
        }
      }
    }

    const fullIdentifier = identifier + " " + labelText;

    // Try to match and fill
    let filled = false;
    for (const [key, patterns] of Object.entries(fieldMatchers)) {
      if (filled) break;
      const value = data[key as keyof typeof data];
      if (!value) continue;

      for (const pattern of patterns) {
        if (fullIdentifier.includes(pattern)) {
          console.log("[CV-Tailor] Filling field:", el.name || el.id, "with", key);
          await fillField(el, value);
          filledCount++;
          filled = true;
          break;
        }
      }
    }
  }

  return filledCount;
}

/**
 * Fill a single field with proper event simulation
 */
async function fillField(element: HTMLInputElement | HTMLTextAreaElement, value: string): Promise<void> {
  // Don't overwrite existing values (unless empty or just whitespace)
  if (element.value && element.value.trim()) {
    console.log("[CV-Tailor] Skipping field (has value):", element.name || element.id);
    return;
  }

  // Focus the element
  element.focus();

  // Clear existing value
  element.value = "";

  // Set value using native setter for React compatibility
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;
  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  )?.set;

  if (element instanceof HTMLInputElement && nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value);
  } else if (element instanceof HTMLTextAreaElement && nativeTextAreaValueSetter) {
    nativeTextAreaValueSetter.call(element, value);
  } else {
    element.value = value;
  }

  // Dispatch events for React/Angular/Vue apps
  element.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
  element.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  element.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));

  // Small delay for framework updates
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Clean text by removing extra whitespace
 */
function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").replace(/\n+/g, "\n").trim();
}

/**
 * Clean HTML content to plain text
 */
function cleanHtml(html: string): string {
  // Create a temporary element to parse HTML
  const div = document.createElement("div");
  div.innerHTML = html;

  // Remove script and style elements
  const scripts = div.querySelectorAll("script, style");
  scripts.forEach((s) => s.remove());

  // Get text content
  return cleanText(div.textContent || "");
}

// Notify that content script is loaded
console.log("[CV-Tailor] Content script loaded on:", window.location.hostname);
