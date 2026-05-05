export const Certifications = () => {
  const certs = [
    { icon: "check_circle", label: "ISO 27001" },
    { icon: "privacy_tip", label: "RGPD" },
    { icon: "local_hospital", label: "HIPAA" },
    { icon: "fact_check", label: "SOC 2" },
    { icon: "vpn_lock", label: "AES-256" },
    { icon: "verified", label: "Santé+" },
  ];

  return (
    <section className="py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop">
        <p className="text-center text-on-surface-variant text-sm uppercase tracking-widest mb-12 font-semibold">
          Nos certifications et partenaires
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center">
          {certs.map((cert, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center border-2 border-secondary">
                <span className="material-symbols-outlined text-2xl text-secondary">
                  {cert.icon}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant text-center font-semibold">
                {cert.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
