
import React from 'react';
import { AppState, Violation, ViolationStatus } from '../types';

const StatusStamp: React.FC<{ status: ViolationStatus }> = ({ status }) => {
  const config = {
    pending: { label: '未決', color: 'text-amber-500', border: 'border-amber-500' },
    defended: { label: '係争中', color: 'text-blue-400', border: 'border-blue-400' },
    guilty: { label: 'アウト', color: 'text-rose-500', border: 'border-rose-500' },
    innocent: { label: 'セーフ', color: 'text-emerald-500', border: 'border-emerald-500' },
  }[status];

  return (
    <span className={`text-xs px-3 py-1 border-2 ${config.border} ${config.color} font-black rotate-[-8deg] inline-block shadow-lg bg-black/20`}>
      {config.label}
    </span>
  );
};

interface Props {
  state: AppState;
  onRemove: (id: string) => void;
}

export const History: React.FC<Props> = ({ state, onRemove }) => {
  const sortedViolations = [...state.violations].sort((a, b) => b.timestamp - a.timestamp);
  const getRuleTitle = (id: string) => state.rules.find(r => r.id === id)?.title || '不明な指摘';

  return (
    <div className="space-y-8">
      <h2 className="text-amber-500 font-court text-2xl border-b border-amber-900/50 pb-3">裁判の履歴</h2>
      {sortedViolations.length === 0 ? (
        <div className="text-center py-32 bg-black/20 border-2 border-dashed border-blue-900/30 rounded-xl text-slate-500 font-court italic text-lg">
          記録された案件はありません
        </div>
      ) : (
        <div className="space-y-6">
          {sortedViolations.map(v => (
            <div key={v.id} className="bg-[#16213e] p-6 rounded-xl border-2 border-blue-900/40 relative group shadow-xl">
              <div className="absolute top-4 right-6">
                <StatusStamp status={v.status} />
              </div>
              <div className="space-y-4">
                <div className="text-[10px] font-black text-amber-200/40 uppercase tracking-[0.2em]">
                  CASE ID: {v.id.substring(0,8)}
                </div>
                <div className="text-base font-court text-blue-200">
                  <span className="text-white font-black text-lg underline decoration-amber-500 underline-offset-4 mr-2">
                    {v.violator === 'partner1' ? state.settings.partner1Name : state.settings.partner2Name}
                  </span>
                  への指摘案件
                </div>
                <div className="text-2xl font-black text-slate-50 py-1 leading-tight">
                  「{getRuleTitle(v.ruleId)}」
                </div>
                
                {/* 告発コメントの表示 */}
                {v.accusalComment && (
                  <div className="bg-rose-950/20 p-3 rounded border-l-2 border-rose-800 text-sm text-rose-100">
                    <span className="text-[10px] text-rose-500 font-black block mb-1">ACCUSAL COMMENT</span>
                    {v.accusalComment}
                  </div>
                )}

                {/* 弁明の表示 */}
                {v.defense && (
                  <div className="p-3 bg-blue-950/20 rounded border-l-2 border-blue-600 text-sm text-blue-50 italic">
                    <span className="text-[10px] text-blue-400 font-black block mb-1">DEFENSE STATEMENT</span>
                    「{v.defense}」
                  </div>
                )}

                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 pt-2">
                  <i className="far fa-clock"></i>
                  {new Date(v.timestamp).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <button 
                onClick={() => onRemove(v.id)}
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-500 transition-all p-3 rounded-full hover:bg-rose-500/10"
                title="記録を削除"
              >
                <i className="fas fa-trash-alt text-base"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
