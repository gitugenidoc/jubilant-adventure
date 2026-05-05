export const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-stack-lg">
            <div className="inline-block w-fit">
              <span className="text-sm font-bold text-secondary uppercase tracking-widest">
                ✓ Solution santé #1 en Afrique du Nord
              </span>
            </div>
            <h1 className="font-h1 text-h1 text-on-surface">
              La santé connectée, enfin simplifiée pour tous.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              GeniDoc Hayat centralise votre parcours de soins : de la prise de
              rendez-vous au suivi médical. Coordonnez votre santé en toute
              sécurité avec vos médecins, pharmaciens et établissements de
              santé.
              <span className="font-semibold">
                {" "}
                Plus jamais de dossiers perdus. Plus jamais d'attentes inutiles.
              </span>
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="auth.html"
                className="bg-secondary text-on-secondary px-8 py-4 rounded-lg font-h3 text-[16px] hover:opacity-90 transition-opacity font-semibold inline-block"
              >
                Démarrer gratuitement
              </a>
              <a
                href="#demo"
                className="bg-transparent border-2 border-secondary text-secondary px-8 py-4 rounded-lg font-h3 text-[16px] hover:bg-surface-container-low transition-colors inline-block"
              >
                Demander une démo
              </a>
            </div>
            <p className="text-sm text-on-surface-variant font-body-sm">
              ✓ Installation en 5 min · ✓ Pas de carte bancaire requise · ✓
              Support médical 24/7
            </p>
          </div>
          <div className="relative">
            <img
              alt="Interface GeniDoc"
              className="rounded-xl shadow-2xl object-cover h-[500px] w-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhbhBcTuvEd9RB5qtpgqF64zyM1kHh6AO6kQnlfZJU33pm5Ziblym9NxOJNEP-wVyJt7oh3z5G1djID2T0zFb0stbNTJHdG5wDlmZTtSvjqgmHO-1MIViTjqpv1R7RgyB3PlstpGYFJYNR8RqT3r-P2rgkPEyP8ylnRN37gel6TBFlnnKjRjwExQwMir8ZWPUMZJ8p_Nxev0j-sGo2rrOjT_fUXNgrsfp43j0_EkUZ0gbbFBKHqjqCzof60U1Jazt9RAprlaN60Xdo"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
