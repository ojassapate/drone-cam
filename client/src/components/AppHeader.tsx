import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDroneStream } from '@/context/DroneStreamContext';

interface ConnectionStatus {
  isConnected: boolean;
  text: string;
}

interface AppHeaderProps {
  title: string;
  connectionStatus: ConnectionStatus;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  title, 
  connectionStatus 
}) => {
  const { toast } = useToast();
  const { sessionId } = useDroneStream();
  
  const handleSettingsClick = () => {
    toast({
      title: "Session Info",
      description: `Current Session ID: ${sessionId || 'None'}`,
    });
  };
  
  return (
    <header className="bg-slate-800 py-2 px-4 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <h1 className="text-xl font-medium">{title}</h1>
      </div>
      
      <div className="flex items-center">
        <div className="flex items-center mr-4">
          <span 
            className={`w-3 h-3 rounded-full mr-2 ${connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            aria-hidden="true"
          ></span>
          <span className="text-sm">{connectionStatus.text}</span>
        </div>
        
        <Button 
          variant="default"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleSettingsClick}
        >
          <Settings className="h-4 w-4 mr-1" />
          Settings
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;
