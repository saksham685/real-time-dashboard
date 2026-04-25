import { useState, useEffect, useCallback, useRef } from "react";

export interface Process {
  pid: number;
  name: string;
  status: "Running" | "Sleeping" | "Stopped" | "Zombie";
  cpuUsage: number;
  memoryMB: number;
  user: string;
  description: string;
  type: "app" | "background";
  threads: number;
}

export interface StartupApp {
  name: string;
  publisher: string;
  status: "Enabled" | "Disabled";
  impact: "High" | "Medium" | "Low" | "None";
}

export interface AppHistoryEntry {
  name: string;
  cpuTime: number; // seconds accumulated
  networkMB: number;
}

export interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  totalMemory: number;
  usedMemory: number;
  availableMemory: number;
  cachedMemory: number;
  processes: Process[];
  zombieCount: number;
  loadAvg1: number;
  loadAvg5: number;
  loadAvg15: number;
  uptimeDays: number;
  uptimeHours: number;
  uptimeMinutes: number;
  swapUsed: number;
  swapTotal: number;
  cpuCores: number;
  cpuLogicalCores: number;
  cpuModel: string;
  cpuSpeedGHz: number;
  cpuHistory: number[];
  totalThreads: number;
  // Disk
  diskTotal: number; // GB
  diskUsed: number;
  diskUsagePercent: number;
  diskReadSpeed: number; // MB/s
  diskWriteSpeed: number;
  // Network
  networkUpload: number; // KB/s
  networkDownload: number;
  networkUploadHistory: number[];
  networkDownloadHistory: number[];
  // GPU
  gpuUsage: number;
  gpuTemp: number;
  gpuModel: string;
  gpuMemoryUsed: number;
  gpuMemoryTotal: number;
}

const APP_POOL = [
  { name: "Google Chrome", desc: "Web Browser", user: "Aniket" },
  { name: "Visual Studio Code", desc: "Code Editor", user: "Aniket" },
  { name: "Spotify", desc: "Music Player", user: "Aniket" },
  { name: "Slack", desc: "Team Messenger", user: "Aniket" },
  { name: "Discord", desc: "Voice Chat", user: "Aniket" },
  { name: "Windows Terminal", desc: "Terminal Emulator", user: "Aniket" },
  { name: "Docker Desktop", desc: "Container Platform", user: "Aniket" },
  { name: "Microsoft Edge", desc: "Web Browser", user: "Aniket" },
  { name: "WhatsApp", desc: "Messaging App", user: "Aniket" },
  { name: "Notion", desc: "Productivity App", user: "Aniket" },
  { name: "Postman", desc: "API Testing", user: "Aniket" },
  { name: "File Explorer", desc: "File Manager", user: "Aniket" },
];

const BG_POOL = [
  { name: "svchost.exe", desc: "Service Host", user: "SYSTEM" },
  { name: "csrss.exe", desc: "Client Server Runtime", user: "SYSTEM" },
  { name: "lsass.exe", desc: "Local Security Auth", user: "SYSTEM" },
  { name: "dwm.exe", desc: "Desktop Window Manager", user: "SYSTEM" },
  { name: "winlogon.exe", desc: "Windows Logon", user: "SYSTEM" },
  { name: "SearchUI.exe", desc: "Windows Search", user: "SYSTEM" },
  { name: "RuntimeBroker.exe", desc: "Runtime Broker", user: "SYSTEM" },
  { name: "nginx.exe", desc: "Nginx Web Server", user: "NETWORK" },
  { name: "postgres.exe", desc: "PostgreSQL Server", user: "NETWORK" },
  { name: "node.exe", desc: "Node.js Runtime", user: "SYSTEM" },
  { name: "python3.exe", desc: "Python Interpreter", user: "SYSTEM" },
  { name: "OneDrive.exe", desc: "OneDrive Sync", user: "SYSTEM" },
  { name: "WindowsDefender", desc: "Antivirus Service", user: "SYSTEM" },
  { name: "WmiPrvSE.exe", desc: "WMI Provider", user: "SYSTEM" },
  { name: "spoolsv.exe", desc: "Print Spooler", user: "SYSTEM" },
];

const STARTUP_APPS: StartupApp[] = [
  { name: "Microsoft OneDrive", publisher: "Microsoft Corporation", status: "Enabled", impact: "High" },
  { name: "Spotify", publisher: "Spotify AB", status: "Enabled", impact: "Medium" },
  { name: "Discord", publisher: "Discord Inc.", status: "Enabled", impact: "High" },
  { name: "Slack", publisher: "Slack Technologies", status: "Disabled", impact: "Medium" },
  { name: "Steam", publisher: "Valve Corporation", status: "Disabled", impact: "High" },
  { name: "Docker Desktop", publisher: "Docker Inc.", status: "Enabled", impact: "High" },
  { name: "Google Chrome", publisher: "Google LLC", status: "Disabled", impact: "Low" },
  { name: "Windows Security", publisher: "Microsoft Corporation", status: "Enabled", impact: "Low" },
];

const rand = (min: number, max: number) =>
  Math.round((Math.random() * (max - min) + min) * 10) / 10;

let nextPid = 1000;

const generateProcess = (type: "app" | "background"): Process => {
  const pool = type === "app" ? APP_POOL : BG_POOL;
  const template = pool[Math.floor(Math.random() * pool.length)];
  nextPid += Math.floor(Math.random() * 20) + 4;
  return {
    pid: nextPid,
    name: template.name,
    status: Math.random() > 0.2 ? "Running" : "Sleeping",
    cpuUsage: type === "app" ? rand(1, 60) : rand(0, 15),
    memoryMB: type === "app" ? rand(50, 800) : rand(2, 100),
    user: template.user,
    description: template.desc,
    type,
    threads: Math.floor(Math.random() * 30) + 1,
  };
};

const generateProcesses = (): Process[] => {
  const apps = Array.from({ length: 8 }, () => generateProcess("app"));
  const bg = Array.from({ length: 16 }, () => generateProcess("background"));
  return [...apps, ...bg];
};

export function useProcessSimulation(interval = 2000) {
  const [stats, setStats] = useState<SystemStats>(() => ({
    cpuUsage: rand(15, 60),
    memoryUsage: rand(40, 70),
    totalMemory: 16384,
    usedMemory: rand(6000, 12000),
    availableMemory: rand(4000, 10000),
    cachedMemory: rand(2000, 5000),
    processes: generateProcesses(),
    zombieCount: Math.floor(Math.random() * 3),
    loadAvg1: rand(1, 4),
    loadAvg5: rand(1, 3),
    loadAvg15: rand(0.5, 2.5),
    uptimeDays: 3,
    uptimeHours: 14,
    uptimeMinutes: 22,
    swapUsed: rand(800, 2000),
    swapTotal: 8192,
    cpuCores: 8,
    cpuLogicalCores: 16,
    cpuModel: "Intel Core i7-10700K",
    cpuSpeedGHz: rand(3.5, 4.8),
    cpuHistory: Array.from({ length: 60 }, () => rand(20, 70)),
    totalThreads: rand(800, 1500),
    diskTotal: 512,
    diskUsed: rand(180, 400),
    diskUsagePercent: rand(35, 80),
    diskReadSpeed: rand(10, 200),
    diskWriteSpeed: rand(5, 100),
    networkUpload: rand(10, 500),
    networkDownload: rand(50, 2000),
    networkUploadHistory: Array.from({ length: 30 }, () => rand(10, 500)),
    networkDownloadHistory: Array.from({ length: 30 }, () => rand(50, 2000)),
    gpuUsage: rand(5, 60),
    gpuTemp: rand(40, 75),
    gpuModel: "NVIDIA GeForce RTX 3060",
    gpuMemoryUsed: rand(1000, 4000),
    gpuMemoryTotal: 6144,
  }));

  const [paused, setPaused] = useState(false);
  const [sortByCpu, setSortByCpu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startupApps, setStartupApps] = useState<StartupApp[]>(STARTUP_APPS);
  const [appHistory, setAppHistory] = useState<AppHistoryEntry[]>(() =>
    APP_POOL.map((a) => ({ name: a.name, cpuTime: Math.floor(rand(10, 3600)), networkMB: rand(0, 500) }))
  );
  const uptimeRef = useRef(0);

  const refresh = useCallback(() => {
    setStats((prev) => {
      const newCpu = Math.min(100, Math.max(5, prev.cpuUsage + rand(-12, 12)));
      const newMem = Math.min(95, Math.max(25, prev.memoryUsage + rand(-4, 4)));
      const newUsed = Math.round((newMem / 100) * prev.totalMemory);

      const updatedProcesses = prev.processes.map((p) => {
        if (p.status === "Stopped") return p;
        return {
          ...p,
          cpuUsage: Math.min(99, Math.max(0, p.cpuUsage + rand(-8, 8))),
          memoryMB: Math.min(2000, Math.max(2, p.memoryMB + rand(-20, 20))),
          status: (Math.random() > 0.15 ? "Running" : "Sleeping") as Process["status"],
        };
      });

      const newHistory = [...prev.cpuHistory.slice(1), Math.round(newCpu * 10) / 10];

      let { uptimeDays, uptimeHours, uptimeMinutes } = prev;
      uptimeMinutes += 1;
      if (uptimeMinutes >= 60) { uptimeMinutes = 0; uptimeHours += 1; }
      if (uptimeHours >= 24) { uptimeHours = 0; uptimeDays += 1; }

      const newNetUp = Math.max(0, rand(10, 500));
      const newNetDown = Math.max(0, rand(50, 2000));

      return {
        ...prev,
        cpuUsage: Math.round(newCpu * 10) / 10,
        memoryUsage: Math.round(newMem * 10) / 10,
        usedMemory: newUsed,
        availableMemory: prev.totalMemory - newUsed,
        cachedMemory: Math.max(1000, prev.cachedMemory + rand(-200, 200)),
        processes: updatedProcesses,
        zombieCount: Math.random() > 0.7 ? Math.floor(Math.random() * 4) : prev.zombieCount,
        loadAvg1: Math.min(8, Math.max(0.1, prev.loadAvg1 + rand(-0.5, 0.5))),
        loadAvg5: Math.min(6, Math.max(0.1, prev.loadAvg5 + rand(-0.3, 0.3))),
        loadAvg15: Math.min(4, Math.max(0.1, prev.loadAvg15 + rand(-0.2, 0.2))),
        swapUsed: Math.min(prev.swapTotal, Math.max(100, prev.swapUsed + rand(-100, 100))),
        uptimeDays, uptimeHours, uptimeMinutes,
        cpuHistory: newHistory,
        cpuSpeedGHz: Math.min(5.0, Math.max(3.0, prev.cpuSpeedGHz + rand(-0.2, 0.2))),
        totalThreads: Math.max(600, Math.round(prev.totalThreads + rand(-20, 20))),
        diskReadSpeed: Math.max(0, rand(5, 250)),
        diskWriteSpeed: Math.max(0, rand(2, 120)),
        networkUpload: newNetUp,
        networkDownload: newNetDown,
        networkUploadHistory: [...prev.networkUploadHistory.slice(1), newNetUp],
        networkDownloadHistory: [...prev.networkDownloadHistory.slice(1), newNetDown],
        gpuUsage: Math.min(100, Math.max(0, prev.gpuUsage + rand(-8, 8))),
        gpuTemp: Math.min(90, Math.max(35, prev.gpuTemp + rand(-3, 3))),
        gpuMemoryUsed: Math.min(prev.gpuMemoryTotal, Math.max(500, prev.gpuMemoryUsed + rand(-200, 200))),
      };
    });

    // Update app history
    setAppHistory((prev) =>
      prev.map((a) => ({
        ...a,
        cpuTime: a.cpuTime + Math.floor(rand(0, 5)),
        networkMB: Math.round((a.networkMB + rand(0, 2)) * 10) / 10,
      }))
    );
  }, []);

  const killProcess = useCallback((pid: number) => {
    setStats((prev) => ({
      ...prev,
      processes: prev.processes.map((p) =>
        p.pid === pid ? { ...p, status: "Stopped" as const, cpuUsage: 0 } : p
      ),
    }));
    setTimeout(() => {
      setStats((prev) => ({
        ...prev,
        processes: prev.processes.filter((p) => p.pid !== pid),
      }));
    }, 400);
  }, []);

  const restartProcess = useCallback((pid: number) => {
    setStats((prev) => ({
      ...prev,
      processes: prev.processes.map((p) =>
        p.pid === pid ? { ...p, status: "Running" as const, cpuUsage: rand(1, 30) } : p
      ),
    }));
  }, []);

  const addProcess = useCallback((name?: string) => {
    const proc = generateProcess("app");
    if (name) {
      proc.name = name;
      proc.description = name;
    }
    setStats((prev) => ({
      ...prev,
      processes: [proc, ...prev.processes],
    }));
  }, []);

  const toggleStartupApp = useCallback((appName: string) => {
    setStartupApps((prev) =>
      prev.map((a) =>
        a.name === appName
          ? { ...a, status: a.status === "Enabled" ? "Disabled" : "Enabled" }
          : a
      )
    );
  }, []);

  const toggleSort = useCallback(() => setSortByCpu((prev) => !prev), []);
  const togglePause = useCallback(() => setPaused((prev) => !prev), []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      uptimeRef.current += 1;
      refresh();
    }, interval);
    return () => clearInterval(timer);
  }, [refresh, interval, paused]);

  let filteredProcesses = searchQuery
    ? stats.processes.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.pid.toString().includes(searchQuery) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stats.processes;

  if (sortByCpu) {
    filteredProcesses = [...filteredProcesses].sort((a, b) => b.cpuUsage - a.cpuUsage);
  }

  return {
    stats: { ...stats, processes: filteredProcesses },
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
  };
}
