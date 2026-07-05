import { Globe, Mail } from "lucide-react";
import {
  SiFacebook,
  SiX,
  SiYoutube,
  SiGithub,
} from "@icons-pack/react-simple-icons";
import { FaLinkedin } from "react-icons/fa6";

export function SiteFooter() {
  return (
    <footer className="w-full py-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} Yossof0. All rights reserved.</p>
      <div className="flex items-center gap-4">
        <a
          href="https://yossof0.github.io"
          target="_blank"
          rel="noreferrer"
          title="Website"
        >
          <Globe className="w-5 h-5 hover:text-foreground transition-colors" />
        </a>
        <a
          href="https://www.facebook.com/YossofABD"
          target="_blank"
          rel="noreferrer"
          title="Facebook"
        >
          <SiFacebook className="w-5 h-5 hover:text-foreground transition-colors" />
        </a>
        <a
          href="https://x.com/OverClock33"
          target="_blank"
          rel="noreferrer"
          title="X (Twitter)"
        >
          <SiX className="w-5 h-5 hover:text-foreground transition-colors" />
        </a>
        <a
          href="https://www.youtube.com/@overclock33"
          target="_blank"
          rel="noreferrer"
          title="YouTube"
        >
          <SiYoutube className="w-5 h-5 hover:text-foreground transition-colors" />
        </a>
        <a
          href="https://www.linkedin.com/in/yossof-abdelwahed-20b2b1408"
          target="_blank"
          rel="noreferrer"
          title="LinkedIn"
        >
          <FaLinkedin className="w-5 h-5 hover:text-foreground transition-colors" />
        </a>
        <a
          href="https://github.com/Yossof0"
          target="_blank"
          rel="noreferrer"
          title="GitHub"
        >
          <SiGithub className="w-5 h-5 hover:text-foreground transition-colors" />
        </a>
        <a href="mailto:yossef2989@gmail.com" title="Email">
          <Mail className="w-5 h-5 hover:text-foreground transition-colors" />
        </a>
      </div>
    </footer>
  );
}
