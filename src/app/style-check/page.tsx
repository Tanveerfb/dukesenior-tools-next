"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

export default function StyleCheckPage() {
  const {
    theme,
    toggleTheme,
    increaseFont,
    decreaseFont,
    resetFont,
    fontScale,
  } = useTheme();
  const [showAlert, setShowAlert] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="mb-3 text-2xl font-bold text-foreground">Style check</h2>

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="flex gap-2 text-sm text-foreground/60">
          <li>
            <a href="#" className="hover:underline">
              Home
            </a>
            <span className="mx-1">/</span>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Admin
            </a>
            <span className="mx-1">/</span>
          </li>
          <li className="text-foreground font-medium" aria-current="page">
            Style Check
          </li>
        </ol>
      </nav>

      {/* Accessibility Card */}
      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4 p-3">
        <div className="flex items-center justify-between">
          <div>
            <strong>Accessibility / Quick A11y</strong>
            <div className="text-sm text-foreground/60">
              Theme: {theme} — Scale: {Math.round(fontScale * 100)}%
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={decreaseFont}
              className="px-2 py-1 text-sm border border-border rounded hover:bg-foreground/10 text-foreground"
            >
              A-
            </button>
            <button
              onClick={resetFont}
              className="px-2 py-1 text-sm border border-border rounded hover:bg-foreground/10 text-foreground"
            >
              A
            </button>
            <button
              onClick={increaseFont}
              className="px-2 py-1 text-sm border border-border rounded hover:bg-foreground/10 text-foreground"
            >
              A+
            </button>
            <button
              onClick={toggleTheme}
              className="px-3 py-1 text-sm rounded bg-gray-500 text-white hover:bg-gray-600"
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Buttons */}
        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm p-3">
          <h5 className="font-semibold mb-2 text-foreground">Buttons</h5>
          <div className="flex gap-2 flex-wrap mb-2">
            <button className="px-3 py-1.5 rounded bg-primary-500 text-white hover:bg-primary-600 text-sm">
              Default
            </button>
            <button className="px-3 py-1.5 rounded bg-primary-500 text-white hover:bg-primary-600 text-sm">
              Primary
            </button>
            <button className="px-3 py-1.5 rounded bg-gray-500 text-white hover:bg-gray-600 text-sm">
              Secondary
            </button>
            <button className="px-3 py-1.5 rounded bg-violet-500 text-white hover:bg-violet-600 text-sm">
              Tertiary
            </button>
            <button className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 text-sm">
              Success
            </button>
            <button className="px-3 py-1.5 rounded bg-yellow-500 text-black hover:bg-yellow-600 text-sm">
              Warning
            </button>
            <button className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 text-sm">
              Danger
            </button>
          </div>
          <div className="flex gap-2 flex-wrap mb-2">
            <button className="px-3 py-1.5 rounded border border-primary-500 text-primary-500 hover:bg-primary-500/10 text-sm">
              Outline Primary
            </button>
            <button className="px-3 py-1.5 rounded border border-gray-500 text-gray-500 hover:bg-gray-500/10 text-sm">
              Outline Secondary
            </button>
            <button className="px-3 py-1.5 rounded border border-violet-500 text-violet-500 hover:bg-violet-500/10 text-sm">
              Outline Tertiary
            </button>
            <button className="px-3 py-1.5 rounded border border-green-600 text-green-600 hover:bg-green-600/10 text-sm">
              Outline Success
            </button>
            <button className="px-3 py-1.5 rounded border border-yellow-500 text-yellow-600 hover:bg-yellow-500/10 text-sm">
              Outline Warning
            </button>
            <button className="px-3 py-1.5 rounded border border-red-600 text-red-600 hover:bg-red-600/10 text-sm">
              Outline Danger
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="px-2 py-1 rounded bg-primary-500 text-white hover:bg-primary-600 text-xs">
              Small
            </button>
            <button className="px-3 py-1.5 rounded bg-primary-500 text-white hover:bg-primary-600 text-sm">
              Normal
            </button>
            <button className="px-4 py-2 rounded bg-primary-500 text-white hover:bg-primary-600 text-base">
              Large
            </button>
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm p-3">
          <h5 className="font-semibold mb-2 text-foreground">Alerts</h5>
          {showAlert && (
            <div className="flex items-center justify-between rounded border border-blue-300 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700 p-3 mb-2 text-sm text-blue-800 dark:text-blue-200">
              <span>This is an informational alert. Try theme toggle.</span>
              <button
                onClick={() => setShowAlert(false)}
                className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
              >
                ×
              </button>
            </div>
          )}
          <div className="rounded border border-primary-500/30 bg-primary-500/10 p-3 mb-2 text-sm text-primary-500">
            Primary alert
          </div>
          <div className="rounded border border-violet-500/30 bg-violet-500/10 p-3 mb-2 text-sm text-violet-600 dark:text-violet-300">
            Tertiary alert
          </div>
          <div className="rounded border border-gray-400/30 bg-gray-100 dark:bg-gray-800 p-3 mb-2 text-sm text-gray-700 dark:text-gray-300">
            Secondary alert
          </div>
          <div className="rounded border border-green-400/30 bg-green-50 dark:bg-green-900/30 p-3 mb-2 text-sm text-green-700 dark:text-green-300">
            Success alert
          </div>
          <div className="rounded border border-red-400/30 bg-red-50 dark:bg-red-900/30 p-3 mb-2 text-sm text-red-700 dark:text-red-300">
            Danger alert
          </div>
          <div className="rounded border border-yellow-400/30 bg-yellow-50 dark:bg-yellow-900/30 p-3 mb-2 text-sm text-yellow-700 dark:text-yellow-300">
            Warning alert
          </div>
          <div className="rounded border border-blue-300 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700 p-3 mb-2 text-sm text-blue-800 dark:text-blue-200">
            Info alert
          </div>
          <div className="rounded border border-gray-200 bg-gray-50 dark:bg-gray-700 p-3 mb-2 text-sm text-gray-600 dark:text-gray-200">
            Light alert
          </div>
          <div className="rounded border border-gray-700 bg-gray-800 p-3 mb-2 text-sm text-gray-100">
            Dark alert
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm p-3">
          <h5 className="font-semibold mb-2 text-foreground">Form</h5>
          <form>
            <div className="mb-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••"
                className="w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Textarea
              </label>
              <textarea
                rows={3}
                placeholder="Multi-line text"
                className="w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="sc-remember"
                className="rounded border-border"
              />
              <label htmlFor="sc-remember" className="text-sm text-foreground">
                Remember me
              </label>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Range
              </label>
              <input type="range" className="w-full" />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Select
              </label>
              <select className="w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>Choose...</option>
                <option>Alpha</option>
                <option>Beta</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-primary-500 text-white hover:bg-primary-600 text-sm"
              >
                Submit
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded bg-gray-500 text-white hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Badges & Cards */}
        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm p-3">
          <h5 className="font-semibold mb-2 text-foreground">Badges & Cards</h5>
          <div className="mb-2 flex flex-wrap gap-1">
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-primary-500 text-white">
              Primary
            </span>
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-500 text-white">
              Secondary
            </span>
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-violet-500 text-white">
              Tertiary
            </span>
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-green-600 text-white">
              Success
            </span>
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-yellow-500 text-black">
              Warning
            </span>
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-red-600 text-white">
              Danger
            </span>
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-blue-500 text-black">
              Info
            </span>
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-200 text-black dark:bg-gray-600 dark:text-white">
              Light
            </span>
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-800 text-white">
              Dark
            </span>
          </div>
          <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm p-3">
            Card body content with <strong>strong</strong> and <em>emphasis</em>
            .
          </div>
        </div>

        {/* Headings & Typography - full width */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm p-3">
          <h5 className="font-semibold mb-2 text-foreground">
            Headings & Typography
          </h5>
          <div className="mb-3 text-foreground">
            <h1 className="text-4xl font-bold">h1. Heading</h1>
            <h2 className="text-3xl font-bold">h2. Heading</h2>
            <h3 className="text-2xl font-semibold">h3. Heading</h3>
            <h4 className="text-xl font-semibold">h4. Heading</h4>
            <h5 className="text-lg font-medium">h5. Heading</h5>
            <h6 className="text-base font-medium">h6. Heading</h6>
          </div>

          <h5 className="font-semibold mb-2 text-foreground">Tables</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-foreground border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-semibold">#</th>
                  <th className="px-3 py-2 text-left font-semibold">Name</th>
                  <th className="px-3 py-2 text-left font-semibold">Role</th>
                  <th className="px-3 py-2 text-left font-semibold">Active</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border even:bg-foreground/5 hover:bg-foreground/10">
                  <td className="px-3 py-2">1</td>
                  <td className="px-3 py-2">Sample User</td>
                  <td className="px-3 py-2">Admin</td>
                  <td className="px-3 py-2">Yes</td>
                </tr>
                <tr className="border-b border-border even:bg-foreground/5 hover:bg-foreground/10">
                  <td className="px-3 py-2">2</td>
                  <td className="px-3 py-2">Another</td>
                  <td className="px-3 py-2">Editor</td>
                  <td className="px-3 py-2">No</td>
                </tr>
                <tr className="border-b border-border even:bg-foreground/5 hover:bg-foreground/10">
                  <td className="px-3 py-2">3</td>
                  <td className="px-3 py-2">Visitor</td>
                  <td className="px-3 py-2">Viewer</td>
                  <td className="px-3 py-2">No</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <h6 className="font-medium text-foreground">Input Group</h6>
            <div className="flex mb-2">
              <span className="inline-flex items-center px-3 text-sm border border-r-0 border-border rounded-l bg-foreground/5 text-foreground">
                Search
              </span>
              <input
                placeholder="Search site"
                className="flex-1 border border-border px-3 py-1.5 text-sm bg-transparent text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="px-3 py-1.5 rounded-r bg-gray-500 text-white hover:bg-gray-600 text-sm border border-l-0 border-gray-500">
                Go
              </button>
            </div>

            <h6 className="mt-3 font-medium text-foreground">
              Progress & Spinners
            </h6>
            {/* ProgressBar */}
            <div className="w-full bg-foreground/10 rounded-full h-4 mb-2 overflow-hidden">
              <div
                className="bg-primary-500 h-4 rounded-full transition-all"
                style={{ width: "45%" }}
              />
            </div>
            <div className="flex gap-2 items-center">
              {/* Spinner border */}
              <svg
                className="animate-spin h-4 w-4 text-primary-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {/* Spinner grow */}
              <span className="inline-block h-4 w-4 rounded-full bg-primary-500 animate-pulse" />
              <button
                onClick={() => setShowModal(true)}
                className="px-2 py-1 text-xs rounded border border-primary-500 text-primary-500 hover:bg-primary-500/10"
              >
                Open Modal
              </button>
              <button
                onClick={() => setShowToast(true)}
                className="px-2 py-1 text-xs rounded border border-gray-500 text-gray-500 hover:bg-gray-500/10"
              >
                Show Toast
              </button>
            </div>

            <h6 className="mt-3 font-medium text-foreground">
              List & Pagination
            </h6>
            {/* ListGroup */}
            <ul className="border border-border rounded divide-y divide-border mb-2">
              <li className="px-3 py-2 text-sm text-foreground">
                First item{" "}
                <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-blue-500 text-white ml-2">
                  New
                </span>
              </li>
              <li className="px-3 py-2 text-sm text-foreground">Second item</li>
              <li className="px-3 py-2 text-sm text-foreground">Third item</li>
            </ul>
            {/* Pagination */}
            <nav className="flex gap-1">
              <button className="px-3 py-1 text-sm rounded border border-border text-foreground hover:bg-foreground/10">
                ‹ Prev
              </button>
              <button className="px-3 py-1 text-sm rounded bg-primary-500 text-white">
                1
              </button>
              <button className="px-3 py-1 text-sm rounded border border-border text-foreground hover:bg-foreground/10">
                2
              </button>
              <button className="px-3 py-1 text-sm rounded border border-border text-foreground hover:bg-foreground/10">
                Next ›
              </button>
            </nav>

            <h6 className="mt-3 font-medium text-foreground">Tabs</h6>
            {/* Tabs */}
            <div className="mb-2">
              <div className="flex border-b border-border">
                {(["home", "profile", "contact"] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors",
                      activeTab === key
                        ? "border-primary-500 text-primary-500"
                        : "border-transparent text-foreground/60 hover:text-foreground hover:border-foreground/30",
                    )}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
              <div className="py-3 text-sm text-foreground">
                {activeTab === "home" && "Home content"}
                {activeTab === "profile" && "Profile content"}
                {activeTab === "contact" && "Contact content"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-xl shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-border-dark">
              <h5 className="font-semibold text-foreground">Sample Modal</h5>
              <button
                onClick={() => setShowModal(false)}
                className="text-foreground/60 hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-4 text-sm text-foreground">
              This is a modal to check overlay colors and backdrops.
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border dark:border-border-dark">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 rounded bg-gray-500 text-white hover:bg-gray-600 text-sm"
              >
                Close
              </button>
              <button className="px-3 py-1.5 rounded bg-primary-500 text-white hover:bg-primary-600 text-sm">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-0 right-0 m-3 z-50 min-w-[250px] rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-lg">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border dark:border-border-dark">
            <strong className="text-sm text-foreground">Site</strong>
            <div className="flex items-center gap-2">
              <small className="text-foreground/60">now</small>
              <button
                onClick={() => setShowToast(false)}
                className="text-foreground/60 hover:text-foreground text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
          <div className="px-3 py-2 text-sm text-foreground">
            Test toast body for color/contrast.
          </div>
        </div>
      )}
    </div>
  );
}
