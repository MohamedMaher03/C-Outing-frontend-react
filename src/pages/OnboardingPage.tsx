/* 
Needed changes when integrating with .net backend:
replace the mock data with API calls to fetch interests and districts
on completion, send the selected preferences to the backend to save in the user's profile
*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { cn } from "../libs/utils";
import { INTERESTS, DISTRICTS } from "../data/mockData";
import logo from "../assets/images/logo2.png";

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-3">
          <img src={logo} alt="C-Outing" className="h-10 w-auto rounded-lg" />
          <h1 className="text-2xl font-bold text-foreground">C-OUTING</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 justify-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  i <= step ? "bg-secondary w-10" : "bg-muted w-6",
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
            {step === 0 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold text-foreground">
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
                          "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                          selected
                            ? "border-secondary bg-secondary/10 text-foreground shadow-sm"
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

            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold text-foreground">
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

            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold text-foreground">
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
                          "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                          selected
                            ? "border-secondary bg-secondary/10 text-foreground"
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
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold text-foreground">
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
                        "px-6 py-3 rounded-xl text-sm font-medium border transition-all",
                        budget === b
                          ? "border-secondary bg-secondary/10 text-foreground"
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
            className="gap-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold px-6"
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
  );
};

export default OnboardingPage;
