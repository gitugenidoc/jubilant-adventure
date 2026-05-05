export const Stats = () => {
  const stats = [
    { value: "50K+", label: "Patients actifs" },
    { value: "2.5K+", label: "Professionnels de santé" },
    { value: "98%", label: "Taux de satisfaction" },
    { value: "15M+", label: "Consultations coordonnées" },
  ];

  return (
    <section className="py-32 bg-primary-container">
      <div className="max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <div className="text-4xl font-bold text-on-primary-container mb-2">
                {stat.value}
              </div>
              <p className="text-on-primary-container opacity-90">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
