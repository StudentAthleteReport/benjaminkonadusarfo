import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Play, Clock, Tag, ChevronRight, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function GameFilm() {
  const [films, setFilms] = useState([]);
  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [filmsRes, athleteRes] = await Promise.all([
          axios.get(`${API}/films`),
          axios.get(`${API}/athlete`),
        ]);
        setFilms(filmsRes.data);
        setAthlete(athleteRes.data);
        axios.post(`${API}/analytics/pageview?page=film`);
      } catch (error) {
        console.error("Error fetching films:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const trackVideoClick = (video) => {
    axios.post(`${API}/analytics/video-click?video_id=${video.id}&video_title=${encodeURIComponent(video.title)}`);
  };

  const filteredFilms =
    activeCategory === "all"
      ? films
      : films.filter((film) => film.category === activeCategory);

  const categories = [
    { id: "all", label: "All Film" },
    { id: "highlights", label: "Highlights" },
    { id: "full_game", label: "Full Games" },
    { id: "position_cuts", label: "Position Cuts" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="game-film-page" className="min-h-screen bg-[#0A0A0A] pt-24">
      {/* Header */}
      <section className="section-padding max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-['Barlow_Condensed'] font-black uppercase text-white mb-4">
            Game Film & Highlights
          </h1>
          <p className="text-lg text-[#A1A1AA] mb-8">
            Categorized film with time-stamped play descriptions and recruiter-friendly tags
          </p>

          {/* External Links */}
          {athlete && (
            <div className="flex flex-wrap gap-4 mb-8">
              {athlete.hudl_url && (
                <a
                  href={athlete.hudl_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="hudl-link"
                >
                  <Button variant="outline" className="border-[#27272A] text-white hover:bg-white/10">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Hudl Profile
                  </Button>
                </a>
              )}
              {athlete.youtube_url && (
                <a
                  href={athlete.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="youtube-link"
                >
                  <Button variant="outline" className="border-[#27272A] text-white hover:bg-white/10">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    YouTube Channel
                  </Button>
                </a>
              )}
            </div>
          )}
        </motion.div>
      </section>

      {/* Film Categories */}
      <section className="max-w-7xl mx-auto px-6">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
          <TabsList className="bg-[#121212] border border-[#27272A] p-1 h-auto flex-wrap" data-testid="film-category-tabs">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                data-testid={`tab-${cat.id}`}
                className="data-[state=active]:bg-[#007AFF] data-[state=active]:text-white text-[#A1A1AA] px-6 py-2"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFilms.map((film, index) => (
                <FilmCard
                  key={film.id}
                  film={film}
                  index={index}
                  onPlay={() => {
                    setSelectedVideo(film);
                    trackVideoClick(film);
                  }}
                />
              ))}
            </div>

            {filteredFilms.length === 0 && (
              <div className="text-center py-16 text-[#A1A1AA]">
                No films in this category yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl bg-[#121212] border-[#27272A]">
          {selectedVideo && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-xl">
                  {selectedVideo.title}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4">
                {/* Video Embed */}
                <div className="video-container rounded-lg overflow-hidden">
                  <iframe
                    src={selectedVideo.video_url}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    data-testid="video-player"
                  />
                </div>

                {/* Video Info */}
                <div className="mt-6">
                  <p className="text-[#A1A1AA] mb-4">{selectedVideo.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedVideo.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-[#007AFF]/10 border-[#007AFF]/30 text-[#007AFF]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Timestamps */}
                  {selectedVideo.timestamps && selectedVideo.timestamps.length > 0 && (
                    <div>
                      <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Key Plays
                      </h4>
                      <div className="space-y-2">
                        {selectedVideo.timestamps.map((ts, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 bg-[#1E1E1E] rounded-lg"
                            data-testid={`timestamp-${idx}`}
                          >
                            <span className="text-[#007AFF] font-mono text-sm font-bold min-w-[50px]">
                              {ts.time}
                            </span>
                            <span className="text-[#A1A1AA] text-sm">{ts.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Padding bottom */}
      <div className="h-20" />
    </div>
  );
}

function FilmCard({ film, index, onPlay }) {
  const categoryColors = {
    highlights: "bg-[#007AFF]",
    full_game: "bg-[#10B981]",
    position_cuts: "bg-[#F59E0B]",
  };

  const categoryLabels = {
    highlights: "Highlights",
    full_game: "Full Game",
    position_cuts: "Position Cuts",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="card-solid overflow-hidden group cursor-pointer"
      onClick={onPlay}
      data-testid={`film-card-${film.id}`}
    >
      {/* Thumbnail */}
      <div className="film-thumbnail aspect-video relative">
        <img
          src={film.thumbnail_url || "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600"}
          alt={film.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="play-icon">
          <div className="w-14 h-14 rounded-full bg-[#007AFF] flex items-center justify-center glow-primary">
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${categoryColors[film.category]}`}>
            {categoryLabels[film.category]}
          </span>
        </div>

        {/* Duration */}
        {film.duration && (
          <div className="absolute bottom-3 right-3 z-10 bg-black/80 px-2 py-1 rounded text-xs text-white font-mono">
            {film.duration}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-bold mb-2 group-hover:text-[#007AFF] transition-colors">
          {film.title}
        </h3>

        {film.opponent && (
          <p className="text-[#A1A1AA] text-sm mb-3">
            vs {film.opponent} • {film.game_date}
          </p>
        )}

        {/* Tags Preview */}
        <div className="flex flex-wrap gap-1">
          {film.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-[#1E1E1E] text-[#A1A1AA] rounded"
            >
              {tag}
            </span>
          ))}
          {film.tags.length > 3 && (
            <span className="text-xs px-2 py-0.5 text-[#A1A1AA]">
              +{film.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
