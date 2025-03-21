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
    <header className="bg-dark-medium py-2 px-4 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <span className="mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </span>
        <h1 className="text-xl font-medium">{title}</h1>
      </div>
      
      <div className="flex items-center">
        <div className="flex items-center mr-4">
          <span 
            className={`w-3 h-3 rounded-full mr-2 ${connectionStatus.isConnected ? 'bg-accent' : 'bg-danger'}`}
            aria-hidden="true"
          ></span>
          <span className="text-sm">{connectionStatus.text}</span>
        </div>
        
        <Button 
          variant="default"
          size="sm"
          className="bg-primary hover:bg-primary/90 text-white"
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
