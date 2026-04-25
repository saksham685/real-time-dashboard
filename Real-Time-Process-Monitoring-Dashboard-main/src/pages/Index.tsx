import { useState, useEffect, useCallback } from "react";
import { useProcessSimulation } from "@/hooks/useProcessSimulation";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import MetricCards from "@/components/MetricCards";
import WarningBanner from "@/components/WarningBanner";
import ProcessTable from "@/components/ProcessTable";
import CpuTrendChart from "@/components/CpuTrendChart";
import DashboardFooter from "@/components/DashboardFooter";
import TopProcessesPanel from "@/components/TopProcessesPanel";
import PerformanceDetail from "@/components/PerformanceDetail";
import AppHistorySection from "@/components/AppHistorySection";
import StartupAppsSection from "@/components/StartupAppsSection";
import DetailsTable from "@/components/DetailsTable";
import ShortcutsModal from "@/components/ShortcutsModal";

const Index = () => {
  const {
    stats,
    refresh,
    killProcess,
    restartProcess,
    addProcess,
    toggleSort,
    sortByCpu,
    paused,
    togglePause,
    searchQuery,
    setSearchQuery,
    startupApps,
    toggleStartupApp,
    appHistory,
  } = useProcessSimulation(2000);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const showWarning = stats.cpuUsage > 80;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "f") {
      e.preventDefault();
      document.getElementById("process-search-input")?.focus();
    }
    if (e.ctrlKey && e.altKey && (e.key === "n" || e.key === "N")) {
      e.preventDefault();
      setNewTaskOpen(true);
    }
    if (e.key === "F5") {
      e.preventDefault();
      refresh();
    }
    if (e.key === "Delete" && selectedPid != null) {
      killProcess(selectedPid);
      setSelectedPid(null);
    }
    if (e.key === "Escape") {
      setSelectedPid(null);
    }
    if (e.ctrlKey && e.key === "d") {
      e.preventDefault();
      setActiveTab("dashboard");
    }
    if (e.ctrlKey && e.key === "p") {
      e.preventDefault();
      setActiveTab("processes");
    }
    if (e.ctrlKey && e.shiftKey && (e.key === "S" || e.key === "s")) {
      e.preventDefault();
      setSidebarCollapsed((prev) => !prev);
    }
    if (e.ctrlKey && e.key === "/") {
      e.preventDefault();
      setShortcutsOpen((prev) => !prev);
    }
  }, [selectedPid, killProcess, refresh]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <DashboardHeader
        processCount={stats.processes.length}
        paused={paused}
        onTogglePause={togglePause}
        onRefresh={refresh}
        onAddProcess={addProcess}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        newTaskOpen={newTaskOpen}
        onNewTaskOpenChange={setNewTaskOpen}
        shortcutsButton={<ShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />

        <main className="flex-1 overflow-auto p-3 sm:p-5 flex flex-col gap-4">
          {activeTab === "dashboard" && (
            <>
              <WarningBanner visible={showWarning} />
              <MetricCards stats={stats} />
              <CpuTrendChart history={stats.cpuHistory} currentCpu={stats.cpuUsage} />
              <TopProcessesPanel processes={stats.processes} />
            </>
          )}

          {activeTab === "processes" && (
            <ProcessTable
              processes={stats.processes}
              onKill={killProcess}
              onRestart={restartProcess}
              onToggleSort={toggleSort}
              sortByCpu={sortByCpu}
              selectedPid={selectedPid}
              onSelectPid={setSelectedPid}
            />
          )}

          {activeTab === "performance" && (
            <div className="flex flex-col gap-4 flex-1">
              <h2 className="text-lg font-bold text-foreground">Performance</h2>
              <PerformanceDetail stats={stats} />
            </div>
          )}

          {activeTab === "users" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-foreground">Users</h2>
              <div className="glass-card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="text-left px-5 py-3 font-medium text-xs">User</th>
                      <th className="text-left px-5 py-3 font-medium text-xs">Status</th>
                      <th className="text-left px-5 py-3 font-medium text-xs">Processes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["Aniket", "SYSTEM", "NETWORK"].map((user) => {
                      const count = stats.processes.filter((p) => p.user === user).length;
                      return (
                        <tr key={user} className="border-b border-border/20 hover:bg-muted/30">
                          <td className="px-5 py-3 font-medium text-sm">{user === "Aniket" ? "Aniket Singh" : user}</td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-success/15 text-success">
                              <span className="h-1.5 w-1.5 rounded-full bg-success" />
                              Active
                            </span>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{count}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-foreground">Services</h2>
              <div className="glass-card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="text-left px-5 py-3 font-medium text-xs">Name</th>
                      <th className="text-left px-5 py-3 font-medium text-xs">PID</th>
                      <th className="text-left px-5 py-3 font-medium text-xs">Description</th>
                      <th className="text-left px-5 py-3 font-medium text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.processes
                      .filter((p) => p.user === "SYSTEM" || p.user === "NETWORK")
                      .map((proc) => (
                        <tr key={proc.pid} className="border-b border-border/20 hover:bg-muted/30">
                          <td className="px-5 py-2.5 font-medium text-xs">{proc.name}</td>
                          <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{proc.pid}</td>
                          <td className="px-5 py-2.5 text-xs text-muted-foreground">{proc.description}</td>
                          <td className="px-5 py-2.5">
                            <span className={`text-xs font-medium ${proc.status === "Running" ? "text-success" : proc.status === "Stopped" ? "text-destructive" : "text-muted-foreground"}`}>
                              {proc.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="flex flex-col gap-4 flex-1">
              <h2 className="text-lg font-bold text-foreground">Details</h2>
              <DetailsTable processes={stats.processes} />
            </div>
          )}

          {activeTab === "app-history" && (
            <AppHistorySection history={appHistory} />
          )}

          {activeTab === "startup" && (
            <StartupAppsSection apps={startupApps} onToggle={toggleStartupApp} />
          )}
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
};

export default Index;
