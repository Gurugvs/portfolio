import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Play, Radio } from "lucide-react";
import { IoTPollutionDemoModal } from "../IoTPollutionDemo/IoTPollutionDemoModal";

export const ProjectsSection = () => {
  const [isIotDemoOpen, setIsIotDemoOpen] = useState(false);

  const projects = [
    {
      id: 1,
      title: "RentalHub – Rental Home Management System",
      subtitle: "Full-Stack MERN (MongoDB, Express, React, Node.js) platform with RBAC, Email OTP, house visit booking, and Chart.js analytics",
      tags: ["MERN Stack", "Tailwind CSS", "JWT & OTP", "Chart.js"],
      link: "https://github.com/Gurugvs/rentalhub",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200",
      gridClass: "md:col-span-7 h-[420px]",
      hasLiveDemo: false,
    },
    {
      id: 2,
      title: "Air & Noise Pollution Detection using IoT",
      subtitle: "Academic Project: Real-time environmental monitoring using Arduino, smart sensors & Embedded C",
      tags: ["Arduino", "IoT Sensors", "Embedded C", "Live Simulator"],
      link: "https://github.com/Gurugvs",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
      gridClass: "md:col-span-5 h-[420px]",
      hasLiveDemo: true,
    },
  ];

  return (
    <section id="projects" className="w-full max-w-7xl mx-auto px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
        className="mb-12 md:mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-center md:text-left">
          Selected <span className="text-gradient-primary">Projects</span>
        </h2>
        <p className="text-muted-foreground text-center md:text-left max-w-2xl text-lg">
          Featured academic and technical projects spanning Full-Stack MERN engineering and IoT sensor networks.
        </p>
      </motion.div>

      {/* 12-Column Full-Width Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            className={`group relative overflow-hidden rounded-[2.25rem] block shadow-xl border border-foreground/10 cursor-pointer ${project.gridClass}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            viewport={{ once: true, amount: 0.1 }}
            onClick={() => {
              if (project.hasLiveDemo) {
                setIsIotDemoOpen(true);
              } else {
                window.open(project.link, "_blank", "noopener,noreferrer");
              }
            }}
          >
            {/* Background Image Container */}
            <div className="absolute inset-0 bg-neutral-950">
              <img 
                src={project.image} 
                alt={project.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100 transform-gpu"
              />
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end pointer-events-none">
              <div className="flex items-end justify-between gap-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 transform-gpu">
                <div className="z-10 max-w-lg pointer-events-auto">
                  {project.tags && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      {project.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-md border ${
                            t === "Live Simulator"
                              ? "bg-emerald-500/30 text-emerald-300 border-emerald-400/40 flex items-center gap-1 animate-pulse"
                              : "bg-white/20 text-white border-white/20"
                          }`}
                        >
                          {t === "Live Simulator" && <Radio className="w-2.5 h-2.5" />}
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md">
                    {project.title}
                  </h3>
                  <p className="text-sm md:text-base font-medium text-white/80 opacity-90 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                    {project.subtitle}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 pointer-events-auto shrink-0">
                  {project.hasLiveDemo ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsIotDemoOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Live Demo</span>
                    </button>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 group-hover:bg-white group-hover:text-black transition-all duration-300 rotate-45 group-hover:rotate-0 z-10 shadow-lg">
                      <ArrowUpRight className="w-6 h-6 text-white group-hover:text-black transition-colors" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* IoT Air & Noise Pollution Telemetry Live Simulator Modal */}
      <IoTPollutionDemoModal
        isOpen={isIotDemoOpen}
        onClose={() => setIsIotDemoOpen(false)}
      />
    </section>
  );
};

