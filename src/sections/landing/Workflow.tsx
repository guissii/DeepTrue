import { useTranslation } from "react-i18next";
import { Upload, ScanLine, FileCheck } from "lucide-react";

export function Workflow() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Upload,
      title: t("landing.workflow.step1"),
      description: t("landing.workflow.step1Desc"),
    },
    {
      icon: ScanLine,
      title: t("landing.workflow.step2"),
      description: t("landing.workflow.step2Desc"),
    },
    {
      icon: FileCheck,
      title: t("landing.workflow.step3"),
      description: t("landing.workflow.step3Desc"),
    },
  ];

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          {t("landing.workflow.title")}
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-background shadow-lg flex items-center justify-center mb-6">
                <step.icon className="h-10 w-10 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
