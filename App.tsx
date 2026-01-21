
import React, { useState, useEffect } from 'react';
import { AppState, Violation, Rule, UserSettings, AppRole } from './types';
import { Dashboard, getSeverityScore } from './components/Dashboard';
import { History } from './components/History';
import { RuleManager } from './components/RuleManager';

const STORAGE_KEY = 'housework_police_state_v4';

const initialSettings: UserSettings = {
  partner1Name: 'パパ',
  partner2Name: 'ママ',
  partner1Punishment: '一週間の皿洗い',
  partner2Punishment: '高級焼肉を奢る',
  penaltyThreshold: 10,
};

const initialRules: Rule[] = [
  { id: '1', title: '脱ぎっぱなし禁止', description: '脱いだ靴下を放置', severity: 'medium' },
  { id: '2', title: '食器放置禁止', description: '食後放置', severity: 'high' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'rules'>('dashboard');
  const [showOpening, setShowOpening] = useState(true);
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      rules: initialRules,
      violations: [],
      settings: initialSettings,
      deviceRole: undefined
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setDeviceRole = (role: AppRole) => {
    setState(prev => ({ ...prev, deviceRole: role }));
    setShowOpening(false);
  };

  const addViolation = (violator: 'partner1' | 'partner2', ruleId: string, accusalComment?: string) => {
    const newViolation: Violation = {
      id: crypto.randomUUID(),
      ruleId,
      violator,
      timestamp: Date.now(),
      status: 'pending',
      accusalComment
    };
    setState(prev => ({
      ...prev,
      violations: [...prev.violations, newViolation]
    }));
  };

  const updateViolation = (updated: Violation) => {
    setState(prev => {
      const oldViolation = prev.violations.find(v => v.id === updated.id);
      const isNewlyGuilty = updated.status === 'guilty' && oldViolation?.status !== 'guilty';
      const nextViolations = prev.violations.map(v => v.id === updated.id ? updated : v);
      
      if (isNewlyGuilty) {
        const currentScore = nextViolations
          .filter(v => v.violator === updated.violator && v.status === 'guilty')
          .reduce((acc, v) => {
            const rule = prev.rules.find(r => r.id === v.ruleId);
            return acc + (rule ? getSeverityScore(rule.severity) : 1);
          }, 0);

        if (currentScore >= prev.settings.penaltyThreshold) {
          const pun = updated.violator === 'partner1' ? prev.settings.partner1Punishment : prev.settings.partner2Punishment;
          const name = updated.violator === 'partner1' ? prev.settings.partner1Name : prev.settings.partner2Name;
          setTimeout(() => {
            alert(`🔨 【判決：有罪確定】\n${name}さん、合計スコアが${currentScore}ptに達しました！\n\n執行される罰：${pun}`);
          }, 100);
        }
      }
      return { ...prev, violations: nextViolations };
    });
  };

  const removeViolation = (id: string) => {
    setState(prev => ({
      ...prev,
      violations: prev.violations.filter(v => v.id !== id)
    }));
  };

  const addRule = (rule: Omit<Rule, 'id'>) => {
    setState(prev => ({
      ...prev,
      rules: [...prev.rules, { ...rule, id: crypto.randomUUID() }]
    }));
  };

  const updateRule = (updatedRule: Rule) => {
    setState(prev => ({
      ...prev,
      rules: prev.rules.map(r => r.id === updatedRule.id ? updatedRule : r)
    }));
  };

  const removeRule = (id: string) => {
    setState(prev => ({
      ...prev,
      rules: prev.rules.filter(r => r.id !== id)
    }));
  };

  const updateSettings = (settings: UserSettings) => {
    setState(prev => ({ ...prev, settings }));
  };

  if (showOpening || !state.deviceRole) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-transparent to-transparent"></div>
        </div>
        <div className="max-w-md w-full z-10 space-y-12 animate-in fade-in zoom-in duration-700">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <i className="fas fa-balance-scale text-7xl text-amber-500 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"></i>
              <div className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black px-2 py-1 rounded-full animate-bounce">厳粛</div>
            </div>
            <h2 className="text-3xl font-court font-black text-white italic leading-tight tracking-tighter">
              さぁ、あなたは家庭の法律<br/>
              <span className="text-amber-500">(わが家のルール)</span>を<br/>
              守れるか・・・！
            </h2>
            <p className="text-slate-400 text-lg font-bold">—— 家事裁判ポリス 開廷 ——</p>
          </div>
          <div className="bg-[#16213e] border-2 border-amber-600/50 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6">
            <p className="text-center text-amber-200 font-black text-sm uppercase tracking-widest">デバイスの役割を選択してください</p>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => setDeviceRole('partner1')} className="group relative overflow-hidden py-5 bg-[#0f3460] hover:bg-blue-600 text-white rounded-xl font-black text-xl shadow-lg transition-all active:scale-95">
                <span className="relative z-10">{state.settings.partner1Name}として入廷</span>
              </button>
              <button onClick={() => setDeviceRole('partner2')} className="group relative overflow-hidden py-5 bg-[#0f3460] hover:bg-blue-600 text-white rounded-xl font-black text-xl shadow-lg transition-all active:scale-95">
                <span className="relative z-10">{state.settings.partner2Name}として入廷</span>
              </button>
              <button onClick={() => setDeviceRole('observer')} className="py-3 text-slate-500 text-sm font-bold hover:text-slate-300 transition-colors">傍聴席から観戦する</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <header className="bg-[#0f3460] border-b-4 border-amber-500 sticky top-0 z-40 p-4 shadow-2xl">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fas fa-gavel text-amber-500 text-2xl"></i>
            <div>
              <h1 className="text-lg font-court font-black text-white italic tracking-tighter leading-none">家事裁判ポリス</h1>
              <div className="mt-1 flex items-center gap-2">
                <div className="bg-black/40 px-2 py-0.5 rounded flex items-center gap-2 border border-blue-900/50">
                  <span className="text-[10px] text-amber-400 font-black uppercase tracking-tighter">
                    <i className="fas fa-user-shield mr-1"></i>
                    {state.deviceRole === 'partner1' ? state.settings.partner1Name : state.deviceRole === 'partner2' ? state.settings.partner2Name : '観戦者'}
                  </span>
                  <button onClick={() => setState(prev => ({...prev, deviceRole: undefined}))} className="text-[9px] text-blue-300 hover:text-white underline font-bold transition-colors">役割変更</button>
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => window.confirm('全記録を消去し、最高裁判所を解散しますか？') && setState({rules:initialRules, violations:[], settings:initialSettings, deviceRole: state.deviceRole})} className="text-[10px] text-slate-500 font-black hover:text-rose-500 transition-colors">RESET</button>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <Dashboard state={state} onAddViolation={addViolation} onUpdateViolation={updateViolation} />}
        {activeTab === 'history' && <History state={state} onRemove={removeViolation} />}
        {activeTab === 'rules' && <RuleManager state={state} onUpdateSettings={updateSettings} onAddRule={addRule} onUpdateRule={updateRule} onRemoveRule={removeRule} />}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f3460] border-t-4 border-amber-600/50 p-3 flex justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.6)] z-40 backdrop-blur-md">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center flex-1 py-2 transition-all rounded-lg ${activeTab === 'dashboard' ? 'text-amber-400 bg-white/5 scale-105 shadow-inner' : 'text-slate-400'}`}>
          <i className="fas fa-balance-scale text-2xl"></i>
          <span className="text-[11px] font-black mt-2 uppercase tracking-widest">裁判所</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center flex-1 py-2 transition-all rounded-lg ${activeTab === 'history' ? 'text-amber-400 bg-white/5 scale-105 shadow-inner' : 'text-slate-400'}`}>
          <i className="fas fa-scroll text-2xl"></i>
          <span className="text-[11px] font-black mt-2 uppercase tracking-widest">履歴</span>
        </button>
        <button onClick={() => setActiveTab('rules')} className={`flex flex-col items-center flex-1 py-2 transition-all rounded-lg ${activeTab === 'rules' ? 'text-amber-400 bg-white/5 scale-105 shadow-inner' : 'text-slate-400'}`}>
          <i className="fas fa-cog text-2xl"></i>
          <span className="text-[11px] font-black mt-2 uppercase tracking-widest">ルール</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
