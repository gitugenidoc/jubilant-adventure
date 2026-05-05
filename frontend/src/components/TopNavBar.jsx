export const TopNavBar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none font-['Sora'] text-sm font-medium tracking-tight">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <img
          src="/public/images/GeniDoc_IeHF2025.png"
          alt="GeniDoc Hayat"
          className="h-16"
        />
        <div className="hidden md:flex space-x-8">
          <a
            href="#"
            className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
          >
            Solutions
          </a>
          <a
            href="#"
            className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
          >
            Patients
          </a>
          <a
            href="#"
            className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
          >
            Médecins
          </a>
          <a
            href="#"
            className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
          >
            À propos
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-5 py-2.5 bg-primary-container text-on-primary-container rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold">
            Commencer
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
