export const SecurityCompliance = () => {
  const securityItems = [
    {
      icon: "shield_locked",
      title: "Chiffrement de bout en bout",
      description:
        "Vos données sont chiffrées en transit et au repos. Norme AES-256 et protocoles militaires.",
    },
    {
      icon: "verified_user",
      title: "Conformité RGPD & HIPAA",
      description:
        "Certifiée conforme aux régulations européennes et internationales de protection des données.",
    },
    {
      icon: "security",
      title: "Audit de sécurité continu",
      description:
        "Tests d'intrusion réguliers, certifications ISO 27001, infrastructure cloud sécurisée.",
    },
  ];

  return (
    <section className="py-32 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop">
        <div className="text-center mb-16">
          <h2 className="font-h2 text-h2 text-on-surface mb-4">
            Votre confiance est notre priorité
          </h2>
          <p className="text-on-surface-variant text-body-lg max-w-2xl mx-auto">
            Conformité, sécurité et protection des données au plus haut niveau.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {securityItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant flex flex-col gap-4"
            >
              <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center text-secondary mb-2">
                <span className="material-symbols-outlined icon-fill text-3xl">
                  {item.icon}
                </span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface">{item.title}</h3>
              <p className="text-on-surface-variant">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecurityCompliance;
