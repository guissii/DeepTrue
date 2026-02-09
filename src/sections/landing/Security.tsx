import { useTranslation } from "react-i18next";
import { Server, EyeOff, Trash2, Database } from "lucide-react";

export function Security() {
  const { t } = useTranslation();

  const securityFeatures = [
    {
      icon: Server,
      title: t("landing.securitySection.local"),
    },
    {
      icon: EyeOff,
      title: t("landing.securitySection.masking"),
    },
    {
      icon: Trash2,
      title: t("landing.securitySection.deletion"),
    },
    {
      icon: Database,
      title: t("landing.securitySection.noDb"),
    },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          {t("landing.securitySection.title")}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 rounded-xl bg-green-50 dark:bg-green-950/20"
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                <feature.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium text-green-900 dark:text-green-100">
                {feature.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
