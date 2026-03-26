import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export default function FaqSection() {
  const { t } = useTranslation("common");
  const { lng } = useParams<{ lng: string }>();
  const locale = lng ?? "de";

  const faqs = [1, 2, 3, 4, 5, 6].map((index) => ({
    id: `faq-${index}`,
    question: t(`home.faq.item${index}.q`),
    answer: t(`home.faq.item${index}.a`),
  }));

  return (
    <section id="faq" className="border-y bg-slate-50/70 py-20 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">{t("home.faq.title")}</h2>
          <p className="text-muted-foreground">{t("home.faq.subtitle")}</p>
        </div>

        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left text-base">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-muted-foreground">{t("home.faq.cta_text")}</p>
            <Button asChild className="mt-3" data-analytics-event="faq_contact_click">
              <a href={`/${locale}#contact`}>
                {t("home.faq.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
