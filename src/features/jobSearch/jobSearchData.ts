/**
 * Job Search Data
 * Constants and templates for the Job Discovery Hub
 */

// Predefined IT Job Roles
export const JOB_ROLES = [
  // Engineering
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Software Engineer",
  "Principal Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Site Reliability Engineer (SRE)",
  "Platform Engineer",
  "Cloud Engineer",
  "Data Engineer",
  "ML Engineer",
  "AI Engineer",
  "Mobile Developer",
  "iOS Developer",
  "Android Developer",
  "React Native Developer",
  "Flutter Developer",
  "Security Engineer",
  "QA Engineer",
  "SDET",
  "Embedded Systems Engineer",
  
  // Architecture & Leadership
  "Solutions Architect",
  "Software Architect",
  "Tech Lead",
  "Engineering Manager",
  "VP of Engineering",
  "CTO",
  
  // Data & Analytics
  "Data Scientist",
  "Data Analyst",
  "Business Analyst",
  "Business Intelligence Analyst",
  "Analytics Engineer",
  
  // Product & Design
  "Product Manager",
  "Technical Product Manager",
  "UX Designer",
  "UI Designer",
  "Product Designer",
  
  // Other Technical
  "Technical Writer",
  "Developer Advocate",
  "Scrum Master",
  "Agile Coach",
  "Database Administrator",
  "Network Engineer",
  "Systems Administrator",
] as const;

export type JobRole = typeof JOB_ROLES[number] | string;

// Job Boards Configuration
export interface JobBoard {
  id: string;
  name: string;
  icon: string;
  searchTemplate: string;
  supportsDateFilter: boolean;
  supportsLocation: boolean;
}

export const JOB_BOARDS: JobBoard[] = [
  // General Google Search (no site restriction)
  {
    id: "google",
    name: "Google Search",
    icon: "🌐",
    searchTemplate: '"{role}" jobs "{location}"',
    supportsDateFilter: true,
    supportsLocation: true,
  },
  // Major Job Boards
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    searchTemplate: 'site:linkedin.com/jobs "{role}" "{location}"',
    supportsDateFilter: true,
    supportsLocation: true,
  },
  {
    id: "indeed",
    name: "Indeed",
    icon: "🔍",
    searchTemplate: 'site:indeed.com "{role}" "{location}"',
    supportsDateFilter: true,
    supportsLocation: true,
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    icon: "🚪",
    searchTemplate: 'site:glassdoor.com/job-listing "{role}" "{location}"',
    supportsDateFilter: true,
    supportsLocation: true,
  },
  {
    id: "naukri",
    name: "Naukri",
    icon: "🇮🇳",
    searchTemplate: 'site:naukri.com "{role}" "{location}"',
    supportsDateFilter: true,
    supportsLocation: true,
  },
  // Remote-Focused Job Sites
  {
    id: "remoteok",
    name: "RemoteOK",
    icon: "🏠",
    searchTemplate: 'site:remoteok.com "{role}"',
    supportsDateFilter: true,
    supportsLocation: false,
  },
  {
    id: "weworkremotely",
    name: "WeWorkRemotely",
    icon: "🌍",
    searchTemplate: 'site:weworkremotely.com "{role}"',
    supportsDateFilter: true,
    supportsLocation: false,
  },
  {
    id: "flexjobs",
    name: "FlexJobs",
    icon: "🔄",
    searchTemplate: 'site:flexjobs.com "{role}"',
    supportsDateFilter: true,
    supportsLocation: false,
  },
  {
    id: "remoteco",
    name: "Remote.co",
    icon: "☁️",
    searchTemplate: 'site:remote.co "{role}"',
    supportsDateFilter: true,
    supportsLocation: false,
  },
  {
    id: "remotive",
    name: "Remotive",
    icon: "✈️",
    searchTemplate: 'site:remotive.com "{role}"',
    supportsDateFilter: true,
    supportsLocation: false,
  },
  {
    id: "arcdev",
    name: "Arc.dev",
    icon: "⚡",
    searchTemplate: 'site:arc.dev "{role}"',
    supportsDateFilter: true,
    supportsLocation: false,
  },
  {
    id: "himalayas",
    name: "Himalayas",
    icon: "🏔️",
    searchTemplate: 'site:himalayas.app "{role}"',
    supportsDateFilter: true,
    supportsLocation: false,
  },
  // Startup & Tech
  {
    id: "wellfound",
    name: "Wellfound",
    icon: "🚀",
    searchTemplate: 'site:wellfound.com/jobs "{role}"',
    supportsDateFilter: false,
    supportsLocation: false,
  },
  {
    id: "dice",
    name: "Dice",
    icon: "🎲",
    searchTemplate: 'site:dice.com "{role}" "{location}"',
    supportsDateFilter: true,
    supportsLocation: true,
  },
  {
    id: "simplyhired",
    name: "SimplyHired",
    icon: "📋",
    searchTemplate: 'site:simplyhired.com "{role}" "{location}"',
    supportsDateFilter: true,
    supportsLocation: true,
  },
  {
    id: "monster",
    name: "Monster",
    icon: "👹",
    searchTemplate: 'site:monster.com "{role}" "{location}"',
    supportsDateFilter: true,
    supportsLocation: true,
  },
  {
    id: "ziprecruiter",
    name: "ZipRecruiter",
    icon: "⚡",
    searchTemplate: 'site:ziprecruiter.com "{role}" "{location}"',
    supportsDateFilter: true,
    supportsLocation: true,
  },
];

// Time Period Filters (Google tbs parameter)
export interface TimePeriod {
  id: string;
  label: string;
  googleParam: string;
}

export const TIME_PERIODS: TimePeriod[] = [
  { id: "24h", label: "Last 24 hours", googleParam: "&tbs=qdr:d" },
  { id: "3d", label: "Last 3 days", googleParam: "&tbs=qdr:d3" },
  { id: "7d", label: "Last week", googleParam: "&tbs=qdr:w" },
  { id: "14d", label: "Last 2 weeks", googleParam: "&tbs=qdr:w2" },
  { id: "30d", label: "Last month", googleParam: "&tbs=qdr:m" },
  { id: "any", label: "Any time", googleParam: "" },
];

// Experience Levels
export interface ExperienceLevel {
  id: string;
  label: string;
  keywords: string[];
}

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  { id: "entry", label: "Entry Level", keywords: ["entry level", "junior", "fresher", "0-2 years"] },
  { id: "mid", label: "Mid Level", keywords: ["mid level", "3-5 years", "associate"] },
  { id: "senior", label: "Senior", keywords: ["senior", "5+ years", "lead"] },
  { id: "staff", label: "Staff+", keywords: ["staff", "principal", "distinguished"] },
  { id: "manager", label: "Manager", keywords: ["manager", "director", "head of"] },
];

// Work Type
export interface WorkType {
  id: string;
  label: string;
  keywords: string[];
}

export const WORK_TYPES: WorkType[] = [
  { id: "remote", label: "Remote", keywords: ["remote", "work from home", "wfh"] },
  { id: "hybrid", label: "Hybrid", keywords: ["hybrid"] },
  { id: "onsite", label: "On-site", keywords: ["on-site", "in-office", "office"] },
];

// Popular Locations (India-focused + Global)
export const POPULAR_LOCATIONS = [
  // India
  "Bangalore, India",
  "Mumbai, India",
  "Delhi NCR, India",
  "Hyderabad, India",
  "Pune, India",
  "Chennai, India",
  "Gurgaon, India",
  "Noida, India",
  
  // Global
  "San Francisco, CA",
  "New York, NY",
  "Seattle, WA",
  "Austin, TX",
  "London, UK",
  "Berlin, Germany",
  "Singapore",
  "Toronto, Canada",
  "Remote",
];

// Saved Search Interface
export interface SavedSearch {
  id: string;
  name: string;
  boards: string[];
  role: string;
  location: string;
  timePeriod: string;
  experienceLevels: string[];
  workTypes: string[];
  createdAt: Date;
}

/**
 * Build Google search URL from parameters
 */
export function buildSearchUrl(
  board: JobBoard,
  role: string,
  location: string,
  timePeriod: TimePeriod,
  experienceLevels: ExperienceLevel[] = [],
  workTypes: WorkType[] = []
): string {
  let query = board.searchTemplate
    .replace("{role}", role)
    .replace("{location}", board.supportsLocation ? location : "");

  // Add experience level keywords
  if (experienceLevels.length > 0) {
    const expKeywords = experienceLevels.flatMap((e) => e.keywords.slice(0, 1));
    query += ` (${expKeywords.join(" OR ")})`;
  }

  // Add work type keywords
  if (workTypes.length > 0) {
    const workKeywords = workTypes.flatMap((w) => w.keywords.slice(0, 1));
    query += ` (${workKeywords.join(" OR ")})`;
  }

  const encodedQuery = encodeURIComponent(query);
  const dateFilter = board.supportsDateFilter ? timePeriod.googleParam : "";

  return `https://www.google.com/search?q=${encodedQuery}${dateFilter}`;
}

/**
 * Open multiple job search tabs
 */
export async function openJobSearches(
  boards: JobBoard[],
  role: string,
  location: string,
  timePeriod: TimePeriod,
  experienceLevels: ExperienceLevel[] = [],
  workTypes: WorkType[] = []
): Promise<void> {
  for (const board of boards) {
    const url = buildSearchUrl(board, role, location, timePeriod, experienceLevels, workTypes);
    await chrome.tabs.create({ url, active: false });
  }
}
