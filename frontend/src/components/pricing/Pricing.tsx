import { Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Navbar from "@/components/hero/Navbar"
import { useState, useEffect} from 'react'

const Pricing = () => {
const [paddleLoaded, setPaddleLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/paddle.js';
    script.async = true;

script.onload = () =>{
      window.Paddle?.Environment.set('sandbox'); // use env
      window.Paddle?.Setup({ 
        vendor: '25496' 
      });
      setPaddleLoaded(true);
    };

    // Handle script loading errors
    script.onerror = () => {
      console.error('Failed to load Paddle script');
    };

    // Append script to the document
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openCheckout = (productId:string) => {
    if (!window.Paddle) {
      console.error('Paddle is not loaded');
      return;
    }

    // Open Paddle checkout
    window.Paddle?.Checkout.open({
      product: Number(productId), 
      email: 'customer@example.com', // Optional: Pre-fill customer email
      successCallback: (data) => {
        console.log('Checkout successful:', data);
        // Handle successful purchase
      },
      closeCallback: () => {
        console.log('Checkout closed');
      }
    });
  };

  return (
    <div>
      <Navbar />
      <div className="container px-4 md:px-6 py-16">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Pricing</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Choose the plan that best fits your needs and budget.
          </p>
        </div>
        <div className="grid gap-6 mt-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Starter Plan */}
          <Card className="p-6 text-left transition-all duration-300 hover:shadow-lg hover:border-primary">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Starter</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold">$9</p>
                <p className="text-muted-foreground text-sm">per month</p>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <Check className="mr-2 inline-block h-4 w-4 text-green-500" />
                  Create and schedule 10 videos per month
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 inline-block h-4 w-4 text-green-500" />
                  Access to video templates
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 inline-block h-4 w-4 text-green-500" />
                  Basic analytics
                </li>
              </ul>
              <Button className="w-full" variant="default"
onClick={() => openCheckout("pro_01jex3hsjtmbhnwfcd6hst482a")}>
                
                Get Started
              </Button>
            </div>
          </Card>

          {/* Professional Plan */}
          <Card className="p-6 text-left border-2 border-primary shadow-md transition-all duration-300 hover:shadow-xl">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Professional</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold">$19</p>
                <p className="text-muted-foreground text-sm">per month</p>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <Check className="mr-2 inline-block h-4 w-4 text-green-500" />
                  Create and schedule 25 videos per month
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 inline-block h-4 w-4 text-green-500" />
                  Access to video templates and voice cloning
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 inline-block h-4 w-4 text-green-500" />
                  Advanced analytics and reporting
                </li>
              </ul>
              <Button className="w-full" variant="default">
                Get Started
              </Button>
            </div>
          </Card>

          {/* Enterprise Plan */}
          <Card className="p-6 text-left transition-all duration-300 hover:shadow-lg hover:border-primary">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Enterprise</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold">$49</p>
                <p className="text-muted-foreground text-sm">per month</p>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <Check className="mr-2 inline-block h-4 w-4 text-green-500" />
                  Create and schedule unlimited videos
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 inline-block h-4 w-4 text-green-500" />
                  Access to all features, including custom templates and integrations
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 inline-block h-4 w-4 text-green-500" />
                  Dedicated account manager and priority support
                </li>
              </ul>
              <Button className="w-full" variant="default">
                Get Started
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Pricing