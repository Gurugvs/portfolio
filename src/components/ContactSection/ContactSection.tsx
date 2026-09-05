import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MapPin, Mail, Phone, Github, Linkedin, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Input } from "../lightswind/input";
import { Textarea } from "../lightswind/textarea";
import { Button } from "../lightswind/button";

export const ContactSection = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [sentToEmail, setSentToEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("https://formsubmit.co/ajax/guru2005savi@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: `Portfolio Contact Message from ${formData.name}`,
          _template: "table",
          _captcha: "false",
        }),
      });

      if (res.ok) {
        setSentToEmail(formData.email);
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        throw new Error("Failed to send");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="max-w-7xl mx-auto px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
        className="glass-panel p-8 md:p-12 rounded-[3rem] border border-foreground/10 relative overflow-hidden"
      >
        {/* Background Gradients */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-12 md:gap-24">
          
          {/* Contact Info */}
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Let's <span className="text-gradient-primary">Connect</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Currently open for job opportunities, internships, and engineering projects. 
                Whether you have an opening, project inquiry, or just want to connect, feel free to reach out!
              </p>
            </div>

            <div className="space-y-4">
              <a 
                href="mailto:guru2005savi@gmail.com" 
                className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover:scale-110 group-hover:border-primary/40 transition-all">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-semibold">Email</span>
                  <span className="font-medium text-foreground">guru2005savi@gmail.com</span>
                </div>
              </a>

              <a 
                href="tel:+917448577857" 
                className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover:scale-110 group-hover:border-primary/40 transition-all">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-semibold">Phone</span>
                  <span className="font-medium text-foreground">+91 7448577857</span>
                </div>
              </a>

              <div className="flex items-center gap-4 text-muted-foreground group">
                <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-semibold">Location</span>
                  <span className="font-medium text-foreground">Karur, Tamil Nadu, India</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <a 
                  href="https://github.com/Gurugvs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-foreground hover:text-primary hover:border-primary/40 transition-all flex items-center gap-2"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
                <a 
                  href="https://www.linkedin.com/in/guru-thiyanesh-b189b3380" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-foreground hover:text-primary hover:border-primary/40 transition-all flex items-center gap-2"
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 glass-panel p-8 rounded-[2rem] border border-foreground/10 relative flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center py-6 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">
                      Message Delivered!
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
                      Thank you! Your message has been sent directly to Guru Thiyanesh. A response will be sent to <span className="font-semibold text-foreground">{sentToEmail}</span> shortly.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStatus("idle")}
                    className="rounded-xl px-6 border-foreground/10 hover:border-primary/40 mt-2 cursor-pointer"
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                  onSubmit={handleSubmit}
                >
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                      Your Name
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl py-3 px-4 bg-foreground/5 border-foreground/10 text-foreground focus-visible:ring-primary placeholder:text-muted-foreground/50"
                      placeholder="John Doe"
                      disabled={status === "loading"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                      Your Email
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl py-3 px-4 bg-foreground/5 border-foreground/10 text-foreground focus-visible:ring-primary placeholder:text-muted-foreground/50"
                      placeholder="john@example.com"
                      disabled={status === "loading"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                      Message
                    </label>
                    <Textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="rounded-xl py-3 px-4 bg-foreground/5 border-foreground/10 text-foreground focus-visible:ring-primary resize-none placeholder:text-muted-foreground/50 min-h-[120px]"
                      placeholder="How can I help you?"
                      disabled={status === "loading"}
                    />
                  </div>

                  {status === "error" && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Could not send via network.</span>
                      </div>
                      <a
                        href={`mailto:guru2005savi@gmail.com?subject=Portfolio%20Message%20from%20${encodeURIComponent(formData.name)}&body=${encodeURIComponent(formData.message)}`}
                        className="underline font-semibold hover:opacity-80 shrink-0"
                      >
                        Send via Email App ↗
                      </a>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={status === "loading"}
                    size="lg"
                    className="w-full rounded-xl bg-primary text-primary-foreground font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] mt-4 h-12 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {status === "loading" ? (
                      <>
                        <span>Sending...</span>
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

        </div>
      </motion.div>
    </section>
  );
};
