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
  console.log("[CV-Tailor] Received message:", message.type);
  handleMessage(message, sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(message: Message, sendResponse: (response: any) => void) {
  try {
    switch (message.type) {
      case "DETECT_JD":
        const jd = detectJobDescription();
        const jobInfo = detectJobInfo();
        console.log("[CV-Tailor] Detected JD length:", jd.length, "Job:", jobInfo);
        sendResponse({ success: true, data: { jd, ...jobInfo } });
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
    '.jobs-description-content__text',
    
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
    '.top-card-layout__title',
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
    '.top-card-layout__second-subline',
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
    firstName: ['first_name', 'firstname', 'fname', 'first-name', 'given', 'first name', 'givenname'],
    lastName: ['last_name', 'lastname', 'lname', 'last-name', 'surname', 'family', 'last name', 'familyname'],
    email: ['email', 'e-mail', 'emailaddress', 'e_mail', 'mail'],
    phone: ['phone', 'telephone', 'tel', 'mobile', 'cell', 'phonenumber', 'phone number'],
    linkedin: ['linkedin', 'linked-in', 'linked_in', 'linkedinurl'],
    github: ['github', 'git-hub', 'githuburl'],
    portfolio: ['portfolio', 'website', 'url', 'personal', 'personalwebsite', 'personalurl', 'web'],
    coverLetter: ['cover', 'letter', 'coverletter', 'cover_letter', 'cover letter', 'motivation'],
  };

  let filledCount = 0;
  const inputs = document.querySelectorAll('input, textarea');
  
  console.log("[CV-Tailor] Found", inputs.length, "input fields");
  
  for (const input of inputs) {
    const el = input as HTMLInputElement | HTMLTextAreaElement;
    if (el.type === 'hidden' || el.type === 'submit' || el.type === 'file' || el.type === 'checkbox' || el.type === 'radio') continue;
    
    // Build identifier from all available attributes
    const identifier = [
      el.name,
      el.id,
      el.placeholder,
      el.className,
      el.getAttribute('aria-label'),
      el.getAttribute('data-testid'),
    ].filter(Boolean).join(' ').toLowerCase();
    
    // Get label text
    let labelText = "";
    const labelEl = document.querySelector(`label[for="${el.id}"]`);
    if (labelEl) {
      labelText = (labelEl.textContent || "").toLowerCase();
    } else {
      // Check parent for label
      const parent = el.closest('div, fieldset, label, section');
      if (parent) {
        const nearLabel = parent.querySelector('label, span.label, div.label');
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
  element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
  
  // Small delay for framework updates
  await new Promise(resolve => setTimeout(resolve, 100));
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
console.log("[CV-Tailor] Content script loaded on:", window.location.hostname);
