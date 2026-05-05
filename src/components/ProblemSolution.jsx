export const ProblemSolution = () => {
  const problems = [
    {
      title: "Dossiers médicaux fragmentés",
      description:
        "Vos données de santé sont dispersées chez différents prestataires. Impossible d'avoir une vue d'ensemble.",
    },
    {
      title: "Rendez-vous mal coordonnés",
      description:
        "Attentes interminables, double consultation, manque de communication entre professionnels.",
    },
    {
      title: "Prescriptions papier obsolètes",
      description:
        "Risques d'erreur, ordonnances perdues, traçabilité insuffisante.",
    },
  ];

  const solutions = [
    {
      title: "Un dossier unique et sécurisé",
      description:
        "Toutes vos données médicales au même endroit. Accessible partout, protégé toujours.",
    },
    {
      title: "Coordination transparente",
      description:
        "Médecins, pharmaciens et établissements travaillent ensemble. Vous gagnez du temps.",
    },
    {
      title: "E-ordonnances intelligentes",
      description:
        "Prescriptions numériques vérifiées, sans erreur. Historique complet et traçable.",
    },
  ];

  return (
    <section className="py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-h2 text-h2 text-on-surface mb-8">
              Le problème que vous vivez
            </h2>
            <ul className="space-y-6">
              {problems.map((problem, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="text-error mt-1">
                    <span className="material-symbols-outlined text-2xl">
                      warning
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-on-surface mb-1">
                      {problem.title}
                    </h4>
                    <p className="text-on-surface-variant">
                      {problem.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-secondary-container rounded-2xl p-8 lg:p-12">
            <h2 className="font-h2 text-h2 text-on-secondary mb-8">
              Notre solution
            </h2>
            <ul className="space-y-6">
              {solutions.map((solution, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="text-secondary mt-1">
                    <span className="material-symbols-outlined text-2xl icon-fill">
                      check_circle
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-on-secondary mb-1">
                      {solution.title}
                    </h4>
                    <p className="text-on-secondary opacity-90">
                      {solution.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
