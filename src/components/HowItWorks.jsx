export const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Inscription simple",
      description:
        "Créez un compte en 2 minutes avec votre email ou numéro de téléphone. Vérification sécurisée instantanée.",
      icon: "app_registration",
    },
    {
      number: 2,
      title: "Connectez vos données",
      description:
        "Importez vos dossiers médicaux existants ou commencez à créer votre historique santé. Tout est confidentiel.",
      icon: "folder_shared",
    },
    {
      number: 3,
      title: "Démarrez vos soins",
      description:
        "Prenez rendez-vous, consultez en ligne, recevez vos ordonnances, suivez votre santé en temps réel.",
      icon: "psychology",
    },
  ];

  return (
    <section className="py-32 bg-surface-bright">
      <div className="max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop">
        <div className="text-center mb-20">
          <h2 className="font-h2 text-h2 text-on-surface mb-4">
            Comment ça marche en 3 étapes
          </h2>
          <p className="text-on-surface-variant text-body-lg max-w-2xl mx-auto">
            De votre inscription à votre premier suivi coordonné, tout est pensé
            pour votre confort et votre sécurité.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-on-secondary font-bold text-2xl mx-auto mb-6">
                {step.number}
              </div>
              <h3 className="font-h3 text-h3 text-on-surface text-center mb-4">
                {step.title}
              </h3>
              <p className="text-on-surface-variant text-center mb-6">
                {step.description}
              </p>
              <div className="text-center text-secondary">
                <span className="material-symbols-outlined text-5xl">
                  {step.icon}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute bottom-0 left-1/2 w-12 h-1 bg-gradient-to-r from-secondary to-transparent transform translate-x-8 -translate-y-8"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
