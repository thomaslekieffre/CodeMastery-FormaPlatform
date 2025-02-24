import { Github, Twitter, Youtube } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  {
    title: "Plateforme",
    links: [
      { label: "Fonctionnalités", href: "#" },
      { label: "Tarifs", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Documentation", href: "#" },
      { label: "Communauté", href: "#" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Mentions légales", href: "#" },
    ],
  },
];

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-[#0D0016] border-t border-white/10">
      <div className="container px-4 py-12 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">CodeMastery</h3>
            <p className="text-gray-400 mb-6">
              Formez-vous au développement web moderne avec une communauté
              passionnée.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-gray-400 hover:text-violet-400 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                  <span className="sr-only">{social.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-semibold text-white mb-4">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-violet-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} CodeMastery. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
