export const Benefits = () => {
  const benefits = [
    {
      icon: "person",
      title: "Patients",
      subtitle: "Votre santé dans votre poche",
      items: [
        "Dossier médical unifié",
        "Prise de rendez-vous simple",
        "Ordonnances numériques sécurisées",
      ],
    },
    {
      icon: "stethoscope",
      title: "Médecins",
      subtitle: "Optimisez votre pratique",
      items: [
        "Gestion patient centralisée",
        "Facturation automatisée",
        "Coordination interdisciplinaire",
      ],
    },
    {
      icon: "local_pharmacy",
      title: "Pharmaciens",
      subtitle: "Sécurisez la dispensation",
      items: [
        "Réception des e-ordonnances",
        "Gestion de stock simplifiée",
        "Historique médicamenteux",
      ],
    },
  ];

  return (
    <section className="py-32 bg-surface-bright">
      <div className="max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop">
        <div className="text-center mb-16">
          <h2 className="font-h2 text-h2 text-on-surface mb-4">
            Conçu pour tous les acteurs de la santé
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-4"
            >
              <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center text-secondary mb-2">
                <span className="material-symbols-outlined icon-fill text-3xl">
                  {benefit.icon}
                </span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface">
                {benefit.title}
              </h3>
              <p className="font-body-md text-body-md font-semibold text-secondary mb-2">
                {benefit.subtitle}
              </p>
              <ul className="space-y-3 font-body-md text-body-md text-on-surface-variant">
                {benefit.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-secondary text-xl">
                      check_circle
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
