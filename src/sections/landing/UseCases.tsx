import { useTranslation } from "react-i18next";
import { Newspaper, Users, ClipboardCheck, Landmark, ShieldCheck, FileSearch } from "lucide-react";

export function UseCases() {
  const { t } = useTranslation();

  const useCases = [
    {
      icon: Newspaper,
      title: t("landing.useCases.media"),
    },
    {
      icon: Users,
      title: t("landing.useCases.hr"),
    },
    {
      icon: ClipboardCheck,
      title: t("landing.useCases.compliance"),
    },
    {
      icon: Landmark,
      title: t("landing.useCases.banking"),
    },
    {
      icon: ShieldCheck,
      title: t("landing.useCases.insurance"),
    },
    {
      icon: FileSearch,
      title: t("landing.useCases.audit"),
    },
  ];

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          {t("landing.useCases.title")}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-6 rounded-xl bg-background hover:shadow-md transition-shadow"
            >
              <useCase.icon className="h-10 w-10 text-primary mb-4" />
              <span className="text-center font-medium">{useCase.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
