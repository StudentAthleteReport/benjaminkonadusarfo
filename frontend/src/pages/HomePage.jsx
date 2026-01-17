import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Play,
  Download,
  Mail,
  ExternalLink,
  ChevronRight,
  Trophy,
  Target,
  Zap,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HomePage() {
  const [athlete, setAthlete] = useState(null);
  const [measurables, setMeasurables] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [athleteRes, measurablesRes, statsRes] = await Promise.all([
          axios.get(`${API}/athlete`),
          axios.get(`${API}/measurables`),
          axios.get(`${API}/stats`),
        ]);
        setAthlete(athleteRes.data);
        setMeasurables(measurablesRes.data);
        setStats(statsRes.data);

        // Track page view
        axios.post(`${API}/analytics/pageview?page=home`);
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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const latestStats = stats[0] || {};

  return (
    <div data-testid="home-page" className="min-h-screen bg-[#0A0A0A]">
      {/* Hero Section */}
      <section className="hero-section relative min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1763494392794-a07d77898569?w=1600&q=80')`,
          }}
        />
        <div className="hero-overlay" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <span className="highlight-tag" data-testid="graduation-year-tag">
              Class of {athlete.graduation_year}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            data-testid="athlete-name"
            className="text-5xl md:text-7xl lg:text-8xl font-['Barlow_Condensed'] font-black uppercase tracking-tighter text-white mb-4"
          >
            {athlete.full_name}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 text-lg md:text-xl text-[#A1A1AA] mb-8"
          >
            <span data-testid="athlete-positions" className="text-white font-semibold">
              {athlete.positions.join(" / ")}
            </span>
            <span className="text-[#27272A]">|</span>
            <span data-testid="athlete-school">{athlete.high_school}</span>
            <span className="text-[#27272A]">|</span>
            <span>
              {athlete.city}, {athlete.state}
            </span>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          >
            <QuickStat label="Height" value={athlete.height} testId="stat-height" />
            <QuickStat label="Weight" value={`${athlete.weight} lbs`} testId="stat-weight" />
            <QuickStat label="Jersey" value={`#${athlete.jersey_number}`} testId="stat-jersey" />
            <QuickStat label="GPA" value={athlete.gpa.toFixed(1)} testId="stat-gpa" />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/film">
              <Button
                size="lg"
                data-testid="watch-film-btn"
                className="btn-primary h-14 px-8 rounded-full bg-[#007AFF] hover:bg-[#0062C4] text-white font-bold tracking-wide"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Full Game Film
              </Button>
            </Link>
            <a href={`${BACKEND_URL}/api/export/pdf`} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                data-testid="download-profile-btn"
                className="h-14 px-8 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Profile PDF
              </Button>
            </a>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                data-testid="contact-coaching-btn"
                className="h-14 px-8 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Coaching Staff
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Stats Section */}
      <section className="section-padding max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-['Barlow_Condensed'] font-black uppercase text-white mb-4">
            At A Glance
          </h2>
          <p className="text-[#A1A1AA] text-lg">
            Key metrics that define elite performance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Athletic Measurables */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 card-solid p-6 stat-card"
            data-testid="measurables-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#007AFF]/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#007AFF]" />
              </div>
              <h3 className="text-xl font-bold text-white">Athletic Testing</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <MeasurableStat
                label="40-Yard Dash"
                value={`${measurables?.forty_yard}s`}
                testId="measurable-40"
              />
              <MeasurableStat
                label="Shuttle"
                value={`${measurables?.shuttle}s`}
                testId="measurable-shuttle"
              />
              <MeasurableStat
                label="Vertical"
                value={`${measurables?.vertical_jump}"`}
                testId="measurable-vertical"
              />
              <MeasurableStat
                label="Bench Press"
                value={`${measurables?.bench_press} lbs`}
                testId="measurable-bench"
              />
            </div>
          </motion.div>

          {/* Season Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="card-solid p-6 stat-card"
            data-testid="season-stats-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#FF3B30]/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#FF3B30]" />
              </div>
              <h3 className="text-xl font-bold text-white">{latestStats.season}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Tackles</span>
                <span className="text-white font-bold" data-testid="stat-tackles">
                  {latestStats.tackles}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Interceptions</span>
                <span className="text-white font-bold" data-testid="stat-ints">
                  {latestStats.interceptions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Pass Deflections</span>
                <span className="text-white font-bold" data-testid="stat-pds">
                  {latestStats.passes_defended}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Honors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="card-solid p-6 stat-card"
            data-testid="honors-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#FFD700]" />
              </div>
              <h3 className="text-xl font-bold text-white">Honors</h3>
            </div>
            <div className="space-y-2">
              {latestStats.honors?.slice(0, 3).map((honor, index) => (
                <div
                  key={index}
                  className="text-sm text-[#A1A1AA] flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 text-[#007AFF]" />
                  {honor}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Academics Quick View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 card-solid p-6 stat-card"
            data-testid="academics-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#10B981]" />
              </div>
              <h3 className="text-xl font-bold text-white">Academics</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{athlete.gpa}</div>
                <div className="text-sm text-[#A1A1AA]">GPA</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{athlete.sat_score || "N/A"}</div>
                <div className="text-sm text-[#A1A1AA]">SAT</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{athlete.act_score || "N/A"}</div>
                <div className="text-sm text-[#A1A1AA]">ACT</div>
              </div>
            </div>
          </motion.div>

          {/* Video Highlight Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 card-solid overflow-hidden stat-card group"
            data-testid="video-preview-card"
          >
            <Link to="/film" className="block relative">
              <div className="aspect-video relative">
                <img
                  src="https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80"
                  alt="Highlight Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-[#007AFF] flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h4 className="text-white font-bold">2024 Season Highlights</h4>
                  <p className="text-[#A1A1AA] text-sm">4:32 • Junior Year Reel</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="section-padding max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickLinkCard
            to="/profile"
            icon={<Target className="w-6 h-6" />}
            title="Full Profile"
            description="Complete measurables, skills breakdown, and more"
            testId="quick-link-profile"
          />
          <QuickLinkCard
            to="/film"
            icon={<Play className="w-6 h-6" />}
            title="Game Film"
            description="Season highlights, full games, position cuts"
            testId="quick-link-film"
          />
          <QuickLinkCard
            to="/contact"
            icon={<Mail className="w-6 h-6" />}
            title="Contact Info"
            description="Reach coaches and recruiting coordinator"
            testId="quick-link-contact"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#27272A] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[#A1A1AA] text-sm">
            © {new Date().getFullYear()} {athlete.full_name} • Recruiting Hub
          </div>
          <div className="flex items-center gap-4">
            {athlete.hudl_url && (
              <a
                href={athlete.hudl_url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-hudl-link"
                className="text-[#A1A1AA] hover:text-white transition-colors flex items-center gap-1"
              >
                Hudl <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {athlete.twitter_handle && (
              <a
                href={`https://twitter.com/${athlete.twitter_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-twitter-link"
                className="text-[#A1A1AA] hover:text-white transition-colors flex items-center gap-1"
              >
                @{athlete.twitter_handle} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function QuickStat({ label, value, testId }) {
  return (
    <div className="glass rounded-xl p-4 text-center" data-testid={testId}>
      <div className="text-2xl md:text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-[#A1A1AA] uppercase tracking-wide">{label}</div>
    </div>
  );
}

function MeasurableStat({ label, value, testId }) {
  return (
    <div className="text-center p-4 bg-[#1E1E1E] rounded-lg" data-testid={testId}>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-[#A1A1AA] uppercase tracking-wide">{label}</div>
    </div>
  );
}

function QuickLinkCard({ to, icon, title, description, testId }) {
  return (
    <Link to={to} data-testid={testId}>
      <motion.div
        whileHover={{ y: -4 }}
        className="card-solid p-6 h-full flex items-start gap-4 group cursor-pointer hover:border-[#007AFF]/50 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-[#007AFF]/20 flex items-center justify-center text-[#007AFF] group-hover:bg-[#007AFF] group-hover:text-white transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            {title}
            <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </h3>
          <p className="text-sm text-[#A1A1AA]">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}
