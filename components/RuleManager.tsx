
import React, { useState } from 'react';
import { AppState, Rule, UserSettings } from '../types';
import { suggestRules, suggestPunishment } from '../services/geminiService';

interface Props {
  state: AppState;
  onUpdateSettings: (settings: UserSettings) => void;
  onAddRule: (rule: Omit<Rule, 'id'>) => void;
  onUpdateRule: (rule: Rule) => void;
  onRemoveRule: (id: string) => void;
}

export const RuleManager: React.FC<Props> = ({ state, onUpdateSettings, onAddRule, onUpdateRule, onRemoveRule }) => {
  const [newRule, setNewRule] = useState({ title: '', description: '', severity: 'low' as Rule['severity'] });
  const [isSuggesting, setIsSuggesting] = useState(false);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="bg-[#16213e] p-8 rounded-xl border-2 border-amber-900/50 shadow-2xl space-y-8">
        <h3 className="text-amber-500 font-court text-2xl border-b border-amber-900/50 pb-3">基本設定</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Partner 1 Config */}
          <div className="space-y-4">
            <label className="text-xs font-black text-amber-200/60 uppercase tracking-widest block">パートナー 1</label>
            <input 
              type="text" 
              value={state.settings.partner1Name} 
              onChange={e => onUpdateSettings({...state.settings, partner1Name: e.target.value})} 
              className="w-full bg-[#0a0a1a] border-2 border-blue-900 p-4 rounded-lg text-white text-lg font-bold focus:border-amber-500 outline-none" 
              placeholder="名前" 
            />
            <div className="relative">
              <label className="text-[10px] text-rose-400 absolute -top-2 left-2 bg-[#16213e] px-1 font-bold">敗北時の罰ゲーム</label>
              <textarea 
                value={state.settings.partner1Punishment} 
                onChange={e => onUpdateSettings({...state.settings, partner1Punishment: e.target.value})} 
                className="w-full bg-[#0a0a1a] border border-blue-900 p-4 rounded-lg text-rose-200 text-sm leading-relaxed" 
                rows={2}
                placeholder="罰の内容を入力..." 
              />
            </div>
          </div>

          {/* Partner 2 Config */}
          <div className="space-y-4">
            <label className="text-xs font-black text-amber-200/60 uppercase tracking-widest block">パートナー 2</label>
            <input 
              type="text" 
              value={state.settings.partner2Name} 
              onChange={e => onUpdateSettings({...state.settings, partner2Name: e.target.value})} 
              className="w-full bg-[#0a0a1a] border-2 border-blue-900 p-4 rounded-lg text-white text-lg font-bold focus:border-amber-500 outline-none" 
              placeholder="名前" 
            />
            <div className="relative">
              <label className="text-[10px] text-rose-400 absolute -top-2 left-2 bg-[#16213e] px-1 font-bold">敗北時の罰ゲーム</label>
              <textarea 
                value={state.settings.partner2Punishment} 
                onChange={e => onUpdateSettings({...state.settings, partner2Punishment: e.target.value})} 
                className="w-full bg-[#0a0a1a] border border-blue-900 p-4 rounded-lg text-rose-200 text-sm leading-relaxed" 
                rows={2}
                placeholder="罰の内容を入力..." 
              />
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-amber-900/30 flex items-center justify-between">
          <div>
            <label className="text-sm font-bold text-amber-100 block mb-1">罰ゲーム発動スコア</label>
            <p className="text-xs text-slate-400">このポイントに達すると有罪確定となります</p>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              value={state.settings.penaltyThreshold} 
              onChange={e => onUpdateSettings({...state.settings, penaltyThreshold: parseInt(e.target.value) || 5})} 
              className="w-24 bg-[#0a0a1a] border-2 border-amber-900 p-3 rounded-lg text-amber-50 text-center text-xl font-black" 
            />
            <span className="text-lg font-bold text-amber-500">pt</span>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-amber-500 font-court text-2xl">家事のルール設定</h3>
          <button 
            onClick={async () => { setIsSuggesting(true); try { const s = await suggestRules("夫婦"); s.forEach(onAddRule); } finally { setIsSuggesting(false); } }} 
            className="text-xs font-bold text-amber-300 border-2 border-amber-500/30 px-4 py-2 rounded-full hover:bg-amber-500/10 transition-colors"
          >
            {isSuggesting ? (
              <span className="flex items-center gap-2"><i className="fas fa-spinner animate-spin"></i> 検討中...</span>
            ) : (
              <span className="flex items-center gap-2"><i className="fas fa-magic"></i> AIに提案を頼む</span>
            )}
          </button>
        </div>
        
        <div className="bg-[#16213e] rounded-xl border-2 border-amber-900/50 p-6 space-y-8">
          <div className="bg-[#0a0a1a] p-6 rounded-lg border-2 border-blue-900/50 space-y-4 shadow-inner">
            <p className="text-xs font-black text-blue-400 uppercase tracking-widest border-b border-blue-900/50 pb-2">新ルールの制定</p>
            <input 
              placeholder="違反内容 (例: 脱いだ靴下の放置)" 
              className="w-full bg-transparent border-b-2 border-blue-900 py-3 text-lg text-white outline-none focus:border-amber-500 placeholder-slate-600 transition-colors" 
              value={newRule.title} 
              onChange={e => setNewRule({...newRule, title: e.target.value})} 
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                className="flex-1 bg-[#1a1a2e] border-2 border-blue-900 rounded-lg p-3 text-base text-blue-100 font-bold" 
                value={newRule.severity} 
                onChange={e => setNewRule({...newRule, severity: e.target.value as Rule['severity']})}
              >
                <option value="low">軽微な違反 (+1pt)</option>
                <option value="medium">通常の違反 (+2pt)</option>
                <option value="high">重大な違反 (+3pt)</option>
              </select>
              <button 
                onClick={() => { if(newRule.title) { onAddRule(newRule); setNewRule({title:'', description:'', severity:'low'}); } }} 
                className="px-10 py-3 bg-amber-600 text-black font-black rounded-lg text-base hover:bg-amber-500 transition-all shadow-xl active:scale-95"
              >
                ルールを追加
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">現在のルール一覧</p>
            <div className="grid grid-cols-1 gap-3">
              {state.rules.map(rule => (
                <div key={rule.id} className="p-4 border-l-4 border-amber-600 bg-black/30 rounded-r-lg flex justify-between items-center group hover:bg-black/50 transition-colors">
                  <div className="flex flex-col gap-1">
                    <div className="font-court text-lg text-slate-100 flex items-center gap-3">
                      {rule.title}
                      <span className={`text-[10px] px-3 py-1 rounded-full uppercase font-black ${
                        rule.severity === 'high' ? 'bg-rose-900/50 text-rose-300 border border-rose-500/30' :
                        rule.severity === 'medium' ? 'bg-amber-900/50 text-amber-300 border border-amber-500/30' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {rule.severity === 'high' ? '重要' : rule.severity === 'medium' ? '通常' : '軽微'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveRule(rule.id)} 
                    className="text-slate-600 hover:text-rose-500 p-3 transition-colors rounded-full hover:bg-rose-500/10"
                  >
                    <i className="fas fa-trash-alt text-lg"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 免責事項セクション */}
      <section className="mt-12 p-6 bg-black/40 rounded-xl border border-slate-800 space-y-4">
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <i className="fas fa-info-circle"></i> 免責事項・注意事項
        </h4>
        <div className="text-[11px] text-slate-500 leading-relaxed space-y-2 font-court italic">
          <p>
            本アプリ「家事裁判ポリス」は、夫婦・家族間のコミュニケーションを円滑かつ楽しくするためのジョーク・エンターテインメントアプリです。
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>AIによるルール提案や罰ゲームの内容は参考です。実行の判断はユーザー自身の責任において行ってください。</li>
            <li>公序良俗に反する行為、人権を侵害する行為、身体的・精神的な苦痛を伴う罰ゲームの設定および実行は固く禁じます。</li>
            <li>本アプリの使用により生じた夫婦・家族間のトラブル、不利益、損害について、開発者は一切の責任を負いません。</li>
            <li>入力されたデータはブラウザのローカルストレージにのみ保存され、開発者側に送信されることはありません（AIへの問い合わせ内容を除く）。</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
