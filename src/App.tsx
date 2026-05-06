/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, db, signInWithGoogle, logout } from './lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserData } from './types';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Sidebar from './components/Sidebar';
import FoodLogger from './components/FoodLogger';
import { Layout, LogIn, Utensils, BarChart3, User as UserIcon, Droplets, Target, Sparkles, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'meals' | 'habits' | 'profile'>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            // New user, will need onboarding
            setUserData(null);
          }
        } catch (error) {
          try {
            const { handleFirestoreError, OperationType } = await import('./lib/firebase');
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          } catch (e) {
            console.error("Critical Firestore error and failed to load error handler", error);
          }
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleOnboardingComplete = async (data: any) => {
    if (!user) return;
    const newUserData: UserData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      profile: data,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.uid), newUserData);
    setUserData(newUserData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="flex justify-center">
            <div className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <Sparkles className="w-12 h-12 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-100 mb-2">NutriMind <span className="text-emerald-400 font-light">AI</span></h1>
            <p className="text-neutral-500">Your intelligent partner for a healthier lifestyle. Personalized insights and behavioral coaching.</p>
          </div>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-neutral-100 text-neutral-950 py-4 rounded-2xl font-bold hover:bg-white transition-all shadow-xl shadow-emerald-900/20"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  if (!userData) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={userData}
        onLogout={logout}
      />
      
      <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <Dashboard user={userData} />
            </motion.div>
          )}
          
          {activeTab === 'meals' && (
            <motion.div
              key="meals"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Nutrition Tracker</h1>
                <p className="text-stone-500">Log meals and let AI analyze your intake.</p>
              </header>
              <FoodLogger user={userData} />
            </motion.div>
          )}
          
          {activeTab === 'habits' && (
             <motion.div
              key="habits"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
             >
               <div className="max-w-2xl mx-auto py-12 text-center text-stone-500">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Habit tracking features coming soon. Keep logging your meals to build your streak!</p>
               </div>
             </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="max-w-2xl"
            >
              <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className="text-stone-500">Update your goals and health metrics.</p>
              </header>
              <div className="bg-white p-6 rounded-3xl border border-stone-200">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                      <UserIcon className="text-emerald-600 w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{userData.displayName}</h3>
                      <p className="text-stone-500">{userData.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-50 rounded-2xl">
                      <p className="text-xs text-stone-400 uppercase font-bold mb-1">Weight</p>
                      <p className="text-xl font-mono">{userData.profile?.weightKg} kg</p>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-2xl">
                      <p className="text-xs text-stone-400 uppercase font-bold mb-1">Height</p>
                      <p className="text-xl font-mono">{userData.profile?.heightCm} cm</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Dietary Goals</p>
                    <div className="flex flex-wrap gap-2">
                      {userData.profile?.dietaryGoals.map(goal => (
                        <span key={goal} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-sm">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-2xl font-medium hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
