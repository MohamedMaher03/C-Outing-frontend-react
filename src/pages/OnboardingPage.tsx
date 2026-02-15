import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { cn } from "../libs/utils";
import { INTERESTS, DISTRICTS } from "../data/mockData";
import logo from "../assets/images/logo2.png";
import cairoBackground from "../assets/images/cairo-bg-onboarding.jpg";

const STEPS = ["Interests", "Vibe", "Areas", "Budget"];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [vibe, setVibe] = useState([50]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [budget, setBudget] = useState<string | null>(null);

  const toggleInterest = (id: string) =>
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  const toggleDistrict = (d: string) =>
    setSelectedDistricts((prev) =>
      prev.includes(d) ? prev.filter((i) => i !== d) : [...prev, d],
    );

  const canNext =
    (step === 0 && selectedInterests.length >= 2) ||
    step === 1 ||
    (step === 2 && selectedDistricts.length >= 1) ||
    (step === 3 && budget !== null);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else navigate("/home");
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-md scale-110"
        style={{ backgroundImage: `url(${cairoBackground})` }}
      />
      <div className="absolute inset-0 bg-primary/70" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-center gap-3">
            <img src={logo} alt="C-Outing" className="h-10 w-auto rounded-lg" />
            <h1 className="text-2xl font-bold text-primary">C-OUTING</h1>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 justify-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i <= step ? "bg-primary w-10" : "bg-muted w-6",
                  )}
                />
              </div>
            ))}
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
            >
              {/* STEP 1 - Interests */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold text-primary">
                      What do you love?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Pick at least 2 interests to personalize your feed
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {INTERESTS.map((item) => {
                      const selected = selectedInterests.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleInterest(item.id)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
                            selected
                              ? "border-secondary bg-secondary/15 text-secondary shadow-sm"
                              : "border-border bg-card text-muted-foreground hover:border-secondary/40",
                          )}
                        >
                          <span className="text-lg">{item.emoji}</span>
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2 - Vibe */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold text-primary">
                      What's your vibe?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Drag the slider to match your energy
                    </p>
                  </div>

                  <div className="space-y-6 px-4">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-muted-foreground">
                        🧘 Quiet & Chilled
                      </span>
                      <span className="text-muted-foreground">
                        🎉 Energetic & Loud
                      </span>
                    </div>

                    <Slider
                      value={vibe}
                      onValueChange={setVibe}
                      max={100}
                      step={1}
                    />

                    <div className="text-center">
                      <span className="text-4xl">
                        {vibe[0] < 30 ? "🧘" : vibe[0] < 70 ? "😊" : "🎉"}
                      </span>
                      <p className="text-sm text-muted-foreground mt-2">
                        {vibe[0] < 30
                          ? "You prefer calm, peaceful spots"
                          : vibe[0] < 70
                            ? "You enjoy a balanced atmosphere"
                            : "You love buzzing, energetic places"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 - Districts */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold text-primary">
                      Where in Cairo?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Select your favorite districts
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {DISTRICTS.map((d) => {
                      const selected = selectedDistricts.includes(d);
                      return (
                        <button
                          key={d}
                          onClick={() => toggleDistrict(d)}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                            selected
                              ? "border-secondary bg-secondary/15 text-secondary"
                              : "border-border bg-card text-muted-foreground hover:border-secondary/40",
                          )}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4 - Budget */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold text-primary">
                      What's your budget?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Select a price range that suits you
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    {["Low", "Medium", "High"].map((b) => (
                      <button
                        key={b}
                        onClick={() => setBudget(b)}
                        className={cn(
                          "px-6 py-3 rounded-xl text-sm font-medium border transition-all duration-200",
                          budget === b
                            ? "border-secondary bg-secondary/15 text-secondary"
                            : "border-border bg-card text-muted-foreground hover:border-secondary/40",
                        )}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-between">
            <Button
              variant="ghost"
              onClick={() => step > 0 && setStep(step - 1)}
              disabled={step === 0}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canNext}
              className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6"
            >
              {step === 3 ? (
                <>
                  <Sparkles className="h-4 w-4" /> Start Exploring
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
