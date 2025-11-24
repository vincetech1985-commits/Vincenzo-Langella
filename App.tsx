import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Activity, Download, Printer, Sparkles, AlertCircle, Target, ExternalLink, User, PlayCircle } from 'lucide-react';
import { UserInput, HeartRateZone, Gender } from './types';
import { ZoneChart } from './components/ZoneChart';
import { ZoneTable } from './components/ZoneTable';
import { getFitnessAdvice } from './services/geminiService';
import { WorkoutMode } from './components/WorkoutMode';

const INITIAL_ZONES: HeartRateZone[] = [];

function App() {
  const [input, setInput] = useState<UserInput>({ age: 30, gender: 'M' });
  const [maxHr, setMaxHr] = useState<number>(0);
  const [zones, setZones] = useState<HeartRateZone[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [isWorkoutMode, setIsWorkoutMode] = useState<boolean>(false);

  // Core Calculation Logic
  const calculateZones = useCallback(() => {
    const ageNum = input.age === '' ? 0 : input.age;
    if (ageNum < 18 || ageNum > 100) return; // Basic validation check, though UI handles range

    // Formula: M = 220-age, F = 226-age
    const calculatedMaxHr = input.gender === 'M' ? 220 - ageNum : 226 - ageNum;
    setMaxHr(calculatedMaxHr);

    const calculatedZones: HeartRateZone[] = [
      {
        id: 'warmup',
        name: 'Riscaldamento',
        rangePercent: '40-50%',
        minPct: 0.4,
        maxPct: 0.5,
        minBpm: Math.round(calculatedMaxHr * 0.4),
        maxBpm: Math.round(calculatedMaxHr * 0.5),
        description: 'Preparazione del corpo allo sforzo.',
        duration: '5-10 min',
        goal: 'Preparazione',
        color: '#94a3b8', // slate-400
        textColor: '#1e293b',
        isTarget: false
      },
      {
        id: 'light',
        name: 'Allenamento Leggero',
        rangePercent: '50-60%',
        minPct: 0.5,
        maxPct: 0.6,
        minBpm: Math.round(calculatedMaxHr * 0.5),
        maxBpm: Math.round(calculatedMaxHr * 0.6),
        description: 'Migliora la salute generale e aiuta il recupero.',
        duration: '10-20 min',
        goal: 'Resistenza Base',
        color: '#22c55e', // green-500
        textColor: '#14532d',
        isTarget: false
      },
      {
        id: 'aerobic',
        name: 'Aerobico (Target)',
        rangePercent: '60-80%',
        minPct: 0.6,
        maxPct: 0.8,
        minBpm: Math.round(calculatedMaxHr * 0.6),
        maxBpm: Math.round(calculatedMaxHr * 0.8),
        description: 'Migliora la capacità respiratoria e cardiovascolare.',
        duration: '20-40 min',
        goal: 'Cardiovascolare',
        color: '#6366f1', // indigo-500
        textColor: '#ffffff', // White text for better contrast on indigo
        isTarget: true
      },
      {
        id: 'anaerobic',
        name: 'Anaerobico',
        rangePercent: '80-90%',
        minPct: 0.8,
        maxPct: 0.9,
        minBpm: Math.round(calculatedMaxHr * 0.8),
        maxBpm: Math.round(calculatedMaxHr * 0.9),
        description: 'Sviluppa la tolleranza all\'acido lattico.',
        duration: '5-10 min',
        goal: 'Potenza',
        color: '#ef4444', // red-500
        textColor: '#ffffff',
        isTarget: false
      }
    ];

    setZones(calculatedZones);
    setAiAdvice(''); // Reset advice when parameters change
  }, [input]);

  // Initial calculation on mount and when input changes
  useEffect(() => {
    calculateZones();
  }, [calculateZones]);

  // Handlers
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      // Clamp for UX, though calculation handles it
      if (val > 100) setInput(prev => ({ ...prev, age: 100 }));
      else if (val < 0) setInput(prev => ({ ...prev, age: 18 })); 
      else setInput(prev => ({ ...prev, age: val }));
    } else {
      setInput(prev => ({ ...prev, age: '' }));
    }
  };

  const handleGenderChange = (val: Gender) => {
    setInput(prev => ({ ...prev, gender: val }));
  };

  const fetchAiAdvice = async () => {
    if (input.age === '') return;
    setLoadingAi(true);
    const advice = await getFitnessAdvice(input.age, input.gender, maxHr);
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Improved Excel Export: Generates an HTML table saved as .xls to preserve formatting/colors
  const handleDownloadExcel = () => {
    if (zones.length === 0) return;

    // Create styled rows for Excel
    const tableRows = zones.map(z => `
      <tr>
        <td style="background-color: ${z.color}; color: ${z.textColor === '#ffffff' ? '#FFFFFF' : '#000000'}; font-weight: bold; border: 1px solid #000;">${z.name}</td>
        <td style="text-align: center; border: 1px solid #ccc;">${z.minBpm} - ${z.maxBpm}</td>
        <td style="text-align: center; border: 1px solid #ccc;">${z.rangePercent}</td>
        <td style="border: 1px solid #ccc;">${z.duration}</td>
        <td style="border: 1px solid #ccc;">${z.goal}</td>
        <td style="border: 1px solid #ccc;">${z.description}</td>
      </tr>
    `).join('');

    // Excel HTML Template
    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Zone Cardiache</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #f0f9ff; border: 1px solid #000; padding: 10px; }
          td { padding: 8px; }
          .title { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 20px; }
          .subtitle { font-size: 14px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="title">CardioZone Pro - Report Personalizzato</div>
        <div class="subtitle">Di Vincenzo Langella (www.vincenzolangella.it)</div>
        <br/>
        <div><strong>Utente:</strong> ${input.gender === 'M' ? 'Uomo' : 'Donna'}, ${input.age} anni | <strong>FC Max:</strong> ${maxHr} BPM</div>
        <br/>
        <table>
          <thead>
            <tr>
              <th style="width: 200px;">Zona</th>
              <th style="width: 100px;">BPM</th>
              <th style="width: 80px;">% Max</th>
              <th style="width: 120px;">Durata Consigliata</th>
              <th style="width: 150px;">Obiettivo</th>
              <th style="width: 300px;">Descrizione</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <br/>
        <div style="font-size: 12px; color: #888;">Generato da CardioZone Pro</div>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CardioZone_Pro_Report_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTargetZone = () => zones.find(z => z.isTarget) || zones[0];

  return (
    <div className="min-h-screen pb-12">
      {/* Workout Mode Overlay */}
      {isWorkoutMode && zones.length > 0 && (
        <WorkoutMode 
          targetZone={getTargetZone()} 
          maxHr={maxHr} 
          onClose={() => setIsWorkoutMode(false)} 
        />
      )}

      {/* Header / Branding */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 print:static print:border-none">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-indigo-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                  CardioZone Pro
                </h1>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  Di Vincenzo Langella 
                  <span className="text-slate-300">|</span>
                  <a href="https://www.vincenzolangella.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-0.5">
                    www.vincenzolangella.it
                  </a>
                </p>
              </div>
            </div>
            <div className="hidden sm:flex gap-2 no-print">
              <button 
                onClick={handlePrint}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Stampa PDF"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button 
                onClick={handleDownloadExcel}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 no-print">
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between">
            <div className="flex gap-6 w-full sm:w-auto">
              <div className="flex-1 sm:w-32">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  La tua età
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={input.age}
                    onChange={handleAgeChange}
                    className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono font-medium"
                    placeholder="30"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-sm pointer-events-none">anni</span>
                </div>
              </div>

              <div className="flex-1 sm:w-auto">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Sesso
                </label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => handleGenderChange('M')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      input.gender === 'M' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Uomo
                  </button>
                  <button
                    onClick={() => handleGenderChange('F')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      input.gender === 'F' 
                        ? 'bg-white text-pink-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Donna
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 px-6 py-4 rounded-xl border border-indigo-100 w-full sm:w-auto">
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">
                FC Massima Stimata
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-indigo-900">{maxHr}</span>
                <span className="text-sm font-medium text-indigo-600">BPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="print:block">
          
          {/* Action Buttons: AI Advice + Workout Mode */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 no-print">
            <button
              onClick={fetchAiAdvice}
              disabled={loadingAi || input.age === ''}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-indigo-100 hover:bg-indigo-50 text-indigo-700 rounded-xl font-medium shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loadingAi ? (
                <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-indigo-500" />
              )}
              <span>Consigli Smart Coach</span>
            </button>

            <button
              onClick={() => setIsWorkoutMode(true)}
              disabled={input.age === ''}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Avvia Allenamento Guidato</span>
            </button>
          </div>

          {/* AI Advice Display */}
          {aiAdvice && (
            <div className="mb-8 mt-2 bg-gradient-to-br from-white to-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-sm no-print animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-indigo-900 mb-2">Il consiglio del Coach</h3>
                  <div className="prose prose-indigo text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                    {aiAdvice}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Zones Chart */}
          <ZoneChart zones={zones} maxHr={maxHr} />

          {/* Zones Table */}
          <ZoneTable zones={zones} />

          {/* Practical Guide */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900">Perché la Zona Aerobica?</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                La zona target (60-80%) è ottimale per migliorare il sistema cardiovascolare e bruciare grassi in modo efficiente.
                È il range ideale per la maggior parte delle attività di fitness prolungato come corsa leggera, nuoto o ciclismo.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-slate-900">Attenzione alla Soglia</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Superare il 90% della FC Max (Zona Rossa) è rischioso per i principianti e dovrebbe essere fatto solo per brevi intervalli
                sotto supervisione o con adeguata preparazione atletica.
              </p>
            </div>
          </div>
        </div>

        {/* Footer for Print/Web */}
        <footer className="mt-16 pt-8 border-t border-slate-200 text-center">
          <p className="text-sm font-medium text-slate-900">CardioZone Pro</p>
          <p className="text-xs text-slate-500 mt-2">
            Sviluppato da Vincenzo Langella
            <br className="print:hidden"/>
            <span className="hidden print:inline"> - </span>
            <a href="https://www.vincenzolangella.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              www.vincenzolangella.it
            </a>
          </p>
          <p className="text-[10px] text-slate-400 mt-4 max-w-lg mx-auto print:hidden">
            Disclaimer: Le zone di frequenza cardiaca sono calcolate su stime standard (220-età). 
            Consulta sempre un medico prima di iniziare un nuovo programma di allenamento intenso.
          </p>
        </footer>
      </main>

      {/* Floating Action Button for Mobile Print/Download - Visible only on small screens */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 sm:hidden no-print z-40">
        <button 
          onClick={handlePrint}
          className="bg-white p-3 rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-indigo-600"
        >
          <Printer className="w-6 h-6" />
        </button>
        <button 
          onClick={handleDownloadExcel}
          className="bg-slate-900 p-3 rounded-full shadow-lg text-white hover:bg-slate-800"
        >
          <Download className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default App;
