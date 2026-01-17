import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Mail,
  Phone,
  ExternalLink,
  Send,
  User,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ContactPage() {
  const [athlete, setAthlete] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [athleteRes, contactsRes] = await Promise.all([
          axios.get(`${API}/athlete`),
          axios.get(`${API}/contacts`),
        ]);
        setAthlete(athleteRes.data);
        setContacts(contactsRes.data);
        axios.post(`${API}/analytics/pageview?page=contact`);
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

  return (
    <div data-testid="contact-page" className="min-h-screen bg-[#0A0A0A] pt-24">
      {/* Header */}
      <section className="section-padding max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-['Barlow_Condensed'] font-black uppercase text-white mb-4">
            Contact & Recruiting
          </h1>
          <p className="text-lg text-[#A1A1AA]">
            Connect with our coaching staff and recruiting coordinator
          </p>
        </motion.div>
      </section>

      {/* Contact Cards */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact, index) => (
            <ContactCard key={contact.id} contact={contact} index={index} />
          ))}
        </div>
      </section>

      {/* Social Media */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-['Barlow_Condensed'] font-bold uppercase text-white mb-6">
            Social & Film Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {athlete.hudl_url && (
              <SocialLink
                href={athlete.hudl_url}
                platform="Hudl"
                handle="View Profile"
                color="bg-[#FF6B00]"
                testId="social-hudl"
              />
            )}
            {athlete.twitter_handle && (
              <SocialLink
                href={`https://twitter.com/${athlete.twitter_handle}`}
                platform="X / Twitter"
                handle={`@${athlete.twitter_handle}`}
                color="bg-[#1DA1F2]"
                testId="social-twitter"
              />
            )}
            {athlete.instagram_handle && (
              <SocialLink
                href={`https://instagram.com/${athlete.instagram_handle}`}
                platform="Instagram"
                handle={`@${athlete.instagram_handle}`}
                color="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]"
                testId="social-instagram"
              />
            )}
          </div>
        </motion.div>
      </section>

      {/* NCAA Compliance Statement */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-solid p-6 border-l-4 border-[#007AFF]"
          data-testid="ncaa-statement"
        >
          <h3 className="text-lg font-bold text-white mb-3">NCAA Recruiting Statement</h3>
          <p className="text-[#A1A1AA] leading-relaxed">
            {athlete.full_name} is currently a prospective student-athlete in the Class of {athlete.graduation_year}. 
            All communication with college coaches should comply with NCAA recruiting rules and regulations. 
            Direct contact should be initiated through the high school coaching staff listed above. 
            NCAA ID: <span className="text-[#007AFF] font-mono">{athlete.ncaa_id}</span>
          </p>
        </motion.div>
      </section>

      {/* Quick Contact Form */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-['Barlow_Condensed'] font-bold uppercase text-white mb-6">
            Quick Message
          </h2>

          <QuickContactForm athleteName={athlete.full_name} />
        </motion.div>
      </section>
    </div>
  );
}

function ContactCard({ contact, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="card-solid p-6"
      data-testid={`contact-card-${index}`}
    >
      <div className="flex items-start gap-4 mb-6">
        {contact.photo_url ? (
          <img
            src={contact.photo_url}
            alt={contact.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#27272A]"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#1E1E1E] flex items-center justify-center border-2 border-[#27272A]">
            <User className="w-8 h-8 text-[#A1A1AA]" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-bold text-white">{contact.name}</h3>
          <p className="text-[#007AFF] text-sm">{contact.title}</p>
          {contact.school && <p className="text-[#A1A1AA] text-sm">{contact.school}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-3 text-[#A1A1AA] hover:text-white transition-colors group"
          data-testid={`contact-email-${index}`}
        >
          <div className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center group-hover:bg-[#007AFF] transition-colors">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-sm">{contact.email}</span>
        </a>

        <a
          href={`tel:${contact.phone}`}
          className="flex items-center gap-3 text-[#A1A1AA] hover:text-white transition-colors group"
          data-testid={`contact-phone-${index}`}
        >
          <div className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center group-hover:bg-[#10B981] transition-colors">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-sm">{contact.phone}</span>
        </a>
      </div>
    </motion.div>
  );
}

function SocialLink({ href, platform, handle, color, testId }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testId}
    >
      <motion.div
        whileHover={{ y: -4 }}
        className="card-solid p-4 flex items-center gap-4 hover:border-white/20 transition-colors"
      >
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <ExternalLink className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-medium">{platform}</div>
          <div className="text-sm text-[#A1A1AA]">{handle}</div>
        </div>
      </motion.div>
    </a>
  );
}

function QuickContactForm({ athleteName }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    school: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate form submission (in production, this would send to an endpoint)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Message sent! The coaching staff will be in touch soon.");
    setFormData({ name: "", email: "", school: "", message: "" });
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card-solid p-6" data-testid="contact-form">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-[#A1A1AA] mb-2 block">Your Name</label>
          <Input
            type="text"
            placeholder="Coach John Smith"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            data-testid="form-name"
            className="bg-[#1E1E1E] border-[#27272A] text-white placeholder:text-[#A1A1AA]"
          />
        </div>
        <div>
          <label className="text-sm text-[#A1A1AA] mb-2 block">Email</label>
          <Input
            type="email"
            placeholder="coach@university.edu"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            data-testid="form-email"
            className="bg-[#1E1E1E] border-[#27272A] text-white placeholder:text-[#A1A1AA]"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm text-[#A1A1AA] mb-2 block">School/Program</label>
        <Input
          type="text"
          placeholder="State University Football"
          value={formData.school}
          onChange={(e) => setFormData({ ...formData, school: e.target.value })}
          data-testid="form-school"
          className="bg-[#1E1E1E] border-[#27272A] text-white placeholder:text-[#A1A1AA]"
        />
      </div>

      <div className="mb-6">
        <label className="text-sm text-[#A1A1AA] mb-2 block">Message</label>
        <Textarea
          placeholder={`I'm interested in learning more about ${athleteName}...`}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          rows={4}
          data-testid="form-message"
          className="bg-[#1E1E1E] border-[#27272A] text-white placeholder:text-[#A1A1AA] resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        data-testid="form-submit"
        className="w-full btn-primary bg-[#007AFF] hover:bg-[#0062C4] text-white h-12"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send Message
          </span>
        )}
      </Button>
    </form>
  );
}
