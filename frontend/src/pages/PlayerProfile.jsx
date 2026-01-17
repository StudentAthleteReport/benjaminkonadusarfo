import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Ruler,
  Weight,
  Timer,
  Dumbbell,
  Brain,
  Shield,
  Zap,
  Users,
  Heart,
  Activity,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PlayerProfile() {
  const [athlete, setAthlete] = useState(null);
  const [measurables, setMeasurables] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [athleteRes, measurablesRes] = await Promise.all([
          axios.get(`${API}/athlete`),
          axios.get(`${API}/measurables`),
        ]);
        setAthlete(athleteRes.data);
        setMeasurables(measurablesRes.data);
        axios.post(`${API}/analytics/pageview?page=profile`);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !athlete || !measurables) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const skills = [
    { name: "Coverage Skills", value: 92, icon: Shield },
    { name: "Ball Hawking", value: 88, icon: Zap },
    { name: "Tackling", value: 85, icon: Activity },
    { name: "Football IQ", value: 95, icon: Brain },
    { name: "Leadership", value: 90, icon: Users },
    { name: "Work Ethic", value: 98, icon: Heart },
  ];

  const strengths = [
    {
      title: "Elite Ball Skills",
      description:
        "Exceptional ability to locate and track the ball in the air. 7 INTs in 2024 season demonstrates elite ball-hawking instincts.",
    },
    {
      title: "High Football IQ",
      description:
        "Consistently reads route combinations and anticipates throws. Film study habits allow pre-snap recognition of offensive concepts.",
    },
    {
      title: "Physical Tackler",
      description:
        "Willing and able run support defender. 68 tackles with 3 forced fumbles shows willingness to play physical in space.",
    },
    {
      title: "Versatility",
      description:
        "Can play both safety positions and slide down to nickel corner. Offers scheme flexibility for any defensive system.",
    },
  ];

  return (
    <div data-testid="player-profile-page" className="min-h-screen bg-[#0A0A0A] pt-24">
      {/* Header */}
      <section className="section-padding max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-8 items-start"
        >
          {/* Profile Image */}
          <div className="w-full md:w-64 aspect-square rounded-2xl overflow-hidden border border-[#27272A]">
            <img
              src={athlete.profile_image || "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400"}
              alt={athlete.full_name}
              className="w-full h-full object-cover"
              data-testid="profile-image"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <span className="highlight-tag mb-4 inline-block">Class of {athlete.graduation_year}</span>
            <h1
              data-testid="profile-name"
              className="text-4xl md:text-5xl font-['Barlow_Condensed'] font-black uppercase text-white mb-2"
            >
              {athlete.full_name}
            </h1>
            <p className="text-xl text-[#A1A1AA] mb-6">
              {athlete.positions.join(" / ")} • #{athlete.jersey_number}
            </p>
            <p className="text-lg text-[#A1A1AA]">
              {athlete.high_school}
              <br />
              {athlete.city}, {athlete.state}
            </p>

            {/* Quick Measurables Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <QuickMeasure icon={Ruler} label="Height" value={athlete.height} testId="profile-height" />
              <QuickMeasure icon={Weight} label="Weight" value={`${athlete.weight} lbs`} testId="profile-weight" />
              <QuickMeasure icon={Ruler} label="Wingspan" value={athlete.wingspan || "N/A"} testId="profile-wingspan" />
              <QuickMeasure icon={Timer} label="40 Time" value={`${measurables.forty_yard}s`} testId="profile-40" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Verified Measurables */}
      <section className="section-padding max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-['Barlow_Condensed'] font-black uppercase text-white mb-8">
            Verified Measurables
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MeasurableCard
              label="40-Yard Dash"
              value={`${measurables.forty_yard}s`}
              icon={Timer}
              testId="measurable-card-40"
            />
            <MeasurableCard
              label="Pro Shuttle"
              value={`${measurables.shuttle}s`}
              icon={Activity}
              testId="measurable-card-shuttle"
            />
            <MeasurableCard
              label="Vertical Jump"
              value={`${measurables.vertical_jump}"`}
              icon={Zap}
              testId="measurable-card-vertical"
            />
            <MeasurableCard
              label="Broad Jump"
              value={measurables.broad_jump}
              icon={Activity}
              testId="measurable-card-broad"
            />
            <MeasurableCard
              label="Bench Press"
              value={`${measurables.bench_press} lbs`}
              icon={Dumbbell}
              testId="measurable-card-bench"
            />
            <MeasurableCard
              label="Squat"
              value={`${measurables.squat} lbs`}
              icon={Dumbbell}
              testId="measurable-card-squat"
            />
          </div>

          {/* Additional Measurements */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="card-solid p-4 text-center">
              <div className="text-sm text-[#A1A1AA] mb-1">Hand Size</div>
              <div className="text-xl font-bold text-white">{measurables.hand_size}</div>
            </div>
            <div className="card-solid p-4 text-center">
              <div className="text-sm text-[#A1A1AA] mb-1">Arm Length</div>
              <div className="text-xl font-bold text-white">{measurables.arm_length}</div>
            </div>
            <div className="card-solid p-4 text-center">
              <div className="text-sm text-[#A1A1AA] mb-1">Deadlift</div>
              <div className="text-xl font-bold text-white">{measurables.deadlift} lbs</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Skills Assessment */}
      <section className="section-padding max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-['Barlow_Condensed'] font-black uppercase text-white mb-8">
            Skills Assessment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-solid p-6"
                data-testid={`skill-${skill.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#007AFF]/20 flex items-center justify-center">
                      <skill.icon className="w-5 h-5 text-[#007AFF]" />
                    </div>
                    <span className="font-semibold text-white">{skill.name}</span>
                  </div>
                  <span className="text-2xl font-bold text-[#007AFF]">{skill.value}</span>
                </div>
                <Progress value={skill.value} className="h-2 bg-[#1E1E1E]" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Strengths Breakdown */}
      <section className="section-padding max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-['Barlow_Condensed'] font-black uppercase text-white mb-8">
            Strengths Breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strengths.map((strength, index) => (
              <motion.div
                key={strength.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-solid p-6"
                data-testid={`strength-${index}`}
              >
                <h3 className="text-xl font-bold text-white mb-3">{strength.title}</h3>
                <p className="text-[#A1A1AA] leading-relaxed">{strength.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Injury History */}
      <section className="section-padding max-w-7xl mx-auto pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-['Barlow_Condensed'] font-black uppercase text-white mb-8">
            Injury History
          </h2>

          <div className="card-solid p-6" data-testid="injury-history-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Clean Bill of Health</h3>
                <p className="text-sm text-[#A1A1AA]">No significant injuries on record</p>
              </div>
            </div>
            <p className="text-[#A1A1AA]">
              Has started 31 consecutive games over the past three seasons without missing time due
              to injury. Demonstrates durability and proper training habits.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function QuickMeasure({ icon: Icon, label, value, testId }) {
  return (
    <div className="card-solid p-4 flex items-center gap-3" data-testid={testId}>
      <div className="w-10 h-10 rounded-full bg-[#007AFF]/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#007AFF]" />
      </div>
      <div>
        <div className="text-xs text-[#A1A1AA] uppercase">{label}</div>
        <div className="text-lg font-bold text-white">{value}</div>
      </div>
    </div>
  );
}

function MeasurableCard({ label, value, icon: Icon, testId }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card-solid p-6 text-center stat-card"
      data-testid={testId}
    >
      <div className="w-12 h-12 rounded-full bg-[#007AFF]/20 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-[#007AFF]" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-[#A1A1AA] uppercase tracking-wide">{label}</div>
    </motion.div>
  );
}
