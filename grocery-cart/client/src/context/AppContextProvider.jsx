import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./AppContext";

// provide global data to the entire app
const AppContextProvider = ({ children }) => {
  
  // instead of local, these react states will be global
  const navigate = useNavigate();   // useNavigate lets any component navigate without props
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false) // export it using the below "value" object

  // putting things on the notice board: Only things inside "value" are globally accessible.
  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin  // now we can access it anywhere (for instance, Navbar)
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
