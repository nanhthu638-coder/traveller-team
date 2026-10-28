import "./style.css";
import { initAuth } from "./features/auth.js";
import { initContact } from "./features/contact.js";
import { initFeaturedTours } from "./features/featured-tours.js";
import { initNavigation } from "./features/navigation.js";
import { initTours } from "./features/tours.js";

initAuth();
initContact();
initFeaturedTours();
initTours();
initNavigation();