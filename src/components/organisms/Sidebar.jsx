import { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";
import { AuthContext } from "../../App";
const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  
const { logout } = useContext(AuthContext);
  
  const navigationItems = [
    { name: "Contacts", href: "/contacts", icon: "Users" },
    { name: "Deals", href: "/deals", icon: "Target" },
    { name: "Companies", href: "/companies", icon: "Building2" },
    { name: "Activities", href: "/activities", icon: "Activity" },
    { name: "Analytics", href: "/analytics", icon: "BarChart3" }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (href) => {
    return location.pathname === href || (href === "/contacts" && location.pathname === "/");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-slate-200 pt-5 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <ApperIcon name="Zap" className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Nexus CRM
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 pb-4 space-y-1">
{navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive: routerIsActive }) => cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                  isActive(item.href) || routerIsActive
                    ? "nav-active text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <ApperIcon 
                  name={item.icon} 
                  className="mr-3 h-5 w-5 flex-shrink-0" 
                />
                {item.name}
              </NavLink>
            ))}
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-slate-600 hover:bg-red-50 hover:text-red-700 mt-4"
            >
              <ApperIcon 
                name="LogOut" 
                className="mr-3 h-5 w-5 flex-shrink-0" 
              />
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className={cn(
        "fixed inset-0 z-40 lg:hidden",
        isOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={onToggle} />
        
        <div className={cn(
          "relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onToggle}
            >
              <ApperIcon name="X" className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            {/* Mobile Logo */}
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                  <ApperIcon name="Zap" className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Nexus CRM
                </span>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="px-2 space-y-1">
{navigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onToggle}
                  className={({ isActive: routerIsActive }) => cn(
                    "group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors duration-200",
                    isActive(item.href) || routerIsActive
                      ? "nav-active text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <ApperIcon 
                    name={item.icon} 
                    className="mr-4 h-6 w-6 flex-shrink-0" 
                  />
                  {item.name}
                </NavLink>
              ))}
              
              {/* Mobile Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  onToggle();
                }}
                className="group flex items-center w-full px-2 py-2 text-base font-medium rounded-md transition-colors duration-200 text-slate-600 hover:bg-red-50 hover:text-red-700 mt-4"
              >
                <ApperIcon 
                  name="LogOut" 
                  className="mr-4 h-6 w-6 flex-shrink-0" 
                />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;