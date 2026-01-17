import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Trophy, TrendingUp, Shield, Target, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StatsPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get(`${API}/stats`);
        setStats(statsRes.data);
        axios.post(`${API}/analytics/pageview?page=stats`);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Prepare chart data
  const chartData = [...stats].reverse().map((s) => ({
    season: s.season,
    tackles: s.tackles || 0,
    interceptions: (s.interceptions || 0) * 5, // Scale for visibility
    passesDefended: s.passes_defended || 0,
    gamesPlayed: s.games_played,
  }));

  const progressionData = [...stats].reverse().map((s) => ({
    season: s.season,
    tackles: s.tackles || 0,
    interceptions: s.interceptions || 0,
    passesDefended: s.passes_defended || 0,
  }));

  const latestSeason = stats[0];

  return (
    <div data-testid="stats-page" className="min-h-screen bg-[#0A0A0A] pt-24">
      {/* Header */}
      <section className="section-padding max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-['Barlow_Condensed'] font-black uppercase text-white mb-4">
            Stats & Performance
          </h1>
          <p className="text-lg text-[#A1A1AA]">
            Interactive statistics dashboard with year-over-year progression
          </p>
        </motion.div>
      </section>

      {/* Season Highlights */}
      {latestSeason && (
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-['Barlow_Condensed'] font-bold uppercase text-white mb-6">
              {latestSeason.season} Season Highlights
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatHighlight
                icon={Shield}
                label="Total Tackles"
                value={latestSeason.tackles}
                subtext={`${latestSeason.solo_tackles} solo, ${latestSeason.assisted_tackles} assisted`}
                testId="highlight-tackles"
              />
              <StatHighlight
                icon={Target}
                label="Interceptions"
                value={latestSeason.interceptions}
                subtext="Ball hawking ability"
                color="text-[#10B981]"
                testId="highlight-ints"
              />
              <StatHighlight
                icon={Shield}
                label="Pass Deflections"
                value={latestSeason.passes_defended}
                subtext="Coverage excellence"
                testId="highlight-pds"
              />
              <StatHighlight
                icon={TrendingUp}
                label="Games Played"
                value={latestSeason.games_played}
                subtext="Full season starter"
                testId="highlight-games"
              />
            </div>
          </motion.div>
        </section>
      )}

      {/* Charts Section */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-[#121212] border border-[#27272A] p-1" data-testid="stats-tabs">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#007AFF] data-[state=active]:text-white text-[#A1A1AA] px-6 py-2"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="progression"
              className="data-[state=active]:bg-[#007AFF] data-[state=active]:text-white text-[#A1A1AA] px-6 py-2"
            >
              Year-over-Year
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <div className="card-solid p-6">
              <h3 className="text-xl font-bold text-white mb-6">Career Stats Overview</h3>
              <div className="h-80" data-testid="overview-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                    <XAxis dataKey="season" stroke="#A1A1AA" />
                    <YAxis stroke="#A1A1AA" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#121212",
                        border: "1px solid #27272A",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#FFFFFF" }}
                    />
                    <Legend />
                    <Bar dataKey="tackles" name="Tackles" fill="#007AFF" radius={[4, 4, 0, 0]} />
                    <Bar
                      dataKey="passesDefended"
                      name="Pass Deflections"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progression" className="mt-8">
            <div className="card-solid p-6">
              <h3 className="text-xl font-bold text-white mb-6">Career Progression</h3>
              <div className="h-80" data-testid="progression-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                    <XAxis dataKey="season" stroke="#A1A1AA" />
                    <YAxis stroke="#A1A1AA" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#121212",
                        border: "1px solid #27272A",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#FFFFFF" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tackles"
                      name="Tackles"
                      stroke="#007AFF"
                      strokeWidth={3}
                      dot={{ fill: "#007AFF", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="interceptions"
                      name="Interceptions"
                      stroke="#FF3B30"
                      strokeWidth={3}
                      dot={{ fill: "#FF3B30", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="passesDefended"
                      name="Pass Deflections"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: "#10B981", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Season-by-Season Breakdown */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-['Barlow_Condensed'] font-bold uppercase text-white mb-6">
            Season-by-Season Breakdown
          </h2>

          <div className="space-y-4">
            {stats.map((season, index) => (
              <SeasonCard key={season.id} season={season} index={index} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Honors & Awards */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-['Barlow_Condensed'] font-bold uppercase text-white mb-6">
            Honors & Awards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.flatMap((season) =>
              season.honors.map((honor, idx) => (
                <motion.div
                  key={`${season.season}-${idx}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="card-solid p-4 flex items-center gap-4"
                  data-testid={`honor-${season.season}-${idx}`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-[#FFD700]" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{honor}</div>
                    <div className="text-sm text-[#A1A1AA]">{season.season}</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function StatHighlight({ icon: Icon, label, value, subtext, color = "text-[#007AFF]", testId }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card-solid p-6 text-center stat-card"
      data-testid={testId}
    >
      <div className={`w-12 h-12 rounded-full ${color.replace("text-", "bg-")}/20 flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="text-4xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm font-medium text-white mb-1">{label}</div>
      <div className="text-xs text-[#A1A1AA]">{subtext}</div>
    </motion.div>
  );
}

function SeasonCard({ season, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="card-solid p-6"
      data-testid={`season-card-${season.season}`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-['Barlow_Condensed'] font-black text-[#007AFF]">
            {season.season}
          </div>
          <div>
            <div className="text-white font-medium">{season.games_played} Games</div>
            {season.captain && (
              <div className="flex items-center gap-1 text-[#FFD700] text-sm">
                <Star className="w-3 h-3" />
                Team Captain
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          <StatItem label="Tackles" value={season.tackles} />
          <StatItem label="Solo" value={season.solo_tackles} />
          <StatItem label="INTs" value={season.interceptions} highlight />
          <StatItem label="PDs" value={season.passes_defended} />
          <StatItem label="FF" value={season.forced_fumbles} />
        </div>
      </div>

      {season.honors && season.honors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#27272A]">
          <div className="flex flex-wrap gap-2">
            {season.honors.map((honor, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs rounded-full"
              >
                {honor}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatItem({ label, value, highlight = false }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${highlight ? "text-[#10B981]" : "text-white"}`}>
        {value || 0}
      </div>
      <div className="text-xs text-[#A1A1AA] uppercase">{label}</div>
    </div>
  );
}
