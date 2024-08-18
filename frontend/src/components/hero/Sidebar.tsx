import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { sidebarLinks } from "@/lib/constants"; 


const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const NavLinks = () => (
    <nav className="flex flex-1 flex-col items-start gap-2 overflow-auto px-4 py-6 sm:gap-4">
      {sidebarLinks.map((link, index) => (
        <Link
          key={index}
          to={`/77${link.href}`}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={() => setIsOpen(false)}
        >
          <link.icon className="h-5 w-5" />
          <span className="sm:inline">{link.label}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden sm:block">
        <NavLinks />
      </div>

      {/* Mobile Sidebar */}
      <div className="sm:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <NavLinks />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default Sidebar;