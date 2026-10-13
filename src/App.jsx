import React, { useState, useEffect } from 'react';

const CLASSES = [
  { id: 'knight', name: 'Лицар', desc: 'Захист, щити та контратаки', icon: '🛡️' },
  { id: 'shadow', name: 'Тіньовик', desc: 'Ухилення, критичні удари та отрути', icon: '🗡️' },
  { id: 'arcanist', name: 'Арканіст', desc: 'Магія, стихійну шкоду та контроль', icon: '🔮' },
  { id: 'berserk', name: 'Берсерк', desc: 'Потужні атаки у небезпечному бою', icon: '🪓' },
  { id: 'ranger', name: 'Слідопит', desc: 'Дальній бій та пастки', icon: '🏹' },
  { id: 'necromancer', name: 'Некромант', desc: 'Прокляття та вампіризм', icon: '💀' }
];

const EMOJIS = ['⚔️', '🛡️', '💀', '👑', '🔥', '🐉', '😈', '🍺', '🏆', '💎', '🗡️', '🔮', '🪓', '🏹', '⚡', '🍷', '🧙‍♂️', '👹', '☠️', '🎯', '🩸', '💥', '👻', '🎃', '✨', '⚜️', '📜', '🎒', '💰', '🔑'];

export default function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [heroClass, setHeroClass] = useState('knight');
  const [tab, setTab] = useState('character');
  const [chatMsgs, setChatMsgs] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);

  const handleAuth = async () => {
    const endpoint = isLogin ? '/api/login' : '/api/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, heroClass })
      });
      const data = await res.json();
      if (data.success) {
        if (isLogin) setUser(data.user);
        else { alert('Персонажа створено! Увійдіть.'); setIsLogin(true); }
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Помилка підключення до сервера!');
    }
  };

  const sendChat = async () => {
    if (!msgText) return;
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: user.username, text: msgText })
      });
      setMsgText('');
      loadChat();
    } catch (e) {}
  };

  const loadChat = async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      setChatMsgs(data);
    } catch (e) {}
  };

  useEffect(() => {
    if (user) {
      loadChat();
      const interval = setInterval(loadChat, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-4 bg-slate-900 border border-amber-900/50 rounded-lg my-6 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-amber-500 mb-2">РАЗРУШИТЕЛИ</h1>
        <h2 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Новая Эра</h2>

        <div className="space-y-3 mb-4">
          <input 
            type="text" placeholder="Ім'я персонажа" value={username} onChange={e => setUsername(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded text-white focus:outline-none focus:border-amber-500"
          />
          <input 
            type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded text-white focus:outline-none focus:border-amber-500"
          />

          {!isLogin && (
            <div className="text-left mt-4">
              <label className="text-xs text-amber-400 font-bold mb-2 block">Оберіть клас:</label>
              <div className="grid grid-cols-2 gap-2">
                {CLASSES.map(c => (
                  <button 
                    key={c.id} onClick={() => setHeroClass(c.id)}
                    className={`p-2 border rounded text-xs text-left ${heroClass === c.id ? 'border-amber-500 bg-amber-950/40' : 'border-slate-800 bg-slate-800/50'}`}
                  >
                    <div className="font-bold text-white">{c.icon} {c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={handleAuth} className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold p-3 rounded mb-3">
          {isLogin ? 'Увійти в гру' : 'Створити персонажа'}
        </button>

        <button onClick={() => setIsLogin(!isLogin)} className="text-xs text-slate-400 underline">
          {isLogin ? 'Немає персонажа? Зареєструватися' : 'Вже є акаунт? Увійти'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 border-x border-slate-800 flex flex-col">
      <div className="bg-slate-950 p-3 border-b border-amber-900/40 flex justify-between items-center text-xs">
        <div>
          <span className="font-bold text-amber-400">{user.username}</span> 
          <span className="text-slate-500 ml-1">[{user.level} рівень]</span>
        </div>
        <div className="flex gap-3">
          <span className="text-slate-300">🪙 {user.silver}</span>
          <span className="text-amber-400 font-bold">👑 {user.gold}</span>
        </div>
      </div>

      <div className="flex border-b border-slate-800 bg-slate-950 text-xs text-center font-bold">
        {['character', 'battle', 'chat'].map(t => (
          <button 
            key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 ${tab === t ? 'text-amber-400 border-b-2 border-amber-500 bg-slate-900' : 'text-slate-400'}`}
          >
            {t === 'character' ? 'Герой' : t === 'battle' ? 'Битва' : 'Чат'}
          </button>
        ))}
      </div>

      <div className="p-3 flex-1 overflow-y-auto">
        {tab === 'character' && (
          <div className="space-y-3">
            <div className="bg-slate-800/50 p-3 border border-slate-700/50 rounded text-center">
              <div className="text-4xl my-2 animate-bounce">🛡️</div>
              <div className="font-bold text-amber-400">{user.username}</div>
              <div className="text-xs text-slate-400">Здоров'я: {user.hp} / {user.max_hp}</div>
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div className="flex flex-col h-full space-y-2">
            <div className="flex-1 bg-slate-950 p-2 border border-slate-800 rounded space-y-2 overflow-y-auto max-h-80 text-xs">
              {chatMsgs.map((m, i) => (
                <div key={i} className="border-b border-slate-900 pb-1">
                  <span className="font-bold text-amber-400">{m.sender}: </span>
                  <span className="text-slate-200">{m.text}</span>
                </div>
              ))}
            </div>

            {showEmojis && (
              <div className="grid grid-cols-6 gap-1 bg-slate-800 p-2 rounded border border-slate-700">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setMsgText(t => t + e)} className="p-1 hover:bg-slate-700 rounded text-center">
                    {e}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setShowEmojis(!showEmojis)} className="bg-slate-800 border border-slate-700 p-2 rounded">
                😃
              </button>
              <input 
                type="text" placeholder="Повідомлення..." value={msgText} onChange={e => setMsgText(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 p-2 rounded text-xs text-white"
              />
              <button onClick={sendChat} className="bg-amber-600 font-bold text-black px-3 py-2 rounded text-xs">
                Надіслати
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
        }
