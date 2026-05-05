export const FinalCTA = () => {
  return (
    <section className="py-32 bg-gradient-to-r from-secondary to-secondary-container">
      <div className="max-w-4xl mx-auto px-container-padding-mobile md:px-container-padding-desktop text-center">
        <h2 className="font-h2 text-h2 text-on-secondary mb-6">
          Prêt à transformer votre santé ?
        </h2>
        <p className="text-on-secondary text-body-lg mb-12 opacity-95">
          Rejoignez 50 000+ utilisateurs qui font confiance à GeniDoc Hayat pour
          coordonner leurs soins.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button className="bg-on-secondary text-secondary px-8 py-4 rounded-lg font-h3 text-[16px] hover:opacity-90 transition-opacity font-semibold">
            S'inscrire maintenant
          </button>
          <button className="bg-transparent border-2 border-on-secondary text-on-secondary px-8 py-4 rounded-lg font-h3 text-[16px] hover:bg-on-secondary/10 transition-colors font-semibold">
            Planifier une démo
          </button>
        </div>
        <p className="text-on-secondary text-sm opacity-85">
          Aucune carte bancaire. Inscription simple. Support immédiat.
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;
