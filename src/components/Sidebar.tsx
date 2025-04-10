
import { useState } from 'react';
import { 
  BarChart, 
  Layout, 
  Network, 
  Server, 
  Terminal, 
  Cpu, 
  Globe, 
  Activity, 
  FileText, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, toggleSidebar }: SidebarProps) {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Layout className="h-5 w-5" /> },
    { id: 'interfaces', label: 'Interfaces', icon: <Network className="h-5 w-5" /> },
    { id: 'connections', label: 'Connections', icon: <Globe className="h-5 w-5" /> },
    { id: 'processes', label: 'Processes', icon: <Cpu className="h-5 w-5" /> },
    { id: 'statistics', label: 'Statistics', icon: <BarChart className="h-5 w-5" /> },
    { id: 'system', label: 'System', icon: <Server className="h-5 w-5" /> },
    { id: 'logs', label: 'Logs', icon: <FileText className="h-5 w-5" /> },
    { id: 'terminal', label: 'Terminal', icon: <Terminal className="h-5 w-5" /> },
  ];

  return (
    <div className={`h-[calc(100vh-4rem)] overflow-y-auto bg-sidebar fixed left-0 top-16 z-20 shadow-lg transform transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="flex flex-col h-full p-3 w-60">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-sidebar-primary" />
            <h2 className="text-sm font-semibold">Network Monitor</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="hidden md:flex"
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <nav className="space-y-1 mt-6">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md transition-colors
                ${activeTab === item.id 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
