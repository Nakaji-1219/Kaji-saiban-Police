
import React, { useState } from 'react';
import { AppState, Violation, Rule } from '../types';

interface Props {
  state: AppState;
  onAddViolation: (violator: 'partner1' | 'partner2', ruleId: string, accusalComment?: string) => void;
  onUpdateViolation: (v: Violation) => void;
}

export const getSeverityScore = (severity: Rule['severity']) => {
  switch (severity) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 1;
  }
};

export const Dashboard: React.FC<Props> = ({ state, onAddViolation, onUpdateViolation }) => {
  const { settings, violations, rules, deviceRole } = state;
  const [editingViolationId, setEditingViolationId] = useState<string | null>(null);
  const [defenseText, setDefenseText] = useState('');
  
  // 告発用ステート
  const [accusalTarget, setAccusalTarget] = useState<{ violator: 'partner1' | 'partner2', ruleId: string } | null>(null);
  const [accusalComment, setAccusalComment] = useState('');

  const [showIgiari, setShowIgiari] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const triggerIgiari = () => {
    setShowIgiari(true);
    setIsShaking(true);
    setTimeout(() => {
      setShowIgiari(false);
      setIsShaking(false);
    }, 1000);
  };

  const confirmAccusal = () => {
    if (!accusalTarget) return;
    triggerIgiari();
    onAddViolation(accusalTarget.violator, accusalTarget.ruleId, accusalComment);
    setAccusalTarget(null);
    setAccusalComment('');
  };

  const handleAccusalClick = (violator: 'partner1' | 'partner2', ruleId: string) => {
    if (deviceRole === 'observer') return;
    if (deviceRole === violator) {
      alert("自分自身を告発することはできません！");
      return;
    }
    setAccusalTarget({ violator, ruleId });
  };

  const getTotalScore = (partner: 'partner1' | 'partner2') => {
    return violations
      .filter(v => v.violator === partner && v.status === 'guilty')
      .reduce((acc, v) => {
        const rule = rules.find(r => r.id === v.ruleId);
        return acc + (rule ? getSeverityScore(rule.severity) : 1);
      }, 0);
  };

  const p1Score = getTotalScore('partner1');
  const p2Score = getTotalScore('partner2');
  const getProgress = (score: number) => Math.min((score / settings.penaltyThreshold) * 100, 100);

  const pendingViolations = violations.filter(v => v.status === 'pending' || v.status === 'defended');

  return (
    <div className={`space-y-10 pb-10 ${isShaking ? 'shake' : ''}`}>
      {showIgiari && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="igiari-text text-8xl md:text-9xl font-court tracking-tighter transform -rotate-12">
            異議あり！
          </div>
        </div>
      )}

      {/* 告発内容入力モーダル風 */}
      {accusalTarget && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#16213e] border-2 border-amber-500 rounded-2xl p-6 shadow-2xl space-y-6 animate-in zoom-in duration-300">
            <h3 className="text-xl font-court font-black text-amber-500 flex items-center gap-3">
              <i className="fas fa-exclamation-triangle"></i> 指摘内容の補足
            </h3>
            <div className="p-4 bg-black/30 rounded-lg border border-blue-900/50">
              <p className="text-xs text-slate-400 mb-1 uppercase tracking-widest font-bold">対象のルール</p>
              <p className="text-lg text-white font-bold">{rules.find(r => r.id === accusalTarget.ruleId)?.title}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">状況や理由（任意）</label>
              <textarea
                className="w-full p-4 bg-[#0a0a1a] border-2 border-blue-900 rounded-lg text-white font-bold text-base focus:ring-2 focus:ring-amber-500 outline-none placeholder-slate-600"
                rows={3}
                value={accusalComment}
                onChange={(e) => setAccusalComment(e.target.value)}
                placeholder="例：今日で3回目です。わざとやってる気がします。"
              />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setAccusalTarget(null)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-colors">キャンセル</button>
              <button onClick={confirmAccusal} className="flex-1 py-3 bg-amber-600 text-black rounded-xl font-black text-lg hover:bg-amber-500 shadow-lg active:scale-95 transition-all">告発する！</button>
            </div>
          </div>
        </div>
      )}

      {/* スコアボード */}
      <div className="wood-panel p-6 rounded-b-3xl shadow-2xl flex flex-col gap-6">
        <div className="flex justify-between gap-6 items-center">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-end px-1">
              <span className={`text-sm font-black uppercase tracking-widest ${deviceRole === 'partner1' ? 'text-amber-400' : 'text-amber-200/50'}`}>
                {deviceRole === 'partner1' && <i className="fas fa-user-circle mr-1"></i>}
                {settings.partner1Name}
              </span>
              <span className="text-3xl font-court font-black text-white">{p1Score}<span className="text-sm ml-1">pt</span></span>
            </div>
            <div className="gauge-container h-8 rounded-md overflow-hidden p-1">
              <div className={`h-full transition-all duration-1000 ${p1Score >= settings.penaltyThreshold ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'bg-gradient-to-r from-green-400 to-yellow-400'}`} style={{ width: `${getProgress(p1Score)}%` }} />
            </div>
          </div>
          <div className="font-court text-3xl font-black text-amber-500 italic px-2">VS</div>
          <div className="flex-1 space-y-2 text-right">
            <div className="flex justify-between items-end px-1 flex-row-reverse">
              <span className={`text-sm font-black uppercase tracking-widest ${deviceRole === 'partner2' ? 'text-amber-400' : 'text-amber-200/50'}`}>
                {deviceRole === 'partner2' && <i className="fas fa-user-circle mr-1"></i>}
                {settings.partner2Name}
              </span>
              <span className="text-3xl font-court font-black text-white">{p2Score}<span className="text-sm ml-1">pt</span></span>
            </div>
            <div className="gauge-container h-8 rounded-md overflow-hidden p-1 rotate-180">
              <div className={`h-full transition-all duration-1000 ${p2Score >= settings.penaltyThreshold ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'bg-gradient-to-r from-green-400 to-yellow-400'}`} style={{ width: `${getProgress(p2Score)}%` }} />
            </div>
          </div>
        </div>
        <div className="text-xs text-center text-amber-100 font-bold uppercase tracking-[0.2em] bg-black/30 py-1 rounded-full">
          {settings.penaltyThreshold}pt で罰ゲーム執行
        </div>
      </div>

      {/* 裁判待ち案件 */}
      {pendingViolations.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-amber-400 font-court text-xl flex items-center gap-3 px-2">
            <i className="fas fa-gavel"></i> 未決着の案件
          </h3>
          <div className="space-y-6">
            {pendingViolations.map(v => {
              const rule = rules.find(r => r.id === v.ruleId);
              const violatorName = v.violator === 'partner1' ? settings.partner1Name : settings.partner2Name;
              const isEditing = editingViolationId === v.id;
              const isMyCase = deviceRole === v.violator;
              const isMyProsecution = deviceRole !== v.violator && deviceRole !== 'observer';

              return (
                <div key={v.id} className="bg-[#16213e] border-2 border-[#2a4a7a] rounded-xl overflow-hidden shadow-2xl">
                  <div className="bg-[#0f3460] p-3 flex justify-between items-center px-5">
                    <span className="text-sm font-bold text-blue-100">
                      {isMyCase ? <span className="text-amber-400">[あなたへの指摘]</span> : `対象者：${violatorName}`}
                    </span>
                    <span className="text-xs bg-rose-800 text-white px-3 py-1 rounded-full font-bold">{rule?.title}</span>
                  </div>
                  
                  <div className="p-5 bg-[#1a1a2e] space-y-4">
                    {/* 告発側のコメント表示 */}
                    {v.accusalComment && (
                      <div className="bg-black/40 p-3 rounded border-l-4 border-rose-500 text-slate-300 text-sm italic">
                        <p className="text-[10px] text-rose-400 font-black mb-1 uppercase tracking-widest">告発者の証言</p>
                        「{v.accusalComment}」
                      </div>
                    )}

                    {isEditing ? (
                      <div className="space-y-4">
                        <textarea
                          className="w-full p-4 bg-[#0a0a1a] border-2 border-blue-900 rounded-lg text-green-400 font-mono text-base focus:ring-2 focus:ring-green-400 outline-none"
                          rows={4}
                          value={defenseText}
                          onChange={(e) => setDefenseText(e.target.value)}
                          placeholder="弁明の内容を入力..."
                          autoFocus
                        />
                        <div className="flex justify-end gap-3">
                          <button onClick={() => setEditingViolationId(null)} className="px-5 py-2 text-slate-300 text-sm font-bold">戻る</button>
                          <button onClick={() => { onUpdateViolation({ ...v, defense: defenseText, status: 'defended' }); setEditingViolationId(null); setDefenseText(''); }} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold text-base hover:bg-blue-500 shadow-lg">証言を記録</button>
                        </div>
                      </div>
                    ) : v.status === 'pending' ? (
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-slate-200 text-base font-medium">
                          {isMyCase ? "この指摘に反論（弁明）しますか？" : "相手の反応（弁明）を待っています..."}
                        </p>
                        <div className="flex gap-3 w-full sm:w-auto">
                          {isMyCase && (
                            <>
                              <button onClick={() => { setEditingViolationId(v.id); setDefenseText(''); }} className="flex-1 sm:flex-none px-6 py-3 border-2 border-amber-600 text-amber-400 rounded-lg text-sm font-bold hover:bg-amber-900/40">弁明する</button>
                              <button onClick={() => onUpdateViolation({ ...v, status: 'guilty' })} className="flex-1 sm:flex-none px-6 py-3 bg-rose-700 text-white rounded-lg font-bold text-sm hover:bg-rose-600">認めてアウト</button>
                            </>
                          )}
                          {!isMyCase && <span className="text-xs text-slate-500 italic">被告の証言待ち</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-[#0a0a1a] p-4 border-l-4 border-blue-500 rounded-r-lg text-blue-50 text-base leading-relaxed italic shadow-inner">
                          「{v.defense}」
                        </div>
                        <div className="flex justify-center gap-4">
                          {isMyProsecution ? (
                            <>
                              <button onClick={() => onUpdateViolation({ ...v, status: 'innocent' })} className="flex-1 max-w-[200px] py-4 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-500 shadow-lg">セーフ（許す）</button>
                              <button onClick={() => onUpdateViolation({ ...v, status: 'guilty' })} className="flex-1 max-w-[200px] py-4 bg-rose-600 text-white rounded-xl font-black text-sm hover:bg-rose-500 shadow-lg">アウト（却下）</button>
                            </>
                          ) : (
                            <div className="text-center text-slate-500 text-sm italic">指摘者が判決を下すのを待っています...</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 指摘メニュー */}
      <div className="space-y-6">
        <h3 className="text-slate-400 font-court text-sm uppercase tracking-[0.4em] text-center border-b border-slate-800 pb-2">
          {deviceRole === 'observer' ? '閲覧モード' : 'ルール違反を指摘する'}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {rules.map(rule => (
            <div key={rule.id} className="bg-[#1a1a2e] border-2 border-blue-900/30 rounded-xl p-5 hover:border-blue-400 transition-all group relative overflow-hidden shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-court text-xl text-white group-hover:text-amber-300 transition-colors">{rule.title}</h4>
                <span className="text-xs font-black bg-rose-900/50 text-rose-200 border border-rose-500/50 px-3 py-1 rounded-full">+{getSeverityScore(rule.severity)}pt</span>
              </div>
              <div className="flex gap-3 mt-2 relative z-10">
                {deviceRole === 'observer' ? (
                  <div className="w-full text-center py-2 text-slate-600 text-xs italic">観戦中につき操作不可</div>
                ) : (
                  <>
                    <button 
                      onClick={() => handleAccusalClick('partner1', rule.id)} 
                      disabled={deviceRole === 'partner1'}
                      className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-md active:translate-y-1 ${deviceRole === 'partner1' ? 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed' : 'bg-[#0f3460] hover:bg-blue-600 text-blue-50'}`}
                    >
                      {deviceRole === 'partner2' ? `${settings.partner1Name}を告発` : '-'}
                    </button>
                    <button 
                      onClick={() => handleAccusalClick('partner2', rule.id)} 
                      disabled={deviceRole === 'partner2'}
                      className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-md active:translate-y-1 ${deviceRole === 'partner2' ? 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed' : 'bg-[#0f3460] hover:bg-blue-600 text-blue-50'}`}
                    >
                      {deviceRole === 'partner1' ? `${settings.partner2Name}を告発` : '-'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
