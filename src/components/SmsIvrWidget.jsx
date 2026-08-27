import React from 'react';
import { useAppState } from '../context/StateContext';
import { Radio, Phone, MessageSquare, PlusCircle, Signal } from 'lucide-react';

export const SmsIvrWidget = () => {
  const { smsReports, convertSmsToIncident } = useAppState();

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-3.5 space-y-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <Signal className="w-4 h-4 text-amber-400" />
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-200">
            Low Connectivity Fallback Feed
          </h3>
        </div>
        <span className="bg-amber-950 text-amber-400 border border-amber-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
          SMS / IVR ACTIVE
        </span>
      </div>

      <div className="space-y-2.5">
        {smsReports.map(sms => (
          <div
            key={sms.id}
            className="bg-[#151e32] border border-gray-800 rounded-xl p-3 space-y-2 text-xs hover:border-amber-500/40 transition-colors"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                {sms.channel === 'SMS' ? <MessageSquare className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                {sms.channel} FALLBACK ({sms.phone})
              </span>
              <span className="text-gray-500 font-mono">{sms.timestamp}</span>
            </div>

            <p className="text-gray-300 italic bg-slate-900/60 p-2 rounded border border-gray-800 text-[11px]">
              "{sms.rawText}"
            </p>

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-gray-400">
                Parsed: <b className="text-gray-200">{sms.parsed.type}</b> | People: <b className="text-red-400">{sms.parsed.peopleAffected}</b>
              </div>

              <button
                onClick={() => convertSmsToIncident(sms.id)}
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] font-heading flex items-center gap-1 transition-colors shadow-md"
              >
                <PlusCircle className="w-3 h-3" />
                CREATE INCIDENT
              </button>
            </div>
          </div>
        ))}

        {smsReports.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-2">
            All low connectivity reports converted to active incidents.
          </p>
        )}
      </div>
    </div>
  );
};
