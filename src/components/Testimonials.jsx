export const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "Enfin, tous mes dossiers au même endroit. Plus besoin de chercher mes ordonnances partout !",
      author: "Fatima B.",
      role: "Patiente, Casablanca",
      initials: "F",
    },
    {
      quote:
        "La coordination automatique me fait gagner 3 heures par semaine. Nos patients sont plus satisfaits.",
      author: "Dr Ahmed M.",
      role: "Médecin généraliste, Rabat",
      initials: "D",
    },
    {
      quote:
        "Les e-ordonnances ont réduit nos erreurs de 85%. Nos patients reçoivent exactement ce qu'il faut.",
      author: "Pharma Rachida",
      role: "Pharmacienne, Fès",
      initials: "P",
    },
  ];

  return (
    <section className="py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop">
        <div className="text-center mb-16">
          <h2 className="font-h2 text-h2 text-on-surface mb-4">
            Ce qu'en disent nos utilisateurs
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant flex flex-col gap-4"
            >
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="text-secondary material-symbols-outlined"
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="text-on-surface font-semibold mb-4">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-on-secondary font-semibold">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-semibold text-on-surface">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
