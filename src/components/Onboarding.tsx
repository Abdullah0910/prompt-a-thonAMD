import { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { ChevronRight, Check, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: (data: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    dietaryGoals: [],
    allergies: [],
    activityLevel: 'moderate',
    calorieGoal: 2000,
    waterGoal: 2500
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryGoals: prev.dietaryGoals?.includes(goal) 
        ? prev.dietaryGoals.filter(g => g !== goal)
        : [...(prev.dietaryGoals || []), goal]
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-[3rem] shadow-2xl shadow-neutral-950 p-10 md:p-14 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <Sparkles className="w-32 h-32" />
        </div>

        <div className="flex justify-between items-center mb-16">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-10 bg-emerald-500' : 'w-3 bg-neutral-800'}`} />
            ))}
          </div>
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Phase {step} of 3</span>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div>
              <h2 className="text-4xl font-light tracking-tight text-neutral-100 mb-3">Initialize your <span className="italic serif text-emerald-400">Bio-Profile</span></h2>
              <p className="text-neutral-500 leading-relaxed max-w-sm">We calibrate Gemini's intelligence based on your unique physiological baseline.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Age</label>
                <input 
                  type="number" 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors focus:ring-1 focus:ring-emerald-500 outline-none"
                  onChange={e => setFormData({...formData, age: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Gender</label>
                <select 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors focus:ring-1 focus:ring-emerald-500 outline-none appearance-none"
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Weight (kg)</label>
                <input 
                  type="number" 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors focus:ring-1 focus:ring-emerald-500 outline-none"
                  onChange={e => setFormData({...formData, weightKg: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Height (cm)</label>
                <input 
                  type="number" 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors focus:ring-1 focus:ring-emerald-500 outline-none"
                  onChange={e => setFormData({...formData, heightCm: Number(e.target.value)})}
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div>
              <h2 className="text-4xl font-light tracking-tight text-neutral-100 mb-3">Define <span className="italic serif text-emerald-400">Ambitions</span></h2>
              <p className="text-neutral-500 leading-relaxed max-w-sm">Select the behaviors you want NutriMind AI to reinforce.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {['Weight Loss', 'Muscle Gain', 'Healthy Aging', 'Better Sleep', 'Clean Eating', 'Diabetes Care', 'Heart Health', 'Stress Relief'].map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-5 rounded-2xl text-left transition-all border ${
                    formData.dietaryGoals?.includes(goal) 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                      : 'border-neutral-800 bg-neutral-950 text-neutral-500 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                    {goal}
                    {formData.dietaryGoals?.includes(goal) && <Check className="w-4 h-4" />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div>
              <h2 className="text-4xl font-light tracking-tight text-neutral-100 mb-3">Final <span className="italic serif text-emerald-400">Optimization</span></h2>
              <p className="text-neutral-500 leading-relaxed max-w-sm">Your activity level informs the metabolic engine.</p>
            </div>
            
            <div className="space-y-4">
              {[
                { id: 'sedentary', label: 'Minimal Effort', desc: 'Little to no routine exercise' },
                { id: 'light', label: 'Lightly Active', desc: 'Active 1-2 days per week' },
                { id: 'moderate', label: 'Moderately Active', desc: 'Deep exertion 3-5 days per week' },
                { id: 'active', label: 'Performance Focused', desc: 'Full activity 6-7 days per week' }
              ].map(level => (
                <button
                  key={level.id}
                  onClick={() => setFormData({...formData, activityLevel: level.id as any})}
                  className={`p-6 rounded-2xl text-left transition-all border w-full group ${
                    formData.activityLevel === level.id 
                      ? 'border-emerald-500 bg-emerald-500/10' 
                      : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`font-bold transition-colors ${formData.activityLevel === level.id ? 'text-emerald-400' : 'text-neutral-100 group-hover:text-neutral-300'}`}>{level.label}</p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-600 group-hover:text-neutral-500">{level.desc}</p>
                    </div>
                    {formData.activityLevel === level.id && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="mt-16 flex gap-4">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="flex-1 py-5 rounded-2xl font-bold text-neutral-600 hover:text-neutral-400 transition-colors uppercase tracking-widest text-[10px]"
            >
              Previous Phase
            </button>
          )}
          <button 
            onClick={step === 3 ? () => onComplete(formData as UserProfile) : nextStep}
            className="flex-[2] bg-neutral-100 text-neutral-950 py-5 rounded-[2rem] font-bold hover:bg-white transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5"
          >
            {step === 3 ? 'Sync Profile' : 'Proceed'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
