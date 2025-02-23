import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-24 bg-violet-500">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center text-white">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Prêt à commencer votre voyage ?
          </h2>
          <p className="max-w-[600px] text-white/80">
            Rejoignez plus de 2000 développeurs qui ont déjà commencé leur
            formation avec CodeMastery
          </p>
          <Button size="lg" variant="secondary">
            Commencer gratuitement
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
