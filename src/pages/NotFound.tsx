
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center space-y-6 p-4">
      <div className="bg-muted/30 p-6 rounded-full">
        <AlertCircle className="h-16 w-16 text-netblue-400" />
      </div>
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      
      <Button asChild>
        <Link to="/">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
