export const Footer = () => {
  return (
    <footer className="w-full py-12 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-['Sora'] text-xs uppercase tracking-widest text-slate-900 dark:text-slate-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            GeniDoc Hayat
          </div>
          <p className="text-slate-500 dark:text-slate-400 normal-case tracking-normal">
            © 2026 GeniDoc Hayat. L'excellence médicale au service d'un
            accompagnement humain.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 md:justify-end">
          <a
            href="#"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:underline decoration-cyan-500/30 underline-offset-4 hover:translate-y-[-1px] transition-transform"
          >
            Confidentialité
          </a>
          <a
            href="#"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:underline decoration-cyan-500/30 underline-offset-4 hover:translate-y-[-1px] transition-transform"
          >
            Conditions d'utilisation
          </a>
          <a
            href="#"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:underline decoration-cyan-500/30 underline-offset-4 hover:translate-y-[-1px] transition-transform"
          >
            Sécurité
          </a>
          <a
            href="#"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:underline decoration-cyan-500/30 underline-offset-4 hover:translate-y-[-1px] transition-transform"
          >
            Nous contacter
          </a>
          <a
            href="#"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:underline decoration-cyan-500/30 underline-offset-4 hover:translate-y-[-1px] transition-transform"
          >
            FAQ
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
