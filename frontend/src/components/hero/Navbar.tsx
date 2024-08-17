import { Link } from "react-router-dom"
import { Bolt } from "lucide-react"

const Navbar = () => {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center">
      <Link to="/" className="flex items-center justify-center">
        <Bolt className="h-6 w-6" />
        <span className="font-bold text-xl">TweetFlow</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link to="/features" className="text-sm font-medium hover:underline underline-offset-4">
          Features
        </Link>
        <Link to="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
          Pricing
        </Link>
        <Link to="/about" className="text-sm font-medium hover:underline underline-offset-4">
          About
        </Link>
        <Link to="/contact" className="text-sm font-medium hover:underline underline-offset-4">
          Contact
        </Link>
      </nav>
    </header>
  )
}

export default Navbar
