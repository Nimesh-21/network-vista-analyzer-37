import { LayoutDashboard, NetworkIcon, Layers, CpuIcon, ScrollText, HardDrive, BrainCircuit, Terminal, Menu, X, Database, Upload, AlertCircle, BarChart, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, toggleSidebar }: SidebarProps) {
  const isMobile = useIsMobile();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'alerts', label: 'Alerts', icon: <AlertCircle className="h-5 w-5" /> },
    { id: 'traffic-analysis', label: 'Traffic Analysis', icon: <BarChart className="h-5 w-5" /> },
    { id: 'interfaces', label: 'Network Interfaces', icon: <NetworkIcon className="h-5 w-5" /> },
    { id: 'connections', label: 'Connections', icon: <Layers className="h-5 w-5" /> },
    { id: 'processes', label: 'Processes', icon: <CpuIcon className="h-5 w-5" /> },
    // { id: 'logs', label: 'Device Logs', icon: <ScrollText className="h-5 w-5" /> },
    { id: 'devices', label: 'All Devices', icon: <HardDrive className="h-5 w-5" /> },
    // { id: 'jsonl-input', label: 'Submit JSONL Data', icon: <Upload className="h-5 w-5" /> },
    { id: 'statistics', label: 'Netflow Statistics', icon: <Database className="h-5 w-5" /> },
    { id: 'system', label: 'Device Details', icon: <BrainCircuit className="h-5 w-5" /> },
    { id: 'terminal', label: 'Device Dashboard', icon: <Terminal className="h-5 w-5" /> }
  ];
  
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobile) {
      toggleSidebar();
    }
    window.location.hash = tabId;
  };

  return (
    <>
      {/* Toggle button when closed (desktop & mobile) */}
      {!isOpen && (
        <button
          className="fixed top-4 left-4 z-30"
          onClick={toggleSidebar}
        >
          <ChevronRight className="h-6 w-6 text-muted-foreground" />
        </button>
      )}

      {/* Sidebar container */}
      <div className={cn(
        "fixed inset-y-0 left-0 bg-card border-r border-border/40 pt-16 z-10 transition-all duration-300 overflow-hidden",
        isOpen ? "w-60 translate-x-0" : "-translate-x-full w-0"
      )}>
        <div className="flex justify-between items-center px-3 py-2">
          {/* Collapse control */}
          <ChevronLeft
            className="h-5 w-5 cursor-pointer"
            onClick={toggleSidebar}
          />

          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="text-muted-foreground p-2 rounded-md hover:bg-muted/40"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="px-3 py-2 overflow-y-auto h-full">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  "flex items-center space-x-3 w-full px-3 py-2.5 rounded-md transition-colors",
                  activeTab === item.id
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
