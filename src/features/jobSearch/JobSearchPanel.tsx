import { useState, useEffect } from "react";
import {
  JOB_ROLES,
  JOB_BOARDS,
  TIME_PERIODS,
  EXPERIENCE_LEVELS,
  WORK_TYPES,
  POPULAR_LOCATIONS,
  buildSearchUrl,
  type SavedSearch,
} from "./jobSearchData";
import { loadSavedSearches, saveSavedSearches } from "../../core/storage";

export function JobSearchPanel() {
  // Form state
  const [selectedBoards, setSelectedBoards] = useState<string[]>(["linkedin", "indeed"]);
  const [selectedRole, setSelectedRole] = useState<string>("Software Engineer");
  const [customRole, setCustomRole] = useState<string>("");
  const [location, setLocation] = useState<string>("Bangalore, India");
  const [timePeriod, setTimePeriod] = useState<string>("7d");
  const [experienceLevels, setExperienceLevels] = useState<string[]>(["mid", "senior"]);
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  
  // Saved searches
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchName, setSearchName] = useState<string>("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  useEffect(() => {
    loadSavedSearches().then(setSavedSearches);
  }, []);

  const handleBoardToggle = (boardId: string) => {
    setSelectedBoards((prev) =>
      prev.includes(boardId)
        ? prev.filter((id) => id !== boardId)
        : [...prev, boardId]
    );
  };

  const handleExpLevelToggle = (levelId: string) => {
    setExperienceLevels((prev) =>
      prev.includes(levelId)
        ? prev.filter((id) => id !== levelId)
        : [...prev, levelId]
    );
  };

  const handleWorkTypeToggle = (typeId: string) => {
    setWorkTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSearch = async () => {
    const boards = JOB_BOARDS.filter((b) => selectedBoards.includes(b.id));
    const period = TIME_PERIODS.find((t) => t.id === timePeriod) || TIME_PERIODS[2];
    const expLevels = EXPERIENCE_LEVELS.filter((e) => experienceLevels.includes(e.id));
    const workTypesList = WORK_TYPES.filter((w) => workTypes.includes(w.id));
    const role = selectedRole === "__custom__" ? customRole : selectedRole;

    for (const board of boards) {
      const url = buildSearchUrl(board, role, location, period, expLevels, workTypesList);
      await chrome.tabs.create({ url, active: false });
    }
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      boards: selectedBoards,
      role: selectedRole === "__custom__" ? customRole : selectedRole,
      location,
      timePeriod,
      experienceLevels,
      workTypes,
      createdAt: new Date(),
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    await saveSavedSearches(updated);
    setSearchName("");
    setShowSaveForm(false);
  };

  const handleLoadSearch = (search: SavedSearch) => {
    setSelectedBoards(search.boards);
    if (JOB_ROLES.includes(search.role as any)) {
      setSelectedRole(search.role);
    } else {
      setSelectedRole("__custom__");
      setCustomRole(search.role);
    }
    setLocation(search.location);
    setTimePeriod(search.timePeriod);
    setExperienceLevels(search.experienceLevels);
    setWorkTypes(search.workTypes);
  };

  const handleDeleteSearch = async (id: string) => {
    const updated = savedSearches.filter((s) => s.id !== id);
    setSavedSearches(updated);
    await saveSavedSearches(updated);
  };

  return (
    <div className="space-y-4">
      {/* Job Boards Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">📍 Job Sites</h3>
        <div className="flex flex-wrap gap-2">
          {JOB_BOARDS.map((board) => (
            <button
              key={board.id}
              onClick={() => handleBoardToggle(board.id)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                selectedBoards.includes(board.id)
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {board.icon} {board.name}
            </button>
          ))}
        </div>
      </div>

      {/* Job Role Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">💼 Job Role</h3>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {JOB_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
          <option value="__custom__">Other (Custom)</option>
        </select>
        
        {selectedRole === "__custom__" && (
          <input
            type="text"
            placeholder="Enter custom job title..."
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      {/* Location Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">📍 Location</h3>
        <input
          type="text"
          placeholder="City, Country"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          list="locations"
        />
        <datalist id="locations">
          {POPULAR_LOCATIONS.map((loc) => (
            <option key={loc} value={loc} />
          ))}
        </datalist>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {WORK_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleWorkTypeToggle(type.id)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                workTypes.includes(type.id)
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Period Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">⏰ Posted Within</h3>
        <div className="flex flex-wrap gap-2">
          {TIME_PERIODS.map((period) => (
            <button
              key={period.id}
              onClick={() => setTimePeriod(period.id)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                timePeriod === period.id
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">🎯 Experience Level</h3>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => handleExpLevelToggle(level.id)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                experienceLevels.includes(level.id)
                  ? "bg-purple-50 border-purple-300 text-purple-700"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={selectedBoards.length === 0}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🚀 Search Jobs ({selectedBoards.length} sites)
      </button>

      {/* Save/Load Searches */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">💾 Saved Searches</h3>
          <button
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            {showSaveForm ? "Cancel" : "+ Save Current"}
          </button>
        </div>

        {showSaveForm && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Search name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveSearch}
              disabled={!searchName.trim()}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        )}

        {savedSearches.length === 0 ? (
          <p className="text-xs text-gray-500">No saved searches yet</p>
        ) : (
          <div className="space-y-2">
            {savedSearches.slice(-5).reverse().map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <button
                  onClick={() => handleLoadSearch(search)}
                  className="text-sm text-gray-700 hover:text-blue-600 text-left flex-1"
                >
                  {search.name}
                  <span className="text-xs text-gray-400 ml-2">
                    {search.role} • {search.boards.length} sites
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteSearch(search.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
