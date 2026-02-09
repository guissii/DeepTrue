import { useTranslation } from "react-i18next";
import { Github, Mail, BookOpen } from "lucide-react";
import logo from "@/assets/logo.jpeg";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="py-12 border-t">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-8 w-8 rounded-lg" />
            <span className="font-bold">{t("app.name")}</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>{t("landing.footer.contact")}</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>{t("landing.footer.github")}</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>{t("landing.footer.docs")}</span>
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>{t("landing.footer.disclaimer")}</p>
          <p className="mt-2">
            © {new Date().getFullYear()} {t("app.name")}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
