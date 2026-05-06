import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, limit, orderBy, addDoc } from 'firebase/firestore';
import { UserData, MealLog, WaterLog } from '../types';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sparkles, Utensils, Droplets, Flame, Brain, ArrowUpRight, TrendingUp, Target } from 'lucide-react';
import { format, startOfDay, subDays } from 'date-fns';
import { getHealthRecommendations } from '../services/gemini';

interface DashboardProps {
  user: UserData;
}

export default function Dashboard({ user }: DashboardProps) {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [water, setWater] = useState<WaterLog[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const today = startOfDay(new Date());
      
      const mealsQuery = query(
        collection(db, 'mealLogs'),
        where('userId', '==', user.uid),
        where('timestamp', '>=', today.toISOString()),
        orderBy('timestamp', 'desc')
      );
      
      const waterQuery = query(
        collection(db, 'waterLogs'),
        where('userId', '==', user.uid),
        where('timestamp', '>=', today.toISOString()),
        orderBy('timestamp', 'desc')
      );
      
      try {
        const [mealsSnapshot, waterSnapshot] = await Promise.all([
          getDocs(mealsQuery),
          getDocs(waterQuery)
        ]);
        
        setMeals(mealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MealLog)));
        setWater(waterSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WaterLog)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'mealLogs/waterLogs');
      }
    };
    
    fetchData();
  }, [user.uid]);

  useEffect(() => {
    const fetchRecs = async () => {
      if (recommendations.length > 0) return;
      setLoadingRecs(true);
      try {
        const recs = await getHealthRecommendations(user, meals.slice(0, 5));
        setRecommendations(recs);
      } catch (error) {
        console.error("Failed to fetch recommendations", error);
      }
      setLoadingRecs(false);
    };
    
    if (meals.length > 0 || !loadingRecs) {
      fetchRecs();
    }
  }, [meals, user]);

  const handleAddWater = async () => {
    try {
      const newLog: WaterLog = {
        userId: user.uid,
        timestamp: new Date().toISOString(),
        amountMl: 250
      };
      const docRef = await addDoc(collection(db, 'waterLogs'), newLog);
      setWater(prev => [{ id: docRef.id, ...newLog }, ...prev]);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'waterLogs');
    }
  };

  const totalCalories = meals.reduce((sum, m) => sum + m.totalCalories, 0);
  const totalWater = water.reduce((sum, w) => sum + w.amountMl, 0);
  
  const chartData = [
    { name: 'Goal', value: user.profile?.calorieGoal || 2000, fill: '#f5f5f4' },
    { name: 'Consumed', value: totalCalories, fill: totalCalories > (user.profile?.calorieGoal || 2000) ? '#ef4444' : '#10b981' }
  ];

  const macros = meals.reduce((acc, m) => {
    m.items.forEach(item => {
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
    });
    return acc;
  }, { protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="space-y-10 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-neutral-100">
            Good day, <span className="italic serif text-emerald-400">{user.displayName?.split(' ')[0]}</span>
          </h2>
          <p className="text-neutral-500 mt-1">Here's your nutritional overview for today, {format(new Date(), 'MMMM d')}.</p>
        </div>
        <div className="flex bg-neutral-900 border border-neutral-800 p-2 rounded-2xl items-center gap-4">
           <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest">
              NutriScore: A+
           </div>
           <div className="h-4 w-px bg-neutral-800"></div>
           <span className="text-xs text-neutral-500">72°F • Post-Run</span>
        </div>
      </header>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Health Score Circle Card */}
        <section className="col-span-12 md:col-span-4 bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center">
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6">Health Score</h2>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="80" cy="80" r="74" fill="none" stroke="#262626" strokeWidth="8" />
              <circle 
                cx="80" cy="80" r="74" fill="none" 
                stroke="#10b981" strokeWidth="8" 
                strokeDasharray="465" 
                strokeDashoffset={465 - (465 * 0.85)} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-light">85</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Optimal</span>
            </div>
          </div>
          <p className="mt-8 text-xs text-center text-neutral-500 leading-relaxed italic max-w-[200px]">
            "Your metabolic rate is peaking. Ideal time for protein intake."
          </p>
        </section>

        {/* Calorie Tracking Card */}
        <section className="col-span-12 md:col-span-8 bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Calorie Balance</h2>
              <p className="text-2xl font-light">Remaining <span className="text-emerald-400 font-medium">{(user.profile?.calorieGoal || 2000) - totalCalories} kcal</span></p>
            </div>
            <div className="p-3 bg-neutral-950/50 rounded-2xl border border-neutral-800">
               <Flame className="w-5 h-5 text-orange-500" />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-3">
                <span className="text-neutral-400">Daily Progress</span>
                <span className="text-neutral-600">{totalCalories} / {user.profile?.calorieGoal} kcal</span>
              </div>
              <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalCalories / (user.profile?.calorieGoal || 2000)) * 100, 100)}%` }}
                  className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-neutral-800/30 border border-neutral-800 rounded-2xl p-4 transition-all hover:border-neutral-700">
                <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Protein</div>
                <div className="text-xl font-medium">{Math.round(macros.protein)}g</div>
                <div className="mt-2 text-[10px] text-emerald-400 font-bold uppercase">72% of goal</div>
              </div>
              <div className="bg-neutral-800/30 border border-neutral-800 rounded-2xl p-4 transition-all hover:border-neutral-700">
                <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Carbs</div>
                <div className="text-xl font-medium">{Math.round(macros.carbs)}g</div>
                <div className="mt-2 text-[10px] text-neutral-400 font-bold uppercase">45% of goal</div>
              </div>
              <div className="bg-neutral-800/30 border border-neutral-800 rounded-2xl p-4 transition-all hover:border-neutral-700">
                <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Fats</div>
                <div className="text-xl font-medium">{Math.round(macros.fat)}g</div>
                <div className="mt-2 text-[10px] text-neutral-400 font-bold uppercase">28% of goal</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Recommendation Card */}
        <section className="col-span-12 lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Utensils className="w-48 h-48 rotate-12" />
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase tracking-widest">AI recommendation</span>
              <span className="text-xs text-neutral-600">Syncing with activity data</span>
            </div>
            
            {loadingRecs ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-12 bg-neutral-800 rounded-xl w-3/4"></div>
                <div className="h-20 bg-neutral-800 rounded-xl"></div>
              </div>
            ) : recommendations[0] ? (
              <>
                <h3 className="text-4xl font-light leading-tight mb-6">
                  {recommendations[0].title.split('&').map((p: string, i: number) => (
                    <span key={i}>
                      {i > 0 && <br/>}
                      {i % 2 !== 0 ? <span className="italic serif text-emerald-400">{p}</span> : p}
                    </span>
                  ))}
                </h3>
                <p className="text-neutral-400 leading-relaxed max-w-md text-lg">
                  {recommendations[0].suggestion}
                </p>
              </>
            ) : (
              <p className="text-neutral-500">Log some activity to generate smart recommendations.</p>
            )}
          </div>

          <div className="mt-12 flex flex-col md:flex-row gap-8">
            <div className="flex gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mb-1">Status</span>
                <span className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Aligned with Goals
                </span>
              </div>
              <div className="w-px bg-neutral-800 hidden md:block"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mb-1">Constraint</span>
                <span className="text-sm font-medium text-neutral-400">Sodium Limit Alert</span>
              </div>
            </div>
            <div className="md:ml-auto flex gap-3">
              <button className="px-8 py-4 bg-neutral-100 text-neutral-950 font-bold rounded-2xl hover:bg-white transition-all shadow-xl shadow-white/5">
                Optimize Now
              </button>
            </div>
          </div>
        </section>

        {/* Sidebar Insights */}
        <section className="col-span-12 lg:col-span-5 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6">Hydration Loop</h2>
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 8 }).map((_, i) => {
                const goal = user.profile?.waterGoal || 2500;
                const filled = (totalWater / goal) * 8 > i;
                return (
                  <div 
                    key={i} 
                    className={`w-10 h-14 rounded-xl transition-all ${
                      filled ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'border border-neutral-800 bg-neutral-950/30'
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-6">
               <p className="text-xs text-neutral-500 font-medium">Goal: {user.profile?.waterGoal || 2500}ml • {totalWater}ml logged</p>
               <button 
                 onClick={handleAddWater}
                 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  Add 250ml +
                </button>
            </div>
          </div>

          <div className="bg-emerald-500 border border-emerald-400 rounded-[2.5rem] p-8 text-neutral-950 group cursor-pointer overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
               <Sparkles className="w-32 h-32" />
            </div>
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Smart Habit Streak</span>
              <div className="w-8 h-8 rounded-full bg-neutral-950 flex items-center justify-center text-emerald-500">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-3xl font-bold leading-tight mb-4">7 Day Sugar <br/>Free Streak</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black">5</span>
              <span className="text-sm font-bold uppercase opacity-60 tracking-widest">/ 7 Days</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
