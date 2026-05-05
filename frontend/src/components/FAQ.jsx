import { useState } from "react";

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Comment mes données sont-elles protégées ?",
      answer:
        "Vos données sont chiffrées en AES-256, stockées sur des serveurs sécurisés conformes RGPD. Vous avez le contrôle total : suppression, export, partage sélectif. Aucun tiers n'y accède sans votre autorisation explicite.",
    },
    {
      question: "Combien ça coûte pour un patient ?",
      answer:
        "Pour les patients, GeniDoc Hayat est gratuit à vie. Les médecins et établissements paient un abonnement flexible basé sur le nombre de patients. Tarification transparente, sans frais cachés.",
    },
    {
      question: "Puis-je exporter mes données ?",
      answer:
        "Oui, complètement. Vous pouvez télécharger votre dossier médical complet en PDF, exporter vos données en format standard (HL7, FHIR) à tout moment, sans restriction.",
    },
    {
      question: "Comment connecter mon médecin ou ma pharmacie ?",
      answer:
        "Vous envoyez une invitation directement depuis l'app. Votre médecin ou pharmacien crée son compte professionnel en 5 minutes. Ils reçoivent automatiquement vos informations autorisées. Intégration API disponible pour les établissements.",
    },
    {
      question: "Fonctionne sur mobile ?",
      answer:
        "Oui, application native iOS et Android, et accès web complet. Synchronisation en temps réel sur tous vos appareils. Fonctionne aussi hors ligne avec synchronisation automatique.",
    },
  ];

  return (
    <section className="py-32 bg-surface-bright">
      <div className="max-w-4xl mx-auto px-container-padding-mobile md:px-container-padding-desktop">
        <div className="text-center mb-16">
          <h2 className="font-h2 text-h2 text-on-surface mb-4">
            Questions fréquentes
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              open={openIndex === idx}
              className="group border border-outline-variant rounded-lg p-6 cursor-pointer hover:bg-surface-container-low transition"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              <summary className="flex items-center justify-between font-semibold text-on-surface list-none">
                {faq.question}
                <span
                  className={`material-symbols-outlined transition-transform ${openIndex === idx ? "rotate-180" : ""}`}
                >
                  expand_more
                </span>
              </summary>
              {openIndex === idx && (
                <p className="text-on-surface-variant mt-4">{faq.answer}</p>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
