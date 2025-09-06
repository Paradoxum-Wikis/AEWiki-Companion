import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/main.css";
import "./styles/theme.css";
import "./styles/discord.css";
import { ThemeManager } from "./components/themeManager.js";
import "./components/discord";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");
  ThemeManager.init();
});
