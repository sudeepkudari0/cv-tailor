/**
 * Curated Company Data
 * Pre-populated lists of target companies by category
 * Sources: awesome-career-pages repo + manual curation
 */

export interface CompanyInfo {
  name: string;
  domain: string;
  careerUrl: string;
  category: string;
}

// Big Tech / FAANG+
export const BIG_TECH_COMPANIES: CompanyInfo[] = [
  { name: "Google", domain: "google.com", careerUrl: "https://careers.google.com", category: "big_tech" },
  { name: "Meta", domain: "meta.com", careerUrl: "https://www.metacareers.com", category: "big_tech" },
  { name: "Amazon", domain: "amazon.com", careerUrl: "https://www.amazon.jobs/en/", category: "big_tech" },
  { name: "Apple", domain: "apple.com", careerUrl: "https://www.apple.com/jobs/in/", category: "big_tech" },
  { name: "Microsoft", domain: "microsoft.com", careerUrl: "https://careers.microsoft.com", category: "big_tech" },
  { name: "Netflix", domain: "netflix.com", careerUrl: "https://jobs.netflix.com", category: "big_tech" },
  { name: "Nvidia", domain: "nvidia.com", careerUrl: "https://www.nvidia.com/en-us/about-nvidia/careers", category: "big_tech" },
  { name: "Tesla", domain: "tesla.com", careerUrl: "https://www.tesla.com/careers", category: "big_tech" },
  { name: "Oracle", domain: "oracle.com", careerUrl: "https://www.oracle.com/careers", category: "big_tech" },
  { name: "IBM", domain: "ibm.com", careerUrl: "https://www.ibm.com/careers", category: "big_tech" },
  { name: "Salesforce", domain: "salesforce.com", careerUrl: "https://www.salesforce.com/company/careers", category: "big_tech" },
  { name: "Adobe", domain: "adobe.com", careerUrl: "https://www.adobe.com/careers.html", category: "big_tech" },
  { name: "Intel", domain: "intel.com", careerUrl: "https://www.intel.com/content/www/us/en/jobs/jobs-at-intel.html", category: "big_tech" },
  { name: "Cisco", domain: "cisco.com", careerUrl: "https://jobs.cisco.com/", category: "big_tech" },
  { name: "VMware", domain: "vmware.com", careerUrl: "https://careers.vmware.com/", category: "big_tech" },
  { name: "SAP", domain: "sap.com", careerUrl: "https://jobs.sap.com/", category: "big_tech" },
];

// High-Growth Unicorns & Startups
export const UNICORN_COMPANIES: CompanyInfo[] = [
  { name: "Stripe", domain: "stripe.com", careerUrl: "https://stripe.com/jobs", category: "unicorn" },
  { name: "Databricks", domain: "databricks.com", careerUrl: "https://www.databricks.com/company/careers", category: "unicorn" },
  { name: "Figma", domain: "figma.com", careerUrl: "https://www.figma.com/careers", category: "unicorn" },
  { name: "Notion", domain: "notion.so", careerUrl: "https://www.notion.so/careers", category: "unicorn" },
  { name: "Vercel", domain: "vercel.com", careerUrl: "https://vercel.com/careers", category: "unicorn" },
  { name: "Linear", domain: "linear.app", careerUrl: "https://linear.app/careers", category: "unicorn" },
  { name: "Airtable", domain: "airtable.com", careerUrl: "https://airtable.com/careers", category: "unicorn" },
  { name: "Supabase", domain: "supabase.com", careerUrl: "https://supabase.com/careers", category: "unicorn" },
  { name: "Retool", domain: "retool.com", careerUrl: "https://retool.com/careers", category: "unicorn" },
  { name: "Canva", domain: "canva.com", careerUrl: "https://www.canva.com/careers", category: "unicorn" },
  { name: "Miro", domain: "miro.com", careerUrl: "https://miro.com/careers", category: "unicorn" },
  { name: "GitLab", domain: "gitlab.com", careerUrl: "https://about.gitlab.com/jobs", category: "unicorn" },
  { name: "Confluent", domain: "confluent.io", careerUrl: "https://www.confluent.io/careers/", category: "unicorn" },
  { name: "Datadog", domain: "datadoghq.com", careerUrl: "https://www.datadoghq.com/careers/", category: "unicorn" },
  { name: "Snowflake", domain: "snowflake.com", careerUrl: "https://careers.snowflake.com/", category: "unicorn" },
  { name: "HashiCorp", domain: "hashicorp.com", careerUrl: "https://www.hashicorp.com/careers", category: "unicorn" },
  { name: "Airbnb", domain: "airbnb.com", careerUrl: "https://careers.airbnb.com/", category: "unicorn" },
  { name: "Discord", domain: "discord.com", careerUrl: "https://discord.com/jobs", category: "unicorn" },
  { name: "ByteDance", domain: "bytedance.com", careerUrl: "https://jobs.bytedance.com/en", category: "unicorn" },
  { name: "Chime", domain: "chime.com", careerUrl: "https://www.chime.com/careers/", category: "unicorn" },
];

// Indian Tech Companies & Startups (Extended from awesome-career-pages)
export const INDIAN_COMPANIES: CompanyInfo[] = [
  { name: "Flipkart", domain: "flipkart.com", careerUrl: "https://www.flipkartcareers.com", category: "indian" },
  { name: "Swiggy", domain: "swiggy.com", careerUrl: "https://careers.swiggy.com", category: "indian" },
  { name: "Zomato", domain: "zomato.com", careerUrl: "https://www.zomato.com/careers", category: "indian" },
  { name: "Razorpay", domain: "razorpay.com", careerUrl: "https://razorpay.com/jobs", category: "indian" },
  { name: "Zerodha", domain: "zerodha.com", careerUrl: "https://zerodha.com/careers", category: "indian" },
  { name: "PhonePe", domain: "phonepe.com", careerUrl: "https://www.phonepe.com/careers", category: "indian" },
  { name: "CRED", domain: "cred.club", careerUrl: "https://careers.cred.club/", category: "indian" },
  { name: "Meesho", domain: "meesho.com", careerUrl: "https://www.meesho.com/about/careers", category: "indian" },
  { name: "Ola", domain: "olacabs.com", careerUrl: "https://www.careers.olacabs.com", category: "indian" },
  { name: "Dream11", domain: "dream11.com", careerUrl: "https://www.dream11.com/about-us/careers", category: "indian" },
  { name: "ShareChat", domain: "sharechat.com", careerUrl: "https://sharechat.com/careers", category: "indian" },
  { name: "Paytm", domain: "paytm.com", careerUrl: "https://paytm.com/careers", category: "indian" },
  { name: "Groww", domain: "groww.in", careerUrl: "https://groww.in/careers", category: "indian" },
  { name: "Postman", domain: "postman.com", careerUrl: "https://www.postman.com/careers", category: "indian" },
  { name: "Freshworks", domain: "freshworks.com", careerUrl: "https://www.freshworks.com/company/careers", category: "indian" },
  { name: "Zoho", domain: "zoho.com", careerUrl: "https://www.zoho.com/careers", category: "indian" },
  { name: "BrowserStack", domain: "browserstack.com", careerUrl: "https://www.browserstack.com/careers", category: "indian" },
  { name: "ClearTrip", domain: "cleartrip.com", careerUrl: "https://careers.cleartrip.com/", category: "indian" },
  { name: "ClearTax", domain: "cleartax.in", careerUrl: "https://cleartax.in/s/careers", category: "indian" },
  { name: "BigBasket", domain: "bigbasket.com", careerUrl: "https://careers.bigbasket.com/", category: "indian" },
  { name: "Delhivery", domain: "delhivery.com", careerUrl: "https://www.delhivery.com/careers/", category: "indian" },
  { name: "Cure.Fit", domain: "cure.fit", careerUrl: "https://www.cure.fit/careers", category: "indian" },
  { name: "CarDekho", domain: "cardekho.com", careerUrl: "https://careers.cardekho.com/", category: "indian" },
  { name: "Chargebee", domain: "chargebee.com", careerUrl: "https://careers.chargebee.com/jobs/", category: "indian" },
  { name: "CoinDCX", domain: "coindcx.com", careerUrl: "https://careers.coindcx.com/", category: "indian" },
  { name: "CashFree", domain: "cashfree.com", careerUrl: "https://www.cashfree.com/careers", category: "indian" },
  { name: "Acko", domain: "acko.com", careerUrl: "https://acko.hirexp.com/", category: "indian" },
  { name: "1mg", domain: "1mg.com", careerUrl: "https://www.1mg.com/jobs", category: "indian" },
  { name: "BharatPe", domain: "bharatpe.com", careerUrl: "https://bharatpe.com/career", category: "indian" },
  { name: "Bounce", domain: "bounce.bike", careerUrl: "https://careers-bounce.peoplestrong.com/", category: "indian" },
  { name: "DailyHunt", domain: "dailyhunt.in", careerUrl: "https://careers.dailyhunt.com/", category: "indian" },
  { name: "Ather Energy", domain: "atherenergy.com", careerUrl: "https://www.atherenergy.com/careers", category: "indian" },
];

// Product Companies
export const PRODUCT_COMPANIES: CompanyInfo[] = [
  { name: "Atlassian", domain: "atlassian.com", careerUrl: "https://www.atlassian.com/company/careers", category: "product" },
  { name: "Shopify", domain: "shopify.com", careerUrl: "https://www.shopify.com/careers", category: "product" },
  { name: "Twilio", domain: "twilio.com", careerUrl: "https://www.twilio.com/company/jobs", category: "product" },
  { name: "Slack", domain: "slack.com", careerUrl: "https://slack.com/careers", category: "product" },
  { name: "Zoom", domain: "zoom.us", careerUrl: "https://careers.zoom.us", category: "product" },
  { name: "Dropbox", domain: "dropbox.com", careerUrl: "https://www.dropbox.com/jobs", category: "product" },
  { name: "HubSpot", domain: "hubspot.com", careerUrl: "https://www.hubspot.com/careers", category: "product" },
  { name: "Zendesk", domain: "zendesk.com", careerUrl: "https://www.zendesk.com/jobs", category: "product" },
  { name: "Asana", domain: "asana.com", careerUrl: "https://asana.com/jobs", category: "product" },
  { name: "MongoDB", domain: "mongodb.com", careerUrl: "https://www.mongodb.com/careers", category: "product" },
  { name: "Elastic", domain: "elastic.co", careerUrl: "https://www.elastic.co/careers", category: "product" },
  { name: "Cloudflare", domain: "cloudflare.com", careerUrl: "https://www.cloudflare.com/careers", category: "product" },
  { name: "Booking.com", domain: "booking.com", careerUrl: "https://jobs.booking.com/careers", category: "product" },
  { name: "Cvent", domain: "cvent.com", careerUrl: "https://www.cvent.com/en/careers", category: "product" },
  { name: "Cohesity", domain: "cohesity.com", careerUrl: "https://www.cohesity.com/company/careers/", category: "product" },
  { name: "Commvault", domain: "commvault.com", careerUrl: "https://careers.commvault.com/", category: "product" },
  { name: "CrowdStrike", domain: "crowdstrike.com", careerUrl: "https://www.crowdstrike.com/careers/", category: "product" },
];

// Fintech Companies
export const FINTECH_COMPANIES: CompanyInfo[] = [
  { name: "Goldman Sachs", domain: "goldmansachs.com", careerUrl: "https://www.goldmansachs.com/careers", category: "fintech" },
  { name: "Morgan Stanley", domain: "morganstanley.com", careerUrl: "https://www.morganstanley.com/careers", category: "fintech" },
  { name: "JPMorgan Chase", domain: "jpmorganchase.com", careerUrl: "https://careers.jpmorgan.com", category: "fintech" },
  { name: "Visa", domain: "visa.com", careerUrl: "https://usa.visa.com/careers.html", category: "fintech" },
  { name: "Mastercard", domain: "mastercard.com", careerUrl: "https://careers.mastercard.com", category: "fintech" },
  { name: "PayPal", domain: "paypal.com", careerUrl: "https://www.paypal.com/us/webapps/mpp/jobs", category: "fintech" },
  { name: "Square", domain: "squareup.com", careerUrl: "https://careers.squareup.com", category: "fintech" },
  { name: "Robinhood", domain: "robinhood.com", careerUrl: "https://careers.robinhood.com", category: "fintech" },
  { name: "Plaid", domain: "plaid.com", careerUrl: "https://plaid.com/careers", category: "fintech" },
  { name: "Coinbase", domain: "coinbase.com", careerUrl: "https://www.coinbase.com/careers", category: "fintech" },
  { name: "American Express", domain: "americanexpress.com", careerUrl: "https://www.americanexpress.com/en-us/careers/", category: "fintech" },
  { name: "Barclays", domain: "barclays.com", careerUrl: "https://home.barclays/careers/", category: "fintech" },
  { name: "BlackRock", domain: "blackrock.com", careerUrl: "https://careers.blackrock.com/", category: "fintech" },
  { name: "Deutsche Bank", domain: "db.com", careerUrl: "https://careers.db.com/", category: "fintech" },
  { name: "Credit Suisse", domain: "credit-suisse.com", careerUrl: "https://www.credit-suisse.com/careers/en/apply.html", category: "fintech" },
  { name: "BNY Mellon", domain: "bnymellon.com", careerUrl: "https://jobs.bnymellon.com/", category: "fintech" },
];

// Consulting & Services
export const CONSULTING_COMPANIES: CompanyInfo[] = [
  { name: "Accenture", domain: "accenture.com", careerUrl: "https://www.accenture.com/in-en/careers", category: "consulting" },
  { name: "Deloitte", domain: "deloitte.com", careerUrl: "https://jobs2.deloitte.com/ui/en", category: "consulting" },
  { name: "Cognizant", domain: "cognizant.com", careerUrl: "https://careers.cognizant.com/in/en", category: "consulting" },
  { name: "Capgemini", domain: "capgemini.com", careerUrl: "https://www.capgemini.com/in-en/careers/", category: "consulting" },
  { name: "Infosys", domain: "infosys.com", careerUrl: "https://www.infosys.com/careers/", category: "consulting" },
  { name: "TCS", domain: "tcs.com", careerUrl: "https://www.tcs.com/careers", category: "consulting" },
  { name: "Wipro", domain: "wipro.com", careerUrl: "https://careers.wipro.com/", category: "consulting" },
  { name: "HCL", domain: "hcltech.com", careerUrl: "https://www.hcltech.com/careers", category: "consulting" },
  { name: "Tech Mahindra", domain: "techmahindra.com", careerUrl: "https://careers.techmahindra.com/", category: "consulting" },
  { name: "Bain & Co", domain: "bain.com", careerUrl: "https://www.bain.com/careers/", category: "consulting" },
  { name: "CGI", domain: "cgi.com", careerUrl: "https://www.cgi.com/en/careers", category: "consulting" },
  { name: "Atos", domain: "atos.net", careerUrl: "https://atos.net/en/careers", category: "consulting" },
];

// E-commerce & Retail
export const ECOMMERCE_COMPANIES: CompanyInfo[] = [
  { name: "Walmart", domain: "walmart.com", careerUrl: "https://careers.walmart.com/", category: "ecommerce" },
  { name: "Target", domain: "target.com", careerUrl: "https://jobs.target.com/", category: "ecommerce" },
  { name: "eBay", domain: "ebay.com", careerUrl: "https://careers.ebayinc.com/", category: "ecommerce" },
  { name: "Etsy", domain: "etsy.com", careerUrl: "https://www.etsy.com/careers", category: "ecommerce" },
  { name: "Ajio", domain: "ajio.com", careerUrl: "https://www.ajio.com/ajio-careers", category: "ecommerce" },
  { name: "Myntra", domain: "myntra.com", careerUrl: "https://www.myntra.com/careers", category: "ecommerce" },
];

// All companies combined
export const ALL_COMPANIES: CompanyInfo[] = [
  ...BIG_TECH_COMPANIES,
  ...UNICORN_COMPANIES,
  ...INDIAN_COMPANIES,
  ...PRODUCT_COMPANIES,
  ...FINTECH_COMPANIES,
  ...CONSULTING_COMPANIES,
  ...ECOMMERCE_COMPANIES,
];

// Category labels
export const COMPANY_CATEGORIES = [
  { id: "big_tech", label: "Big Tech (FAANG+)", icon: "🏢" },
  { id: "unicorn", label: "Unicorns", icon: "🦄" },
  { id: "indian", label: "Indian Startups", icon: "🇮🇳" },
  { id: "product", label: "Product Companies", icon: "📦" },
  { id: "fintech", label: "Fintech", icon: "💰" },
  { id: "consulting", label: "Consulting & IT", icon: "💼" },
  { id: "ecommerce", label: "E-commerce", icon: "🛒" },
  { id: "custom", label: "Custom", icon: "➕" },
];

/**
 * Attempt to find career page for a company
 */
export function guessCareerUrl(companyName: string, _domain?: string): string {
  // Check if it's in our database
  const known = ALL_COMPANIES.find(
    (c) => c.name.toLowerCase() === companyName.toLowerCase()
  );
  if (known) return known.careerUrl;

  // Return Google search as fallback
  return `https://www.google.com/search?q=${encodeURIComponent(
    `${companyName} careers jobs`
  )}`;
}

/**
 * Get companies by category
 */
export function getCompaniesByCategory(category: string): CompanyInfo[] {
  switch (category) {
    case "big_tech":
      return BIG_TECH_COMPANIES;
    case "unicorn":
      return UNICORN_COMPANIES;
    case "indian":
      return INDIAN_COMPANIES;
    case "product":
      return PRODUCT_COMPANIES;
    case "fintech":
      return FINTECH_COMPANIES;
    case "consulting":
      return CONSULTING_COMPANIES;
    case "ecommerce":
      return ECOMMERCE_COMPANIES;
    default:
      return [];
  }
}

