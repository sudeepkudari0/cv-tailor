import { useState, useEffect } from "react";
import yaml from "js-yaml";
import { createProvider } from "../models/providers/factory";
import { ProviderConfig } from "../models/providers/types";
import { ResumeEditor } from "../core/resumeEditor";
import { CoverLetterGenerator } from "../core/coverLetter";
import { generateResumePDF } from "../core/pdfGenerator";
import { MasterResume, JDAnalysis } from "../core/types";

type Mode = "select" | "manual" | "auto";
type Tab = "resume" | "cover-letter";

export function SidePanel() {
  const [mode, setMode] = useState<Mode>("select");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  
  const [resume, setResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [jdAnalysis, setJdAnalysis] = useState<JDAnalysis | null>(null);
  const [masterResume, setMasterResume] = useState<MasterResume | null>(null);
  
  const [activeTab, setActiveTab] = useState<Tab>("resume");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  // Auto mode state
  const [autoDetectedJD, setAutoDetectedJD] = useState<string | null>(null);
  const [_autoJobTitle, setAutoJobTitle] = useState("");
  const [_autoCompany, setAutoCompany] = useState("");
  const [fillStatus, setFillStatus] = useState<string | null>(null);

  useEffect(() => {
    checkConfiguration();
  }, []);

  async function checkConfiguration() {
    try {
      const response = await chrome.runtime.sendMessage({ type: "IS_CONFIGURED" });
      setIsConfigured(response.data);
    } catch (err) {
      console.error("Failed to check configuration:", err);
    }
  }

  // Auto detect JD from current page
  async function detectFromPage() {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error("No active tab");

      // Try to inject content script first (in case it's not loaded)
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["contentScript.js"],
        });
      } catch {
        // Script might already be injected, continue
      }

      // Small delay to ensure script is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, { type: "DETECT_JD" });
      
      if (response.success && response.data.jd) {
        setAutoDetectedJD(response.data.jd);
        setAutoJobTitle(response.data.jobTitle || "");
        setAutoCompany(response.data.company || "");
        setJobDescription(response.data.jd);
        setJobTitle(response.data.jobTitle || "");
        setCompany(response.data.company || "");
      } else {
        throw new Error("Could not detect job description on this page");
      }
    } catch (err: any) {
      if (err.message?.includes("Receiving end does not exist")) {
        setError("Cannot access this page. Try a job posting page.");
      } else {
        setError(err.message || "Failed to detect job description");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Fill form on the page
  async function fillPageForm() {
    if (!masterResume) {
      setError("No master resume loaded");
      return;
    }

    setFillStatus("Filling form...");
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error("No active tab");

      // Ensure content script is injected
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["contentScript.js"],
        });
      } catch {
        // Script might already be injected
      }
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "FILL_FORM",
        data: {
          firstName: masterResume.name.split(" ")[0],
          lastName: masterResume.name.split(" ").slice(1).join(" "),
          email: masterResume.email,
          phone: masterResume.phone,
          linkedin: masterResume.linkedin,
          github: masterResume.github,
          portfolio: masterResume.portfolio,
          coverLetter: coverLetter,
        },
      });

      if (response.success) {
        setFillStatus("✓ Form filled!");
        setTimeout(() => setFillStatus(null), 3000);
      } else {
        throw new Error(response.error || "Failed to fill form");
      }
    } catch (err: any) {
      setFillStatus(null);
      setError(err.message || "Failed to fill form");
    }
  }

  async function handleGenerate() {
    if (!jobDescription.trim() || !jobTitle.trim() || !company.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResume("");
    setCoverLetter("");

    try {
      setLoadingStatus("Loading configuration...");
      const configResponse = await chrome.runtime.sendMessage({ type: "GET_PROVIDER_CONFIG" });
      if (!configResponse.success) {
        throw new Error(configResponse.error);
      }
      const providerConfig: ProviderConfig = configResponse.data;

      const fullConfigResponse = await chrome.runtime.sendMessage({ type: "GET_CONFIG" });
      if (!fullConfigResponse.success) {
        throw new Error(fullConfigResponse.error);
      }
      
      const masterResumeYaml = fullConfigResponse.data.masterResumeYaml;
      if (!masterResumeYaml) {
        throw new Error("Please upload your master resume in Settings first");
      }

      const parsedResume = yaml.load(masterResumeYaml) as MasterResume;
      setMasterResume(parsedResume);

      setLoadingStatus("Connecting to LLM...");
      const provider = await createProvider(providerConfig);
      const resumeEditor = new ResumeEditor(provider);
      const coverLetterGen = new CoverLetterGenerator(provider);

      setLoadingStatus("Analyzing job description...");
      const { resume: optimizedResume, jdAnalysis: analysis } = await resumeEditor.optimize(
        parsedResume,
        jobDescription,
        jobTitle,
        company
      );
      setResume(optimizedResume);
      setJdAnalysis(analysis);

      setLoadingStatus("Writing cover letter...");
      const letter = await coverLetterGen.generate(
        company,
        jobTitle,
        jobDescription,
        optimizedResume
      );
      setCoverLetter(letter);
      setLoadingStatus("");

    } catch (err: any) {
      setError(err.message || "Generation failed");
      setLoadingStatus("");
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopy(text: string, type: string) {
    navigator.clipboard.writeText(text);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(null), 2000);
  }

  function handleDownload(text: string, filename: string) {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadPDF() {
    if (!resume) return;
    
    try {
      const filename = `Resume_${company.replace(/\s+/g, "_")}_${jobTitle.replace(/\s+/g, "_")}.pdf`;
      await generateResumePDF(resume, filename, masterResume || undefined);
    } catch (err: any) {
      setError(`PDF generation failed: ${err.message}`);
    }
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="card bg-slate-800/50 border border-amber-500/30 shadow-lg">
          <div className="card-body text-center">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-amber-400">Welcome to CV-Tailor</h2>
            <p className="text-slate-300 text-sm">Configure your LLM provider and upload your master resume to get started.</p>
            <button 
              className="btn btn-warning mt-4"
              onClick={() => chrome.runtime.openOptionsPage()}
            >
              ⚙️ Open Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mode Selection Screen
  if (mode === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CV-Tailor
              </h1>
            </div>
            <button 
              className="btn btn-ghost btn-sm text-slate-400 hover:text-white"
              onClick={() => chrome.runtime.openOptionsPage()}
            >
              ⚙️
            </button>
          </div>

          {/* Mode Selection */}
          <div className="text-center py-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-6">Choose Your Mode</h2>
            
            <div className="grid gap-4">
              {/* Manual Mode */}
              <button
                className="card bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-all p-6 text-left"
                onClick={() => setMode("manual")}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">✍️</div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-400">Manual Mode</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Paste job description manually, generate tailored resume & cover letter, copy/download for application.
                    </p>
                  </div>
                </div>
              </button>

              {/* Auto Mode */}
              <button
                className="card bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 transition-all p-6 text-left"
                onClick={() => { setMode("auto"); detectFromPage(); }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🤖</div>
                  <div>
                    <h3 className="text-lg font-bold text-purple-400">Auto Mode</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Auto-detect job description from page, generate documents, and auto-fill application forms.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="badge badge-sm bg-purple-600/30 text-purple-300 border-purple-500/30">JD Detection</span>
                      <span className="badge badge-sm bg-purple-600/30 text-purple-300 border-purple-500/30">Form Auto-fill</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setMode("select")}
              className="btn btn-ghost btn-sm text-slate-400 hover:text-white p-1"
            >
              ←
            </button>
            <span className="text-2xl">{mode === "auto" ? "🤖" : "✍️"}</span>
            <h1 className="text-lg font-bold text-slate-200">
              {mode === "auto" ? "Auto Mode" : "Manual Mode"}
            </h1>
          </div>
          <button 
            className="btn btn-ghost btn-sm text-slate-400 hover:text-white"
            onClick={() => chrome.runtime.openOptionsPage()}
          >
            ⚙️
          </button>
        </div>

        {/* Auto Mode: Detection Status */}
        {mode === "auto" && (
          <div className="card bg-purple-900/20 border border-purple-500/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {autoDetectedJD ? (
                  <>
                    <span className="text-green-400">✓</span>
                    <span className="text-sm text-slate-300">JD Detected</span>
                  </>
                ) : (
                  <>
                    <span className="text-amber-400">⚠</span>
                    <span className="text-sm text-slate-300">No JD detected</span>
                  </>
                )}
              </div>
              <button 
                className="btn btn-xs btn-outline border-purple-500 text-purple-400"
                onClick={detectFromPage}
                disabled={isLoading}
              >
                🔄 Re-detect
              </button>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="card bg-slate-800/50 border border-slate-700 shadow-lg">
          <div className="card-body p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Job Title"
                className="input input-bordered input-sm w-full bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Company"
                className="input input-bordered input-sm w-full bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            
            <textarea
              placeholder="Paste job description here..."
              className="textarea textarea-bordered w-full h-32 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-sm"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            <button
              className={`btn w-full ${isLoading 
                ? "btn-disabled bg-slate-700" 
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0"}`}
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  {loadingStatus || "Generating..."}
                </span>
              ) : (
                "✨ Generate Resume & Cover Letter"
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert bg-red-900/50 border border-red-500/50 text-red-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Results */}
        {(resume || coverLetter) && (
          <div className="card bg-slate-800/50 border border-slate-700 shadow-lg">
            <div className="card-body p-4">
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-slate-900/50 rounded-lg">
                <button 
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === "resume" 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                      : "text-slate-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("resume")}
                >
                  📄 Resume
                </button>
                <button 
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === "cover-letter" 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                      : "text-slate-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("cover-letter")}
                >
                  ✉️ Cover Letter
                </button>
              </div>

              {/* Content */}
              <div className="mt-4">
                {activeTab === "resume" && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button 
                        className={`btn btn-sm ${copySuccess === "resume" ? "btn-success" : "btn-outline border-slate-600 text-slate-300 hover:bg-slate-700"}`}
                        onClick={() => handleCopy(resume, "resume")}
                      >
                        {copySuccess === "resume" ? "✓ Copied!" : "📋 Copy"}
                      </button>
                      <button 
                        className="btn btn-sm btn-outline border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => handleDownload(resume, `Resume_${company}_${jobTitle}.txt`)}
                      >
                        📝 TXT
                      </button>
                      <button 
                        className="btn btn-sm bg-gradient-to-r from-red-600 to-orange-600 text-white border-0 hover:from-red-500 hover:to-orange-500"
                        onClick={handleDownloadPDF}
                      >
                        📑 PDF
                      </button>
                    </div>
                    <div className="bg-slate-900/70 rounded-lg p-4 max-h-96 overflow-auto border border-slate-700">
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                        {resume}
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === "cover-letter" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button 
                        className={`btn btn-sm ${copySuccess === "letter" ? "btn-success" : "btn-outline border-slate-600 text-slate-300 hover:bg-slate-700"}`}
                        onClick={() => handleCopy(coverLetter, "letter")}
                      >
                        {copySuccess === "letter" ? "✓ Copied!" : "📋 Copy"}
                      </button>
                      <button 
                        className="btn btn-sm btn-outline border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => handleDownload(coverLetter, `CoverLetter_${company}_${jobTitle}.txt`)}
                      >
                        ⬇️ Download
                      </button>
                    </div>
                    <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-700">
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {coverLetter}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-fill button for Auto mode */}
              {mode === "auto" && (
                <button
                  className="btn w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-500 hover:to-pink-500"
                  onClick={fillPageForm}
                  disabled={!resume}
                >
                  {fillStatus || "🚀 Auto-fill Application Form"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* JD Analysis */}
        {jdAnalysis && (
          <div className="card bg-slate-800/50 border border-slate-700">
            <details className="p-4">
              <summary className="cursor-pointer text-sm font-medium text-slate-300 flex items-center gap-2">
                <span>📊</span>
                <span>JD Analysis</span>
                <span className="badge badge-sm bg-blue-600 text-white border-0">
                  {jdAnalysis.hard_skills.length + jdAnalysis.tools_technologies.length} keywords
                </span>
              </summary>
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-blue-400">Hard Skills: </span>
                  <span className="text-slate-400">{jdAnalysis.hard_skills.join(", ") || "None detected"}</span>
                </div>
                <div>
                  <span className="font-semibold text-purple-400">Tools & Tech: </span>
                  <span className="text-slate-400">{jdAnalysis.tools_technologies.join(", ") || "None detected"}</span>
                </div>
                <div>
                  <span className="font-semibold text-green-400">Must Have: </span>
                  <span className="text-slate-400">{jdAnalysis.keyword_priorities.must_have.join(", ") || "None detected"}</span>
                </div>
                <div>
                  <span className="font-semibold text-amber-400">Nice to Have: </span>
                  <span className="text-slate-400">{jdAnalysis.keyword_priorities.nice_to_have.join(", ") || "None detected"}</span>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
