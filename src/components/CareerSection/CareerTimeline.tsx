import { ScrollTimeline } from "../lightswind/scroll-timeline";
import { Briefcase, Award, Layers, GraduationCap, BookOpen } from "lucide-react";

export const CareerTimeline = () => {
  const careerEvents = [
    {
      year: "2025 – Present",
      title: "B.E. Computer Science and Engineering",
      subtitle: "Chettinad College of Engineering and Technology",
      description:
        "Pursuing Bachelor of Engineering in CSE with high focus on web development, IoT smart systems, algorithm design, and modern software architectures.",
      icon: <GraduationCap className="h-4 w-4 mr-2 text-primary" />,
    },
    {
      year: "2023 – 2025",
      title: "Lab Assistant",
      subtitle: "The Karur Polytechnic College",
      description:
        "Assisted students during laboratory practicals, maintained computer systems and peripherals, installed software packages, and resolved hardware and OS troubleshooting issues.",
      icon: <Layers className="h-4 w-4 mr-2 text-primary" />,
    },
    {
      year: "2023",
      title: "Software Development Intern",
      subtitle: "ObjectWays",
      description:
        "Participated in active software development lifecycles. Learned modern web technologies, practiced systematic debugging, and collaborated effectively on engineering deliverables.",
      icon: <Briefcase className="h-4 w-4 mr-2 text-primary" />,
    },
    {
      year: "2020 – 2023",
      title: "Diploma in Computer Engineering",
      subtitle: "The Karur Polytechnic College",
      description:
        "Completed rigorous curriculum in computer architecture, C/C++ programming, systems engineering, operating systems, and network fundamentals.",
      icon: <Award className="h-4 w-4 mr-2 text-primary" />,
    },
    {
      year: "Completed",
      title: "SSLC (Secondary Education)",
      subtitle: "Municipal Boys Higher Secondary School",
      description:
        "Completed secondary education with strong fundamentals in mathematics, science, and foundational analytical reasoning.",
      icon: <BookOpen className="h-4 w-4 mr-2 text-primary" />,
    },
  ];

  return (
    <div id="career">
      <ScrollTimeline
        events={careerEvents}
        title="Journey & Experience"
        subtitle="Academic progression, professional internships, and practical engineering roles"
        animationOrder="staggered"
        cardAlignment="alternating"
        cardVariant="elevated"
        parallaxIntensity={0.15}
        revealAnimation="fade"
        progressIndicator={true}
        lineColor="bg-primary/20"
        activeColor="bg-primary"
        progressLineWidth={3}
        progressLineCap="round"
      />
    </div>
  );
};
