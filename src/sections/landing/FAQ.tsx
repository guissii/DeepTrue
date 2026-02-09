import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t("landing.faq.q1"),
      answer: t("landing.faq.a1"),
    },
    {
      question: t("landing.faq.q2"),
      answer: t("landing.faq.a2"),
    },
    {
      question: t("landing.faq.q3"),
      answer: t("landing.faq.a3"),
    },
    {
      question: t("landing.faq.q4"),
      answer: t("landing.faq.a4"),
    },
  ];

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          {t("landing.faq.title")}
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
