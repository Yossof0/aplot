import { Globe, Mail } from "lucide-react";
import { SiFacebook, SiX, SiYoutube, SiGithub } from "@icons-pack/react-simple-icons";
import { FaLinkedin } from "react-icons/fa6";

const LINKS = [
  { href: "https://yossof0.github.io", label: "Website", Icon: Globe },
  { href: "https://www.facebook.com/YossofABD", label: "Facebook", Icon: SiFacebook },
  { href: "https://x.com/OverClock33", label: "X (Twitter)", Icon: SiX },
  { href: "https://www.youtube.com/@overclock33", label: "YouTube", Icon: SiYoutube },
  { href: "https://www.linkedin.com/in/yossof-abdelwahed-20b2b1408", label: "LinkedIn", Icon: FaLinkedin },
  { href: "https://github.com/Yossof0", label: "GitHub", Icon: SiGithub },
];

export function SiteFooter() {
  return (
    <footer className="w-full py-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
      <p>© {new Date().getFullYear()} Yossof0. All rights reserved.</p>
      <div className="flex items-center gap-4">
        {LINKS.map(({ href, label, Icon }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" title={label}>
            <Icon className="w-5 h-5 text-muted hover:text-ink transition-colors" />
          </a>
        ))}
        <a href="mailto:yossef2989@gmail.com" title="Email">
          <Mail className="w-5 h-5 text-muted hover:text-ink transition-colors" />
        </a>
      </div>
    </footer>
  );
}
