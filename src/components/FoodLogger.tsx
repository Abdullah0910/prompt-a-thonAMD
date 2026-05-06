import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { UserData, MealLog, FoodItem } from '../types';
import { analyzeNutrition } from '../services/gemini';
import { Search, Plus, Loader2, Sparkles, Utensils, History, X, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface FoodLoggerProps {
  user: UserData;
}

export default function FoodLogger({ user }: FoodLoggerProps) {
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [tempResult, setTempResult] = useState<{ items: FoodItem[], totalCalories: number, aiNotes: string } | null>(null);
  const [recentMeals, setRecentMeals] = useState<MealLog[]>([]);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  useEffect(() => {
    fetchRecent();
  }, [user.uid]);

  const fetchRecent = async () => {
    try {
      const q = query(
        collection(db, 'mealLogs'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const snap = await getDocs(q);
      setRecentMeals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MealLog)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'mealLogs');
    }
  };

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setAnalyzing(true);
    try {
      const result = await analyzeNutrition(description);
      setTempResult(result);
    } catch (error) {
      console.error("Analysis failed", error);
    }
    setAnalyzing(false);
  };

  const handleSave = async () => {
    if (!tempResult || !user) return;
    const log: MealLog = {
      userId: user.uid,
      timestamp: new Date().toISOString(),
      mealType,
      items: tempResult.items,
      totalCalories: tempResult.totalCalories,
      aiNotes: tempResult.aiNotes
    };
    
    try {
      await addDoc(collection(db, 'mealLogs'), log);
      setTempResult(null);
      setDescription('');
      fetchRecent();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'mealLogs');
    }
  };

  return (
    <div className="grid grid-cols-12 gap-10 mb-24">
      {/* Logger Section */}
      <div className="col-span-12 lg:col-span-7 space-y-8">
        <div className="bg-neutral-900 p-8 md:p-10 rounded-[2.5rem] border border-neutral-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/20">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Sparkles className="w-5 h-5 text-emerald-400" />
             </div>
             <h3 className="text-xl font-semibold tracking-tight">Intelligent Food Log</h3>
          </div>
          
          <div className="space-y-6">
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Two eggs, a whole wheat toast, and a medium latte"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-6 min-h-[160px] focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder:text-neutral-700 resize-none font-medium text-lg leading-relaxed outline-none"
              />
              {analyzing && (
                <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-[4px] rounded-2xl flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-3 text-emerald-400 font-bold">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-xs uppercase tracking-widest">GEMINI Analyzing...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                    mealType === type 
                      ? 'bg-neutral-100 text-neutral-950 border-neutral-100' 
                      : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-neutral-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing || !description.trim()}
              className="w-full bg-emerald-500 text-neutral-950 py-5 rounded-[2rem] font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-emerald-500/10"
            >
              <Search className="w-4 h-4" />
              Analyze with Gemini
            </button>
          </div>
        </div>

        <AnimatePresence>
          {tempResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-neutral-100 text-neutral-950 p-10 rounded-[2.5rem] shadow-2xl shadow-emerald-500/10 border border-white"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                   <p className="text-[10px] font-bold uppercase text-neutral-500 mb-1 tracking-widest">Nutritional Breakdown</p>
                   <h3 className="text-4xl font-black">{tempResult.totalCalories} kcal</h3>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setTempResult(null)} className="p-4 bg-neutral-200 rounded-full hover:bg-neutral-300 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                  <button onClick={handleSave} className="p-4 bg-emerald-500 text-neutral-950 rounded-full hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                    <Check className="w-5 h-5 font-bold" />
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                {tempResult.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-neutral-200 last:border-0">
                    <div>
                      <p className="font-bold text-lg">{item.name}</p>
                      <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">
                        P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                      </p>
                    </div>
                    <span className="font-mono text-lg font-bold">{item.calories}</span>
                  </div>
                ))}
              </div>

              {tempResult.aiNotes && (
                <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-sm flex gap-4 text-emerald-900">
                   <div className="mt-1">
                      <Sparkles className="w-5 h-5 opacity-50" />
                   </div>
                   <p className="leading-relaxed italic font-medium">"{tempResult.aiNotes}"</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History Section */}
      <div className="col-span-12 lg:col-span-5 space-y-8">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-neutral-600" />
              <h3 className="font-semibold text-neutral-400 uppercase text-xs tracking-widest">Journal History</h3>
           </div>
        </div>

        <div className="space-y-5">
          {recentMeals.length > 0 ? recentMeals.map((meal, i) => (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={meal.id} 
              className="bg-neutral-900 border border-neutral-800 p-6 rounded-[2rem] flex items-center justify-between hover:border-neutral-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-neutral-950 text-neutral-700 rounded-2xl flex items-center justify-center group-hover:bg-neutral-800 group-hover:text-emerald-400 transition-all border border-neutral-800">
                    <Utensils className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="font-bold text-neutral-100 flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                       {meal.items[0].name}
                       {meal.items.length > 1 && <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">+ {meal.items.length - 1} items</span>}
                    </h4>
                    <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mt-1">
                       {meal.mealType} • {format(new Date(meal.timestamp), 'h:mm a')}
                    </p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-2xl font-light text-neutral-100">{meal.totalCalories}</p>
                 <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Kcal</p>
              </div>
            </motion.div>
          )) : (
            <div className="bg-neutral-900/30 border border-neutral-800 p-12 rounded-[2.5rem] text-center text-neutral-600">
               <p className="text-sm">No entries recorded in your journal yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
