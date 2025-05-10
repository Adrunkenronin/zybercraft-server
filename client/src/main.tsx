import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Helmet } from "react-helmet";

// Add the Minecraft-style fonts and styles
createRoot(document.getElementById("root")!).render(
  <>
    <Helmet>
      <style>
        {`
          .minecraft-btn {
            image-rendering: pixelated;
            border: 2px solid #000;
            box-shadow: inset -2px -4px #0006, inset 2px 2px #FFF7;
          }
          .minecraft-btn:active {
            box-shadow: inset -2px -4px #0006;
          }
          .pixelated {
            image-rendering: pixelated;
          }
          
          :root {
            --primary: 93 122 72; /* Minecraft green */
            --primary-foreground: 255 255 255;
          }
        `}
      </style>
    </Helmet>
    <App />
  </>
);
