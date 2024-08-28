import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { 
  Bolt, 
  Video, 
  Mic, 
  Calendar, 
  Folder, 
  LayoutTemplate, 
  Plug, 
  Rocket,
  Check
} from "lucide-react"
import Navbar from "@/components/hero/Navbar"

export default function Landing() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE]">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center text-white">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Automate Your Tweet-to-Video Workflow
            </h1>
            <p className="max-w-[700px] text-lg mt-4">
              TweetFlow is the ultimate solution for creating, scheduling, and posting video content across multiple
              platforms.
            </p>
            <Link to="/signup" className="mt-8 px-8 py-3 rounded-full text-lg font-medium">Get Started</Link>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Streamline Your Content Creation</h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  TweetFlow offers a suite of powerful features to help you create, schedule, and post video content
                  with ease.
                </p>
              </div>
              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-[#6C5CE7] p-2 text-white">
                    <Video className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Create Video</h3>
                    <p className="text-muted-foreground">
                      Convert your tweets into engaging videos with our text-to-speech and video editing tools.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-[#6C5CE7] p-2 text-white">
                    <Mic className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Voice Clone</h3>
                    <p className="text-muted-foreground">
                      Customize your video narration with our AI-powered voice cloning technology.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-[#6C5CE7] p-2 text-white">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Scheduled Videos</h3>
                    <p className="text-muted-foreground">
                      Schedule your videos to post at the optimal time for maximum engagement.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-[#6C5CE7] p-2 text-white">
                    <Folder className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Video Library</h3>
                    <p className="text-muted-foreground">
                      Manage and organize your video content in a centralized library.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-[#6C5CE7] p-2 text-white">
                    <LayoutTemplate className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Templates</h3>
                    <p className="text-muted-foreground">
                      Use our pre-designed templates to create professional-looking videos in minutes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-[#6C5CE7] p-2 text-white">
                    <Plug className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Integration</h3>
                    <p className="text-muted-foreground">
                      Seamlessly integrate TweetFlow with your favorite social media platforms.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-[#6C5CE7] p-2 text-white">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Auto Pilot</h3>
                    <p className="text-muted-foreground">
                      Let TweetFlow handle the entire content creation and posting process for you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6 text-center">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">What Our Customers Say</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Hear from the people who have transformed their social media presence with TweetFlow.
              </p>
            </div>
            <div className="grid gap-6 mt-8 sm:grid-cols-2 md:grid-cols-3">
              <Card className="p-6 text-left">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder-user.jpg" alt="@username" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-lg font-bold">John Doe</h4>
                    <p className="text-muted-foreground text-sm">Social Media Manager</p>
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground">
                  "TweetFlow has been a game-changer for our social media\n strategy. The automation features have saved
                  us so much time\n and effort."
                </p>
              </Card>
              <Card className="p-6 text-left">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder-user.jpg" alt="@username" />
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-lg font-bold">Sarah Anderson</h4>
                    <p className="text-muted-foreground text-sm">Content Creator</p>
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground">
                  "I love how TweetFlow makes it easy to create and schedule\n high-quality video content. It's a
                  must-have tool for any\n content creator."
                </p>
              </Card>
              <Card className="p-6 text-left">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder-user.jpg" alt="@username" />
                    <AvatarFallback>MR</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-lg font-bold">Michael Ramirez</h4>
                    <p className="text-muted-foreground text-sm">Marketing Manager</p>
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground">
                  "TweetFlow has helped us streamline our social media\n workflow and increase our engagement across all
                  platforms.\n Highly recommended!"
                </p>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Pricing</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Choose the plan that best fits your needs and budget.
              </p>
            </div>
            <div className="grid gap-6 mt-8 sm:grid-cols-2 md:grid-cols-3">
              <Card className="p-6 text-left">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Starter</h3>
                  <p className="text-4xl font-bold">$9</p>
                  <p className="text-muted-foreground">per month</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Create and schedule 10 videos per month
                    </li>
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Access to video templates
                    </li>
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Basic analytics
                    </li>
                  </ul>
                  <Button className="w-full">Get Started</Button>
                </div>
              </Card>
              <Card className="p-6 text-left">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Professional</h3>
                  <p className="text-4xl font-bold">$19</p>
                  <p className="text-muted-foreground">per month</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Create and schedule 25 videos per month
                    </li>
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Access to video templates and voice cloning
                    </li>
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Advanced analytics and reporting
                    </li>
                  </ul>
                  <Button className="w-full">Get Started</Button>
                </div>
              </Card>
              <Card className="p-6 text-left">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Enterprise</h3>
                  <p className="text-4xl font-bold">$49</p>
                  <p className="text-muted-foreground">per month</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Create and schedule unlimited videos
                    </li>
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Access to all features, including custom templates and integrations
                    </li>
                    <li>
                      <Check className="mr-2 inline-block h-4 w-4" />
                      Dedicated account manager and priority support
                    </li>
                  </ul>
                  <Button className="w-full">Get Started</Button>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 TweetFlow. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link to="/terms" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link to="/privacy" className="text-xs hover:underline underline-offset-4">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
