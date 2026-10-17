import React, { createContext, useContext, useState, useEffect } from 'react';
import { studentApi, donationsApi, authApi } from '../api/formulasApi';

const StudentContext = createContext();

const DEFAULT_PROFILE = {
  display_name: 'Santunu Math Scholar',
  avatar: '∑',
  institution: 'Dhaka College · Science Dept',
  bio: 'Visualizing mathematical intuition, calculus derivations, and physics simulations.',
  target_exam: 'HSC Higher Math 2026',
  target_exam_date: '2026-06-15',
  daily_goal_formulas: 5,
  study_streak_days: 7,
  xp_points: 425,
  total_focus_minutes: 50,
  completed_focus_sessions: 2,
  completed_labs: ['circle-area', 'quadratic', 'derivative'],
  unlocked_badges: ['first_step', 'streak_3', 'lab_explorer'],
  daily_activity_map: {
    [new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0]]: 4,
    [new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0]]: 6,
    [new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0]]: 8,
    [new Date().toISOString().split('T')[0]]: 5,
  },
  last_active_date: new Date().toISOString().split('T')[0]
};

const LEVEL_TITLES = [
  "Math Novice",
  "Formula Apprentice",
  "Derivation Specialist",
  "Geometric Intuitive",
  "Euler Scholar",
  "Lagrange Pioneer",
  "Gauss Master",
  "Quantum Theorist",
  "Field Medalist",
  "Grand Mathematical Archmage"
];

export function StudentProvider({ children }) {
  // Global modal triggers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [activeSolverSlug, setActiveSolverSlug] = useState(null);

  // Authentication State
  const [authToken, setAuthToken] = useState(() => {
    try {
      return localStorage.getItem('btm_auth_token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('btm_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(authToken && user);

  // Auth Modal & Scholar Card Dialog State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const [isScholarCardOpen, setIsScholarCardOpen] = useState(false);

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Student Profile state
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('btm_student_profile');
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // XP Toast notification
  const [xpToast, setXpToast] = useState(null);

  // Comparison Dock (up to 3 formulas)
  const [compareList, setCompareList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('btm_compare_list') || '[]');
    } catch {
      return [];
    }
  });

  // Bookmarks
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('btm_bookmarks') || '[]'));
    } catch {
      return new Set();
    }
  });

  // Personal Notes
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('btm_notes') || '{}');
    } catch {
      return {};
    }
  });

  // Practice Score with streak tracking
  const [practiceScore, setPracticeScore] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('btm_practice_score') || '{}');
      return {
        correct: saved.correct || 0,
        attempted: saved.attempted || 0,
        streak: saved.streak || 0,
        bestStreak: saved.bestStreak || 0
      };
    } catch {
      return { correct: 0, attempted: 0, streak: 0, bestStreak: 0 };
    }
  });

  // Donation modal triggers & supporters
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donationPreselectedTier, setDonationPreselectedTier] = useState(null);
  const [donationCurrency, setDonationCurrency] = useState(() => {
    try {
      return localStorage.getItem('btm_donation_currency') || 'BDT';
    } catch {
      return 'BDT';
    }
  });

  const initialSupporters = [
    {
      id: 'sup-bd-1',
      name: 'Tanvir Ahmed',
      role: 'CSE · BUET',
      avatar: '🇧🇩',
      amount: 1500,
      currency: 'BDT',
      provider: 'bKash',
      tier: 'Visual Lab Creator',
      isMonthly: true,
      date: '1 hour ago',
      message: 'Snell\'s Law and Big O labs helped our whole engineering batch! Proud bKash supporter via 01631009941.',
      likes: 56,
    },
    {
      id: 'sup-bd-2',
      name: 'Nusrat Jahan',
      role: 'HSC Class 12 · Viqarunnisa Noon, Dhaka',
      avatar: '📐',
      amount: 500,
      currency: 'BDT',
      provider: 'Nagad',
      tier: 'Guide & Mentor Coffee',
      isMonthly: false,
      date: 'Yesterday',
      message: 'Higher math derivatives and integration got so clear! Sent money from Nagad to 01631009941.',
      likes: 38,
    },
    {
      id: 'sup-bd-3',
      name: 'Mahmudul Hasan',
      role: 'Applied Physics · University of Dhaka',
      avatar: '⚡',
      amount: 1000,
      currency: 'BDT',
      provider: 'Rocket',
      tier: 'Visual Lab Creator',
      isMonthly: false,
      date: '2 days ago',
      message: 'Lorentz time dilation lab is incredible. Paid through DBBL Rocket to 01631009941.',
      likes: 29,
    },
  ];

  const [supporters, setSupporters] = useState(() => {
    try {
      const saved = localStorage.getItem('btm_supporters');
      return saved ? JSON.parse(saved) : initialSupporters;
    } catch {
      return initialSupporters;
    }
  });

  // Synchronize with Django backend on initial mount
  useEffect(() => {
    let isMounted = true;

    // 1. Fetch live donations from Django backend
    const syncDonations = async () => {
      try {
        const res = await donationsApi.getRecentDonations();
        if (isMounted && res && Array.isArray(res.donations) && res.donations.length > 0) {
          const formatted = res.donations.map((d) => {
            const amt = parseFloat(d.amount) || 500;
            return {
              id: `trx-${d.id || d.trx_id || Math.random()}`,
              name: d.sender_name || 'Generous Supporter',
              role: d.sender_role || 'STEM Supporter',
              avatar: d.provider === 'bkash' ? '🇧🇩' : d.provider === 'nagad' ? '📐' : '⚡',
              amount: amt,
              currency: d.currency || 'BDT',
              provider: d.provider === 'bkash' ? 'bKash' : d.provider === 'nagad' ? 'Nagad' : d.provider === 'rocket' ? 'Rocket' : (d.provider === 'googlepay' ? 'Google Pay' : 'bKash'),
              tier: amt >= 1000 ? 'Visual Lab Creator' : 'Guide & Mentor Coffee',
              isMonthly: Boolean(d.is_monthly),
              date: d.formatted_date || 'Recently',
              message: d.message || 'Supported free math education.',
              likes: 28,
              trx_id: d.trx_id
            };
          });

          setSupporters((prev) => {
            const seenIds = new Set(formatted.map((f) => f.trx_id || f.id));
            const retained = prev.filter((p) => !seenIds.has(p.trx_id || p.id));
            const merged = [...formatted, ...retained];
            try {
              localStorage.setItem('btm_supporters', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      } catch (err) {
        console.warn('Recent donations sync note:', err);
      }
    };

    // 2. Authenticate and hydrate student profile, bookmarks, and notes
    const initializeAuthAndProfile = async () => {
      const currentToken = localStorage.getItem('btm_auth_token');
      if (currentToken) {
        try {
          const authData = await authApi.getMe();
          if (authData && authData.is_authenticated && authData.user) {
            setUser(authData.user);
            localStorage.setItem('btm_user', JSON.stringify(authData.user));
            if (authData.profile) {
              setProfile((prev) => {
                const merged = { ...prev, ...authData.profile };
                localStorage.setItem('btm_student_profile', JSON.stringify(merged));
                return merged;
              });
            }

            // Sync user's cloud bookmarks and notes
            try {
              const [bms, nts] = await Promise.all([
                studentApi.getBookmarks(),
                studentApi.getNotes()
              ]);
              if (isMounted && Array.isArray(bms) && bms.length > 0) {
                setBookmarks((prev) => {
                  const next = new Set(prev);
                  bms.forEach((b) => {
                    if (b.formula_detail?.slug) next.add(b.formula_detail.slug);
                    if (b.formula_detail?.formula_id) next.add(b.formula_detail.formula_id);
                    if (b.formula) next.add(b.formula);
                  });
                  return next;
                });
              }
              if (isMounted && Array.isArray(nts) && nts.length > 0) {
                setNotes((prev) => {
                  const next = { ...prev };
                  nts.forEach((n) => {
                    if (n.formula) next[n.formula] = n.note_text;
                    if (n.formula_title) next[n.formula_title] = n.note_text;
                  });
                  return next;
                });
              }
            } catch (syncErr) {
              console.warn('Cloud bookmarks/notes sync note:', syncErr);
            }

            return;
          }
        } catch (e) {
          console.warn('Auth token verification failed:', e);
          localStorage.removeItem('btm_auth_token');
          localStorage.removeItem('btm_user');
          setAuthToken(null);
          setUser(null);
        }
      }

      // Guest profile fallback sync
      try {
        const data = await studentApi.getProfile();
        if (data && data.display_name) {
          setProfile((prev) => {
            const merged = { ...prev, ...data };
            localStorage.setItem('btm_student_profile', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.warn('Using local student profile cache:', err);
      }
    };

    syncDonations();
    initializeAuthAndProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save profile to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('btm_student_profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [profile]);

  // Save other local states
  useEffect(() => {
    localStorage.setItem('btm_compare_list', JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    localStorage.setItem('btm_bookmarks', JSON.stringify(Array.from(bookmarks)));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('btm_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('btm_practice_score', JSON.stringify(practiceScore));
  }, [practiceScore]);

  // Derived level progression
  const level = Math.floor(profile.xp_points / 200) + 1;
  const levelTitle = LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.max(0, level - 1))];
  const nextLevelXp = level * 200;
  const levelProgressPct = Math.min(100, Math.floor(((profile.xp_points % 200) / 200) * 100));

  // Log daily activity for heatmap
  const logActivity = (actionType = 'general') => {
    const today = new Date().toISOString().split('T')[0];
    setProfile((prev) => {
      const currentMap = { ...(prev.daily_activity_map || {}) };
      currentMap[today] = (currentMap[today] || 0) + 1;
      const updated = { ...prev, daily_activity_map: currentMap };
      localStorage.setItem('btm_student_profile', JSON.stringify(updated));
      return updated;
    });
    studentApi.logActivity?.().catch(() => {});
  };

  // Login handler
  const login = async (username, password) => {
    const data = await authApi.login({ username, password });
    if (data && data.token) {
      localStorage.setItem('btm_auth_token', data.token);
      localStorage.setItem('btm_user', JSON.stringify(data.user));
      setAuthToken(data.token);
      setUser(data.user);
      if (data.profile) {
        setProfile((prev) => {
          const merged = { ...prev, ...data.profile };
          localStorage.setItem('btm_student_profile', JSON.stringify(merged));
          return merged;
        });
      }
      setIsAuthModalOpen(false);
      setXpToast({ amount: 50, reason: `Welcome back, ${data.user.full_name || data.user.username}! ✨` });
      setTimeout(() => setXpToast(null), 3200);
      return data;
    }
    throw new Error(data?.error || 'Failed to login');
  };

  // Register handler with optional guest migration
  const register = async (registerData, shouldMigrateGuest = true) => {
    const guestProgress = shouldMigrateGuest ? {
      xp_points: profile.xp_points,
      completed_labs: profile.completed_labs,
      unlocked_badges: profile.unlocked_badges,
      total_focus_minutes: profile.total_focus_minutes,
      completed_focus_sessions: profile.completed_focus_sessions,
      bookmarks: Array.from(bookmarks),
      notes: notes,
      daily_activity_map: profile.daily_activity_map,
    } : {};

    const data = await authApi.register({ ...registerData, guest_progress: guestProgress });
    if (data && data.token) {
      localStorage.setItem('btm_auth_token', data.token);
      localStorage.setItem('btm_user', JSON.stringify(data.user));
      setAuthToken(data.token);
      setUser(data.user);
      if (data.profile) {
        setProfile((prev) => {
          const merged = { ...prev, ...data.profile };
          localStorage.setItem('btm_student_profile', JSON.stringify(merged));
          return merged;
        });
      }
      setIsAuthModalOpen(false);
      setXpToast({ amount: 100, reason: `Account Created! Cloud Sync Active 🚀` });
      setTimeout(() => setXpToast(null), 3200);
      return data;
    }
    throw new Error(data?.error || 'Registration failed');
  };

  // Logout handler
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Logout API note:', e);
    }
    localStorage.removeItem('btm_auth_token');
    localStorage.removeItem('btm_user');
    setAuthToken(null);
    setUser(null);
    setProfile(DEFAULT_PROFILE);
    localStorage.setItem('btm_student_profile', JSON.stringify(DEFAULT_PROFILE));
    setXpToast({ amount: 0, reason: 'Logged out. Switched to Guest Mode.' });
    setTimeout(() => setXpToast(null), 2500);
  };

  // Award XP with notification and badge checking
  const awardXp = (amount, reason = 'Study Activity') => {
    setProfile((prev) => {
      const newXp = prev.xp_points + amount;
      const updatedBadges = [...(prev.unlocked_badges || [])];

      if (newXp >= 500 && !updatedBadges.includes('century_club')) {
        updatedBadges.push('century_club');
      }

      const today = new Date().toISOString().split('T')[0];
      const activityMap = { ...(prev.daily_activity_map || {}) };
      activityMap[today] = (activityMap[today] || 0) + 1;

      const updated = {
        ...prev,
        xp_points: newXp,
        unlocked_badges: updatedBadges,
        daily_activity_map: activityMap,
      };

      // Background sync with Django
      studentApi.awardXp(amount).catch(() => {});

      return updated;
    });

    // Show reward toast
    setXpToast({ amount, reason });
    setTimeout(() => {
      setXpToast(null), 2800;
    }, 2800);
  };

  // Complete a visual lab
  const completeLab = (labSlug) => {
    if (!labSlug) return;
    if (profile.completed_labs?.includes(labSlug)) return;

    setProfile((prev) => {
      const currentLabs = prev.completed_labs || [];
      if (currentLabs.includes(labSlug)) return prev;

      const newLabs = [...currentLabs, labSlug];
      const updatedBadges = [...(prev.unlocked_badges || [])];

      if (newLabs.length >= 3 && !updatedBadges.includes('lab_explorer')) {
        updatedBadges.push('lab_explorer');
      }

      const today = new Date().toISOString().split('T')[0];
      const activityMap = { ...(prev.daily_activity_map || {}) };
      activityMap[today] = (activityMap[today] || 0) + 1;

      const updated = {
        ...prev,
        completed_labs: newLabs,
        xp_points: prev.xp_points + 50,
        unlocked_badges: updatedBadges,
        daily_activity_map: activityMap,
      };

      studentApi.completeLab(labSlug).catch(() => {});
      return updated;
    });

    setXpToast({ amount: 50, reason: 'Visual Lab Explored! 🔬' });
    setTimeout(() => setXpToast(null), 2800);
  };

  // Update profile attributes
  const updateProfile = async (fields) => {
    setProfile((prev) => {
      const next = { ...prev, ...fields };
      localStorage.setItem('btm_student_profile', JSON.stringify(next));
      return next;
    });

    try {
      await studentApi.updateProfile(fields);
    } catch (err) {
      console.warn('Updated profile locally (API offline note):', err);
    }
  };

  // Comparison helpers
  const addToCompare = (formula) => {
    if (compareList.some((f) => f.id === formula.id)) return;
    if (compareList.length >= 3) {
      alert('You can compare a maximum of 3 formulas side-by-side.');
      return;
    }
    setCompareList((prev) => [...prev, formula]);
  };

  const removeFromCompare = (formulaId) => {
    setCompareList((prev) => prev.filter((f) => f.id !== formulaId));
  };

  const clearCompare = () => setCompareList([]);

  // Bookmark helpers
  const toggleBookmark = (formulaId) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      const isAdding = !next.has(formulaId);
      if (next.has(formulaId)) {
        next.delete(formulaId);
      } else {
        next.add(formulaId);
        awardXp(5, 'Formula Bookmarked');
      }

      if (next.size >= 5 && !profile.unlocked_badges.includes('bookmarker')) {
        setProfile((p) => ({ ...p, unlocked_badges: [...p.unlocked_badges, 'bookmarker'] }));
      }

      // Background sync with Django
      studentApi.toggleBookmark?.(formulaId)?.catch(() => {}) || studentApi.addBookmark(formulaId).catch(() => {});

      return next;
    });
  };

  // Notes helpers
  const saveNote = (formulaId, text) => {
    setNotes((prev) => {
      const next = { ...prev };
      if (!text || !text.trim()) {
        delete next[formulaId];
      } else {
        next[formulaId] = text.trim();
        awardXp(10, 'Study Note Saved');
      }
      return next;
    });

    // Background sync with Django
    studentApi.saveNote(formulaId, text || '').catch(() => {});
  };

  // Score helpers
  const recordAnswer = (isCorrect) => {
    setPracticeScore((prev) => {
      const currentStreak = isCorrect ? (prev.streak || 0) + 1 : 0;
      const bestStreak = Math.max(prev.bestStreak || 0, currentStreak);
      const nextScore = {
        correct: prev.correct + (isCorrect ? 1 : 0),
        attempted: prev.attempted + 1,
        streak: currentStreak,
        bestStreak: bestStreak,
      };

      if (isCorrect) {
        // Streak combo multiplier
        const multiplier = currentStreak >= 5 ? 2.0 : currentStreak >= 3 ? 1.5 : currentStreak >= 2 ? 1.25 : 1.0;
        const baseReward = 20;
        const totalReward = Math.round(baseReward * multiplier);

        const streakMsg = currentStreak >= 3 ? `🔥 ${currentStreak}x Streak! (+${totalReward} XP)` : `Quiz Correct! (+${totalReward} XP)`;
        awardXp(totalReward, streakMsg);

        if (!profile.unlocked_badges.includes('first_step')) {
          setProfile((p) => ({ ...p, unlocked_badges: [...p.unlocked_badges, 'first_step'] }));
        }
        if (currentStreak >= 3 && !profile.unlocked_badges.includes('streak_3')) {
          setProfile((p) => ({ ...p, unlocked_badges: [...p.unlocked_badges, 'streak_3'] }));
        }
      } else {
        logActivity('quiz_attempt');
      }
      return nextScore;
    });
  };

  const resetScore = () => {
    setPracticeScore({ correct: 0, attempted: 0, streak: 0, bestStreak: 0 });
  };

  // Supporters helper
  const addSupporter = (newEntry) => {
    setSupporters((prev) => {
      const next = [newEntry, ...prev];
      try {
        localStorage.setItem('btm_supporters', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const openDonationModal = (tier) => {
    setDonationPreselectedTier(tier);
    setIsDonationModalOpen(true);
  };

  const totalSupportedAmount = supporters.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

  // Keyboard shortcut listener for Ctrl+K and /
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <StudentContext.Provider
      value={{
        isSearchOpen,
        setIsSearchOpen,
        isScratchpadOpen,
        setIsScratchpadOpen,
        activeSolverSlug,
        setActiveSolverSlug,
        // Authentication
        user,
        authToken,
        isAuthenticated,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        logActivity,
        // Scholar Card Modal
        isScholarCardOpen,
        setIsScholarCardOpen,
        // Profile
        profile: {
          ...profile,
          level,
          level_title: levelTitle,
          next_level_xp: nextLevelXp,
          level_progress_pct: levelProgressPct,
        },
        updateProfile,
        awardXp,
        completeLab,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        bookmarks,
        toggleBookmark,
        notes,
        saveNote,
        practiceScore,
        recordAnswer,
        resetScore,
        isDonationModalOpen,
        setIsDonationModalOpen,
        donationPreselectedTier,
        setDonationPreselectedTier,
        openDonationModal,
        supporters,
        addSupporter,
        totalSupportedAmount,
        totalDonatedAmount: totalSupportedAmount,
        donationCurrency,
        setDonationCurrency,
      }}
    >
      {children}

      {/* Floating XP Reward Toast */}
      {xpToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 dark:bg-[#10192e]/95 text-white shadow-xl border border-amber-500/30 backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
            ⚡
          </div>
          <div>
            <div className="text-xs font-extrabold text-amber-400">
              {xpToast.amount > 0 ? `+${xpToast.amount} XP` : 'Student Desk'}
            </div>
            <div className="text-[11px] text-slate-300 font-medium">{xpToast.reason}</div>
          </div>
        </div>
      )}
    </StudentContext.Provider>
  );
}

export const useStudent = () => useContext(StudentContext);
