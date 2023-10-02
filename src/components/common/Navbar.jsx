import React from "react";
import Logo from "../../assets/Logo/Logo-Full-Light.png";
import { Link, matchPath } from "react-router-dom";
import { NavbarLinks } from "../../data/navbar-links";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai";
import { AiOutlineDown } from "react-icons/ai";
import ProfileDropDown from "../core/Auth/ProfileDropDown";
import { useState } from "react";
import { useEffect } from "react";
import { apiConnector } from "../../services/apiconnector";
import { categories } from "../../services/api";

const subLinks = [
  {
    title: "Python",
    link: "/catalog/python",
  },
  {
    title: "Web Development",
    link: "/catalog/web-development",
  },
];
const Navbar = () => {
  const { token } = useSelector((state) => state.auth);

  const { user } = useSelector((state) => state.profile);

  const { totalItems } = useSelector((state) => state.cart);

  const location = useLocation();

  //   const [subLinks, setSubLinks] = useState([]);

  //   const fetchSublinks = async () => {
  //     try {
  //       const result = await apiConnector("GET", categories.CATEGORIES_API);
  //       console.log("categories data", result.data.data);
  //       setSubLinks(result.data.data);
  //     } catch (error) {
  //       console.log("Could not fetch Categories.", error);
  //     }
  //   };

  //   useEffect(() => {
  //     fetchSublinks();
  //   }, []);
  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  return (
    <div className="flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700">
      <div className="w-11/12 flex max-w-maxContent items-center justify-between">
        {/* logo added */}

        <Link to="/">
          <img src={Logo} alt="logo" width={160} height={32} />
        </Link>

        {/* NAV links */}

        <nav>
          <ul className="flex gap-x-6 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <div className="relative flex gap-1 items-center group">
                    <p>{link.title} </p>
                    <AiOutlineDown />

                    <div className="invisible absolute left-[50%] 
                     translate-x-[-50%]
                     translate-y-[35%]
                    top-[50%] flex flex-col rounded-md bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-200 group-hover:visible
                    group-hover:opacity-100 w-[250px]">
                    
                    <div className="absolute left-[50%] top-0 h-6 w-6
                    translate-y-[-50%]  translate-x-[80%] rotate-45  bg-richblack-5 rounded-sm"> 
                    </div>
                    {subLinks.length ? (
                        subLinks.map((subLink, index) => (
                          <Link to={`${subLink.link}`} key={index}>
                            <p >{subLink.title}</p>
                          </Link>
                        ))
                      ) : (
                        <div></div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div>
                    <Link to={link?.path}>
                      <p
                        className={`${
                          matchRoute(link?.path)
                            ? "text-yellow-25"
                            : "text-richblack-25"
                        }`}
                      >
                        {link?.title}
                      </p>
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Login signup buttons */}

        <div className="flex gap-x-4 items-center">
          {user && user?.accountType != "Instructor" && (
            <Link to={"/dashboard/cart"} className="relative">
              <AiOutlineShoppingCart />
              {totalItems > 0 && <span>{totalItems}</span>}
            </Link>
          )}

          {token === null && (
            <Link to={"/signup"}>
              <button className="border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md">
                Sign Up
              </button>
            </Link>
          )}
          {token === null && (
            <Link to={"/login"}>
              <button className="border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md">
                Log in
              </button>
            </Link>
          )}

          {token !== null && <ProfileDropDown />}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
