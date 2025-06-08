import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/main.css";
import "../styles/theme.css";
import { ThemeManager } from "./themeManager.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");
  ThemeManager.init();
});
