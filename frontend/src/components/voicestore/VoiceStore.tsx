import { useState, useEffect } from 'react';
import { Play, ShoppingCart, VideoIcon, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import DashNavbar from "@/components/hero/DashNavbar";
import Sidebar from "@/components/hero/Sidebar";
import { Link } from "react-router-dom";
import { useToast } from '@/components/customs/toast';
import { getCookie } from '@/lib/funcs';
import { planTiers } from '@/lib/constants';
import LoadingSpinner from "@/components/customs/LoadingSpinner";


export default function VoiceStore() {
  const [filter, setFilter] = useState("All");
  const { showToast, ToastContainer } = useToast();
  const [voiceModels, setVoiceModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false)

  const plan = getCookie('plan'); // User's plan fetched from cookies

  const filteredModels = voiceModels.filter(model =>
    filter === "All" || model.plan === filter
  );

  const handlePreview = (audioLink: string, id: string) => {
    // Implement preview functionality here
    console.log(`Previewing ${audioLink} ${id}`);
    
    setIsAudioLoading(true)
    const audio = new Audio(audioLink);
    
    audio.oncanplaythrough = () => {
    setIsAudioLoading(false);
    audio.play();
  };

  audio.onerror = () => {
    setIsAudioLoading(false);
    showToast("Something went wrong while loading voice preview", 'error');
  };
  };

  const handleBuy = (modelName: string, price: number) => {
    // Implement purchase functionality here
    console.log(`Buying ${modelName} for $${price}`);
  };

  useEffect(() => {
    const fetchVoiceModels = async () => {
      setLoading(true); // Set loading true to indicate data fetching

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/voice-models/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',

            },
          credentials: "include",
        });
        console.log('Fetching voice models...');


        const { data: resData, error } = await response.json();
        console.log(resData, error)
        

        if (resData) {
          console.log(resData)
          setVoiceModels(resData);
          setLoading(false)
        } else {
          showToast(error.message, 'error');
        }
      } catch (err) {
        console.error("Error fetching voice models:", err);
        showToast("Error loading voice store models. Please refresh", 'error');
      } finally {
        setLoading(false); // Set loading false once fetching is done
      }
    };



    fetchVoiceModels();
  }, []); 

  return (
    <div className="flex min-h-screen w-full bg-background">
      <ToastContainer />
      <aside className="flex h-full w-14 flex-col border-r sm:w-60">
        <div className="flex h-14 items-center justify-center border-b px-4 sm:justify-start">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <VideoIcon className="h-6 w-6" />
            <span className="hidden sm:inline">Video Creator</span>
          </Link>
        </div>
        <Sidebar />
      </aside>
      <div className="flex flex-1 flex-col">
        <DashNavbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Voice Model Store</h1>
          {loading ? <LoadingSpinner /> : (
            <>
              <div className="mb-8 flex justify-end">
                <Select onValueChange={setFilter} defaultValue="All">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premuim">Premuim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredModels.map(model => (
                  <Card key={model.id} className="flex flex-col border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="p-4">
                      <CardTitle className="flex justify-between items-center">
                        <span className="text-lg font-semibold">{model.name}</span>
                        <Badge 
                          variant={model.plan === "Standard" ? "secondary" : "default"} 
                          className="text-sm px-3 py-1"
                        >
                          {model.plan}
                        </Badge>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="px-4 py-2 flex flex-col justify-between">
                      {/* If you want to include a visual element for the voice model */}
                      {/* <div className="h-32 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                        <span className="text-gray-500">Voice Model Visual</span>
                      </div> */}
                      
                      <div className="mb-4">
                        {model.plan.toLowerCase() === plan ? (
                          <Badge 
                            variant="outline" 
                            className="text-sm font-semibold text-green-600 bg-green-50 border-green-600"
                          >
                            Included in your plan
                          </Badge>
                        ) : (
                          <Badge 
                            variant="outline" 
                            className="text-sm font-semibold text-red-600 bg-red-50 border-red-600"
                          >
                            Not in your plan
                          </Badge>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 flex space-x-3 justify-between items-center">
                      <Button 
                        variant="outline" 
                        className="flex items-center px-3 py-2 text-sm" 
                        onClick={() => handlePreview(model.preview_url, model.voice_id)}
                      >
                        {isAudioLoading ? (<Loader2 className="animate-spin w-4 h-4 mr-2" />) : (<Play className="w-4 h-4 mr-2" />)}
                        Preview
                      </Button>

                      
                        {plan.toLowerCase() === 'free' ? (
                          <span className="text-sm font-medium text-blue-600">Upgrade to a higher plan</span>
                        ) : (
                          <Button 
                            className="flex items-center bg-blue-600 text-white px-3 py-2 text-sm"
                            onClick={() => handleBuy(model.name, model.price)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy $ {model.price}
                          </Button>
                        )}
                    </CardFooter>
                  </Card>

                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
