export const Features = () => {
  const features = [
    {
      icon: "calendar_month",
      title: "Prise de rendez-vous",
      description:
        "Gérez vos disponibilités et prenez rendez-vous facilement 24h/24 et 7j/7.",
    },
    {
      icon: "folder_shared",
      title: "Dossier médical",
      description:
        "Accédez à votre historique complet et partagez-le en toute sécurité.",
    },
    {
      icon: "video_camera_front",
      title: "Téléconsultations",
      description:
        "Consultez votre médecin à distance via une plateforme sécurisée.",
    },
    {
      icon: "receipt_long",
      title: "E-ordonnance",
      description:
        "Recevez et transmettez vos ordonnances numériquement à la pharmacie.",
    },
  ];

  return (
    <section className="py-32 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop">
        <h2 className="font-h2 text-h2 text-on-surface mb-16 text-center">
          Fonctionnalités clés
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {features.map((feature, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="text-secondary mt-1">
                <span className="material-symbols-outlined text-3xl">
                  {feature.icon}
                </span>
              </div>
              <div>
                <h4 className="font-h3 text-[18px] text-on-surface mb-2">
                  {feature.title}
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
