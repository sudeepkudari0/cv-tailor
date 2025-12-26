/**
 * Content Script for CV-Tailor Auto Mode
 * - Detects job descriptions on job pages
 * - Auto-fills application forms
 * - Works with common ATS platforms (Workday, Greenhouse, Lever, etc.)
 */

// Message types
interface Message {
  type: string;
  data?: any;
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  handleMessage(message, sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(message: Message, sendResponse: (response: any) => void) {
  try {
    switch (message.type) {
      case "DETECT_JD":
        const jd = detectJobDescription();
        const jobInfo = detectJobInfo();
        sendResponse({ success: true, data: { jd, ...jobInfo } });
        break;

      case "FILL_FORM":
        await fillForm(message.data);
        sendResponse({ success: true });
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
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Detect job description from the page
 */
function detectJobDescription(): string {
  // Common selectors for job descriptions across platforms
  const selectors = [
    // Generic
    '[class*="job-description"]',
    '[class*="job_description"]',
    '[class*="jobDescription"]',
    '[id*="job-description"]',
    '[id*="job_description"]',
    '[data-testid*="description"]',
    
    // Workday
    '[data-automation-id="jobPostingDescription"]',
    '.job-posting-section',
    
    // Greenhouse
    '#content .job-description',
    '.job-content',
    
    // Lever
    '.posting-headline',
    '.content',
    
    // LinkedIn
    '.description__text',
    '.jobs-description',
    '.job-view-layout',
    
    // Indeed
    '#jobDescriptionText',
    '.jobsearch-jobDescriptionText',
    
    // Glassdoor
    '.desc',
    '.eeOeq',
    
    // Generic fallbacks
    '[role="main"]',
    'main',
    'article',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent && element.textContent.length > 200) {
      return cleanText(element.textContent);
    }
  }

  // Fallback: look for large text blocks
  const allParagraphs = document.querySelectorAll('p, div');
  let longestText = "";
  
  for (const el of allParagraphs) {
    const text = el.textContent || "";
    if (text.length > longestText.length && text.length > 500) {
      longestText = text;
    }
  }

  return cleanText(longestText);
}

/**
 * Detect job title and company from the page
 */
function detectJobInfo(): { jobTitle: string; company: string } {
  let jobTitle = "";
  let company = "";

  // Job title selectors
  const titleSelectors = [
    'h1',
    '[class*="job-title"]',
    '[class*="jobTitle"]',
    '[data-testid*="title"]',
    '.posting-headline h2',
    '.jobs-details-top-card__job-title',
  ];

  for (const selector of titleSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent && el.textContent.length > 2 && el.textContent.length < 100) {
      jobTitle = cleanText(el.textContent);
      break;
    }
  }

  // Company selectors
  const companySelectors = [
    '[class*="company-name"]',
    '[class*="companyName"]',
    '[class*="company_name"]',
    '[data-testid*="company"]',
    '.posting-categories .company',
    '.jobs-details-top-card__company-url',
    '.employer-name',
  ];

  for (const selector of companySelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent && el.textContent.length > 1 && el.textContent.length < 100) {
      company = cleanText(el.textContent);
      break;
    }
  }

  // Try to get from page title
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
  
  const inputs = document.querySelectorAll('input, textarea, select');
  
  for (const input of inputs) {
    const el = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    
    // Skip hidden and submit inputs
    if (el.type === 'hidden' || el.type === 'submit' || el.type === 'button') continue;
    
    // Get label
    let label = "";
    const labelEl = document.querySelector(`label[for="${el.id}"]`);
    if (labelEl) {
      label = labelEl.textContent || "";
    } else {
      // Try to find nearby label
      const parent = el.closest('div, fieldset, label');
      if (parent) {
        const nearLabel = parent.querySelector('label, span, div');
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
 * Fill form with provided data
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
}): Promise<void> {
  // Field matchers - map data keys to common field identifiers
  const fieldMatchers: Record<string, string[]> = {
    firstName: ['first_name', 'firstname', 'fname', 'first-name', 'given'],
    lastName: ['last_name', 'lastname', 'lname', 'last-name', 'surname', 'family'],
    email: ['email', 'e-mail', 'emailaddress'],
    phone: ['phone', 'telephone', 'tel', 'mobile', 'cell'],
    linkedin: ['linkedin', 'linked-in', 'linked_in'],
    github: ['github', 'git-hub'],
    portfolio: ['portfolio', 'website', 'url', 'personal'],
    coverLetter: ['cover', 'letter', 'coverletter', 'cover_letter'],
  };

  const inputs = document.querySelectorAll('input, textarea');
  
  for (const input of inputs) {
    const el = input as HTMLInputElement | HTMLTextAreaElement;
    if (el.type === 'hidden' || el.type === 'submit') continue;
    
    const identifier = (el.name + el.id + el.placeholder + el.className).toLowerCase();
    
    // Try to match and fill
    for (const [key, patterns] of Object.entries(fieldMatchers)) {
      const value = data[key as keyof typeof data];
      if (!value) continue;
      
      for (const pattern of patterns) {
        if (identifier.includes(pattern)) {
          await fillField(el, value);
          break;
        }
      }
    }
    
    // Check for label match
    const label = document.querySelector(`label[for="${el.id}"]`);
    if (label) {
      const labelText = label.textContent?.toLowerCase() || "";
      for (const [key, patterns] of Object.entries(fieldMatchers)) {
        const value = data[key as keyof typeof data];
        if (!value) continue;
        
        for (const pattern of patterns) {
          if (labelText.includes(pattern)) {
            await fillField(el, value);
            break;
          }
        }
      }
    }
  }
}

/**
 * Fill a single field with proper event simulation
 */
async function fillField(element: HTMLInputElement | HTMLTextAreaElement, value: string): Promise<void> {
  // Don't overwrite existing values
  if (element.value) return;
  
  // Focus the element
  element.focus();
  
  // Set value
  element.value = value;
  
  // Dispatch events for React/Angular/Vue apps
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
  
  // Small delay for framework updates
  await new Promise(resolve => setTimeout(resolve, 50));
}

/**
 * Clean text by removing extra whitespace
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}

// Notify that content script is loaded
console.log("CV-Tailor content script loaded");
