import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  GraduationCap,
  BookOpen,
  Users,
  Heart,
  Award,
  CheckCircle,
  Quote,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AcademicPage() {
  const [athlete, setAthlete] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [athleteRes, testimonialRes] = await Promise.all([
          axios.get(`${API}/athlete`),
          axios.get(`${API}/testimonials`),
        ]);
        setAthlete(athleteRes.data);
        setTestimonials(testimonialRes.data);
        axios.post(`${API}/analytics/pageview?page=academic`);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !athlete) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const academics = {
    gpa: athlete.gpa,
    satScore: athlete.sat_score,
    actScore: athlete.act_score,
    ncaaId: athlete.ncaa_id,
    intendedMajors: ["Sports Management", "Business Administration"],
    coursework: [
      "AP English Literature",
      "AP US History",
      "Honors Pre-Calculus",
      "Honors Biology",
      "Spanish III",
    ],
    eligibilityStatus: "Fully Certified",
  };

  const leadership = [
    {
      title: "Team Captain",
      description: "Elected by teammates for 2024 season. Lead pre-game warmups and defensive meetings.",
      icon: Users,
    },
    {
      title: "Community Service",
      description: "150+ volunteer hours. Youth football camps, food bank, hospital visits.",
      icon: Heart,
    },
    {
      title: "Fellowship of Christian Athletes",
      description: "Active member and speaker at team devotionals.",
      icon: Award,
    },
    {
      title: "Student Government",
      description: "Class representative. Organized school spirit events and charity drives.",
      icon: GraduationCap,
    },
  ];

  return (
    <div data-testid="academic-page" className="min-h-screen bg-[#0A0A0A] pt-24">
      {/* Header */}
      <section className="section-padding max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-['Barlow_Condensed'] font-black uppercase text-white mb-4">
            Academic & Character
          </h1>
          <p className="text-lg text-[#A1A1AA]">
            Excellence in the classroom and community
          </p>
        </motion.div>
      </section>

      {/* Academic Stats */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AcademicStat
              icon={GraduationCap}
              label="GPA"
              value={academics.gpa.toFixed(2)}
              testId="academic-gpa"
            />
            <AcademicStat
              icon={BookOpen}
              label="SAT Score"
              value={academics.satScore || "N/A"}
              testId="academic-sat"
            />
            <AcademicStat
              icon={BookOpen}
              label="ACT Score"
              value={academics.actScore || "N/A"}
              testId="academic-act"
            />
            <AcademicStat
              icon={CheckCircle}
              label="NCAA Status"
              value={academics.eligibilityStatus}
              color="text-[#10B981]"
              testId="academic-ncaa"
            />
          </div>
        </motion.div>
      </section>

      {/* NCAA Eligibility */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="card-solid p-6" data-testid="ncaa-eligibility-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#10B981]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">NCAA Eligibility Center</h2>
                <p className="text-[#A1A1AA]">Fully certified and eligible</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-medium mb-3">NCAA ID</h3>
                <p className="text-2xl font-mono text-[#007AFF]">{academics.ncaaId}</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-3">Status</h3>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[#10B981] font-medium">{academics.eligibilityStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Coursework & Majors */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Intended Majors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-solid p-6"
            data-testid="intended-majors-card"
          >
            <h3 className="text-xl font-bold text-white mb-4">Intended Major(s)</h3>
            <div className="space-y-3">
              {academics.intendedMajors.map((major, idx) => (
                <div key={idx} className="flex items-center gap-3 text-[#A1A1AA]">
                  <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
                  {major}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Coursework */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="card-solid p-6"
            data-testid="coursework-card"
          >
            <h3 className="text-xl font-bold text-white mb-4">Rigorous Coursework</h3>
            <div className="space-y-3">
              {academics.coursework.map((course, idx) => (
                <div key={idx} className="flex items-center gap-3 text-[#A1A1AA]">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  {course}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Leadership & Character */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-['Barlow_Condensed'] font-bold uppercase text-white mb-6">
            Leadership & Character
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leadership.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-solid p-6 flex items-start gap-4"
                data-testid={`leadership-${index}`}
              >
                <div className="w-12 h-12 rounded-full bg-[#007AFF]/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-[#007AFF]" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2">{item.title}</h3>
                  <p className="text-[#A1A1AA] text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Coach Testimonials */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-['Barlow_Condensed'] font-bold uppercase text-white mb-6">
            Coach Testimonials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-solid p-6 testimonial-card"
                data-testid={`testimonial-${index}`}
              >
                <Quote className="w-8 h-8 text-[#007AFF]/30 mb-4" />
                <p className="text-[#A1A1AA] leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-[#27272A] pt-4">
                  <div className="text-white font-medium">{testimonial.author_name}</div>
                  <div className="text-sm text-[#A1A1AA]">{testimonial.author_title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function AcademicStat({ icon: Icon, label, value, color = "text-[#007AFF]", testId }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card-solid p-6 text-center stat-card"
      data-testid={testId}
    >
      <div className={`w-12 h-12 rounded-full ${color.replace("text-", "bg-")}/20 flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-[#A1A1AA] uppercase tracking-wide">{label}</div>
    </motion.div>
  );
}
