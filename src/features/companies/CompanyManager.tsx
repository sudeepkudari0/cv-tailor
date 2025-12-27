import { useState, useEffect } from "react";
import {
  COMPANY_CATEGORIES,
  getCompaniesByCategory,
  guessCareerUrl,
  type CompanyInfo,
} from "./companyData";
import {
  loadTargetCompanies,
  saveTargetCompanies,
  updateCompanyLastChecked,
  type TargetCompany,
} from "../../core/storage";

export function CompanyManager() {
  const [targetCompanies, setTargetCompanies] = useState<TargetCompany[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("big_tech");
  const [customCompanyName, setCustomCompanyName] = useState("");
  const [customCareerUrl, setCustomCareerUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTargetCompanies().then(setTargetCompanies);
  }, []);

  const handleAddFromCategory = async (company: CompanyInfo) => {
    // Check if already added
    if (targetCompanies.some((c) => c.name === company.name)) return;

    const newCompany: TargetCompany = {
      id: Date.now().toString(),
      name: company.name,
      careerUrl: company.careerUrl,
      category: company.category,
      addedAt: new Date(),
    };

    const updated = [...targetCompanies, newCompany];
    setTargetCompanies(updated);
    await saveTargetCompanies(updated);
  };

  const handleAddCustom = async () => {
    if (!customCompanyName.trim()) return;

    const url = customCareerUrl.trim() || guessCareerUrl(customCompanyName);

    const newCompany: TargetCompany = {
      id: Date.now().toString(),
      name: customCompanyName,
      careerUrl: url,
      category: "custom",
      addedAt: new Date(),
    };

    const updated = [...targetCompanies, newCompany];
    setTargetCompanies(updated);
    await saveTargetCompanies(updated);

    setCustomCompanyName("");
    setCustomCareerUrl("");
    setShowAddForm(false);
  };

  const handleRemove = async (id: string) => {
    const updated = targetCompanies.filter((c) => c.id !== id);
    setTargetCompanies(updated);
    await saveTargetCompanies(updated);
  };

  const handleOpenCareer = async (company: TargetCompany) => {
    await chrome.tabs.create({ url: company.careerUrl, active: false });
    await updateCompanyLastChecked(company.id);

    // Update local state
    setTargetCompanies((prev) =>
      prev.map((c) =>
        c.id === company.id ? { ...c, lastChecked: new Date() } : c
      )
    );
  };

  const handleOpenAll = async () => {
    for (const company of targetCompanies) {
      await chrome.tabs.create({ url: company.careerUrl, active: false });
      await updateCompanyLastChecked(company.id);
    }

    setTargetCompanies((prev) =>
      prev.map((c) => ({ ...c, lastChecked: new Date() }))
    );
  };

  const categoryCompanies = getCompaniesByCategory(selectedCategory);
  const filteredCategoryCompanies = categoryCompanies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatLastChecked = (date?: Date) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  return (
    <div className="space-y-4">
      {/* Your Target Companies */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">
            🏢 Your Target Companies ({targetCompanies.length})
          </h3>
          {targetCompanies.length > 0 && (
            <button
              onClick={handleOpenAll}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Open All →
            </button>
          )}
        </div>

        {targetCompanies.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">
            No companies added yet. Add companies from the categories below!
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {targetCompanies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {company.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Last checked: {formatLastChecked(company.lastChecked)}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => handleOpenCareer(company)}
                    className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    🔍
                  </button>
                  <button
                    onClick={() => handleRemove(company.id)}
                    className="px-2 py-1 text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Company */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2"
        >
          {showAddForm ? "✕ Cancel" : "➕ Add Custom Company"}
        </button>

        {showAddForm && (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              placeholder="Company name..."
              value={customCompanyName}
              onChange={(e) => setCustomCompanyName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              placeholder="Career page URL (optional)"
              value={customCareerUrl}
              onChange={(e) => setCustomCareerUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddCustom}
              disabled={!customCompanyName.trim()}
              className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Add Company
            </button>
          </div>
        )}
      </div>

      {/* Browse Companies by Category */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          📚 Browse Companies
        </h3>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 mb-3">
          {COMPANY_CATEGORIES.filter((c) => c.id !== "custom").map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 mb-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Company Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {filteredCategoryCompanies.map((company) => {
            const isAdded = targetCompanies.some((c) => c.name === company.name);
            return (
              <button
                key={company.name}
                onClick={() => !isAdded && handleAddFromCategory(company)}
                disabled={isAdded}
                className={`p-2 text-xs text-left rounded-lg border transition-colors ${
                  isAdded
                    ? "bg-green-50 border-green-200 text-green-700 cursor-default"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200"
                }`}
              >
                {isAdded ? "✓ " : "+ "}
                {company.name}
              </button>
            );
          })}
        </div>

        {/* Add All Button */}
        {filteredCategoryCompanies.length > 0 && (
          <button
            onClick={() => {
              filteredCategoryCompanies.forEach((c) => {
                if (!targetCompanies.some((tc) => tc.name === c.name)) {
                  handleAddFromCategory(c);
                }
              });
            }}
            className="w-full mt-3 py-2 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            Add All {COMPANY_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
          </button>
        )}
      </div>
    </div>
  );
}
