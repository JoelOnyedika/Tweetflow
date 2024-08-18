import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const IntegrationCard = ({ integration }:any) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <img src={integration.icon} alt={integration.name} className="w-6 h-6" />
          <CardTitle className="text-sm font-medium">{integration.name}</CardTitle>
        </div>
        <Badge variant={integration.connected ? "default" : "secondary"}>
          {integration.connected ? "Connected" : "Not Connected"}
        </Badge>
      </CardHeader>
      <CardContent>
        <CardDescription className="mt-2">{integration.description}</CardDescription>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Switch id={`${integration.name}-auto-upload`} checked={integration.autoUpload} disabled={!integration.connected} />
            <label htmlFor={`${integration.name}-auto-upload`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Auto Upload
            </label>
          </div>
          <Button variant={integration.connected ? "destructive" : "default"} size="sm">
            {integration.connected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationCard