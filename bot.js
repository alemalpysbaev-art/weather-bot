const fs = require('fs');
const path = require('path');

// Загрузка переменных из .env
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WAQI_TOKEN = process.env.WAQI_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!BOT_TOKEN) {
  console.error('❌ Ошибка: не указан BOT_TOKEN в файле .env');
  process.exit(1);
}

const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const USERS_DB_PATH = path.join(__dirname, 'users.json');

// ============================================================================
// 🇰🇿 СПРАВОЧНИК ВСЕХ КРУПНЫХ ГОРОДОВ КАЗАХСТАНА + КЕНТАУ
// ============================================================================
const KZ_CITIES = [
  {
    id: 'Кентау',
    title: 'Кентау, Казахстан',
    lat: 43.5206,
    lon: 68.5094,
    patterns: ['кентау', 'kentau']
  },
  {
    id: 'Туркестан',
    title: 'Туркестан, Казахстан',
    lat: 43.2973,
    lon: 68.2517,
    patterns: ['туркестан', 'түркістан', 'туркестане', 'turkestan']
  },
  {
    id: 'Шымкент',
    title: 'Шымкент, Казахстан',
    lat: 42.3417,
    lon: 69.5901,
    patterns: ['шымкент', 'шымкенте', 'чимкент', 'чимкенте', 'shymkent']
  },
  {
    id: 'Алматы',
    title: 'Алматы, Казахстан',
    lat: 43.2389,
    lon: 76.8897,
    patterns: ['алматы', 'алмате', 'алма-ата', 'almaty']
  },
  {
    id: 'Астана',
    title: 'Астана, Казахстан',
    lat: 51.1694,
    lon: 71.4491,
    patterns: ['астана', 'астане', 'астану', 'нур-султан', 'astana']
  },
  {
    id: 'Караганда',
    title: 'Караганда, Казахстан',
    lat: 49.8047,
    lon: 73.1094,
    patterns: ['караганда', 'караганде', 'караганду', 'қарағанды', 'karaganda']
  },
  {
    id: 'Актобе',
    title: 'Актобе, Казахстан',
    lat: 50.2839,
    lon: 57.1670,
    patterns: ['актобе', 'актюбинск', 'актюбинске', 'ақтөбе', 'aktobe']
  },
  {
    id: 'Тараз',
    title: 'Тараз, Казахстан',
    lat: 42.9000,
    lon: 71.3667,
    patterns: ['тараз', 'таразе', 'джамбул', 'taraz']
  },
  {
    id: 'Павлодар',
    title: 'Павлодар, Казахстан',
    lat: 52.2873,
    lon: 76.9674,
    patterns: ['павлодар', 'павлодаре', 'pavlodar']
  },
  {
    id: 'Усть-Каменогорск',
    title: 'Усть-Каменогорск, Казахстан',
    lat: 49.9483,
    lon: 82.6278,
    patterns: ['усть-каменогорск', 'усть-каменогорске', 'устькаман', 'оскемен', 'өскемен']
  },
  {
    id: 'Семей',
    title: 'Семей, Казахстан',
    lat: 50.4111,
    lon: 80.2275,
    patterns: ['семей', 'семее', 'семипалатинск', 'semey']
  },
  {
    id: 'Атырау',
    title: 'Атырау, Казахстан',
    lat: 47.1164,
    lon: 51.8833,
    patterns: ['атырау', 'гурьев', 'atyrau']
  },
  {
    id: 'Костанай',
    title: 'Костанай, Казахстан',
    lat: 53.2144,
    lon: 63.6246,
    patterns: ['костанай', 'костанае', 'кустанай', 'қостанай', 'kostanay']
  },
  {
    id: 'Кызылорда',
    title: 'Кызылорда, Казахстан',
    lat: 44.8488,
    lon: 65.4823,
    patterns: ['кызылорда', 'кызылорде', 'кызылорду', 'қызылорда', 'kyzylorda']
  },
  {
    id: 'Уральск',
    title: 'Уральск, Казахстан',
    lat: 51.2278,
    lon: 51.3865,
    patterns: ['уральск', 'уральске', 'орал', 'uralsk']
  },
  {
    id: 'Петропавловск',
    title: 'Петропавловск, Казахстан',
    lat: 54.8753,
    lon: 69.1628,
    patterns: ['петропавловск', 'петропавловске', 'петропавл']
  },
  {
    id: 'Актау',
    title: 'Актау, Казахстан',
    lat: 43.6532,
    lon: 51.1975,
    patterns: ['актау', 'ақтау', 'aktau']
  },
  {
    id: 'Кокшетау',
    title: 'Кокшетау, Казахстан',
    lat: 53.2833,
    lon: 69.3833,
    patterns: ['кокшетау', 'көкшетау', 'кокчетав']
  },
  {
    id: 'Талдыкорган',
    title: 'Талдыкорган, Казахстан',
    lat: 45.0156,
    lon: 78.3739,
    patterns: ['талдыкорган', 'талдыкоргане', 'талдықорған']
  },
  {
    id: 'Экибастуз',
    title: 'Экибастуз, Казахстан',
    lat: 51.7237,
    lon: 75.3229,
    patterns: ['экибастуз', 'экибастузе', 'екібастұз']
  },
  {
    id: 'Темиртау',
    title: 'Темиртау, Казахстан',
    lat: 50.0549,
    lon: 72.9646,
    patterns: ['темиртау', 'теміртау']
  },
  {
    id: 'Жезказган',
    title: 'Жезказган, Казахстан',
    lat: 47.7833,
    lon: 67.7667,
    patterns: ['жезказган', 'жезказгане', 'жезқазған']
  },
  {
    id: 'Балхаш',
    title: 'Балхаш, Казахстан',
    lat: 46.8442,
    lon: 74.9804,
    patterns: ['балхаш', 'балхаше', 'балқаш']
  },
  {
    id: 'Рудный',
    title: 'Рудный, Казахстан',
    lat: 52.9729,
    lon: 63.1168,
    patterns: ['рудный', 'рудном']
  }
];

// Точное совпадение, если пользователь написал просто название города (например "Кентау")
function matchExactKzCity(text) {
  const clean = text.toLowerCase().replace(/^[гc]\.?\s*/i, '').replace(/[^\p{L}-]/gu, '').trim();
  if (!clean) return null;
  for (const c of KZ_CITIES) {
    if (c.patterns.includes(clean)) {
      return c;
    }
  }
  return null;
}

// Поиск упоминания города Казахстана внутри фразы/вопроса (например: "Какая погода в Кентау?")
function detectKzCityInSentence(text) {
  const lower = text.toLowerCase();
  for (const c of KZ_CITIES) {
    for (const pat of c.patterns) {
      const regex = new RegExp(`(^|[^\\p{L}])${pat}(?=$|[^\\p{L}])`, 'iu');
      if (regex.test(lower)) {
        return c;
      }
    }
  }
  return null;
}

// База пользователей
function loadUsers() {
  try {
    if (fs.existsSync(USERS_DB_PATH)) {
      return JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Ошибка чтения users.json:', e.message);
  }
  return {};
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Ошибка записи users.json:', e.message);
  }
}

const usersDb = loadUsers();

function getUser(chatId) {
  const id = String(chatId);
  if (!usersDb[id]) {
    usersDb[id] = {
      chatId: id,
      lat: 43.5206,
      lon: 68.5094,
      title: 'Кентау, Казахстан',
      notifyTime: null,
      notifyEnabled: false,
      lastSentDate: null,
      awaitingTimeInput: false,
      awaitingCityInput: false,
      chatHistory: []
    };
    saveUsers(usersDb);
  }
  if (!Array.isArray(usersDb[id].chatHistory)) {
    usersDb[id].chatHistory = [];
  }
  return usersDb[id];
}

function updateUser(chatId, patch) {
  const u = getUser(chatId);
  // Если сменился город — очищаем историю старого города, чтобы ИИ не путал города!
  if (patch.title && patch.title !== u.title) {
    u.chatHistory = [];
  }
  Object.assign(u, patch);
  saveUsers(usersDb);
  return u;
}

function appendChatHistory(chatId, role, content) {
  const u = getUser(chatId);
  u.chatHistory.push({ role, content: String(content).slice(0, 600) });
  if (u.chatHistory.length > 8) {
    u.chatHistory = u.chatHistory.slice(-8);
  }
  saveUsers(usersDb);
}

// Справочник погодных кодов WMO
const WEATHER_CODES = {
  0: { icon: '☀️', text: 'Ясно' },
  1: { icon: '🌤', text: 'Преимущественно ясно' },
  2: { icon: '⛅', text: 'Переменная облачность' },
  3: { icon: '☁️', text: 'Пасмурно' },
  45: { icon: '🌫', text: 'Туман' },
  48: { icon: '🌫', text: 'Густой туман / изморозь' },
  51: { icon: '🌦', text: 'Легкая морось' },
  53: { icon: '🌦', text: 'Умеренная морось' },
  55: { icon: '🌧', text: 'Плотная морось' },
  61: { icon: '🌧', text: 'Небольшой дождь' },
  63: { icon: '🌧', text: 'Умеренный дождь' },
  65: { icon: '🌧', text: 'Сильный дождь' },
  66: { icon: '🌨', text: 'Ледяной дождь' },
  67: { icon: '🌨', text: 'Сильный ледяной дождь' },
  71: { icon: '🌨', text: 'Небольшой снег' },
  73: { icon: '❄️', text: 'Умеренный снег' },
  75: { icon: '❄️', text: 'Сильный снегопад' },
  77: { icon: '❄️', text: 'Снежная крупа' },
  80: { icon: '🌦', text: 'Небольшой ливень' },
  81: { icon: '🌧', text: 'Умеренный ливень' },
  82: { icon: '⛈', text: 'Сильный ливень' },
  85: { icon: '🌨', text: 'Снежный заряд' },
  86: { icon: '❄️', text: 'Снегопад с ветром' },
  95: { icon: '⛈', text: 'Гроза' },
  96: { icon: '⛈', text: 'Гроза с градом' },
  99: { icon: '⛈', text: 'Сильная гроза с градом' }
};

function getWeatherMeta(code) {
  return WEATHER_CODES[code] || { icon: '🌤', text: 'Переменная погода' };
}

// Направление ветра
function getWindDirection(deg) {
  if (deg === undefined || deg === null) return '—';
  const dirs = [
    '⬆️ С (Северный)',
    '↗️ СВ (Северо-Восточный)',
    '➡️ В (Восточный)',
    '↘️ ЮВ (Юго-Восточный)',
    '⬇️ Ю (Южный)',
    '↙️ ЮЗ (Юго-Западный)',
    '⬅️ З (Западный)',
    '↖️ СЗ (Северо-Западный)'
  ];
  return dirs[Math.round(deg / 45) % 8];
}

// Шкала Бофорта
function getWindDescription(speed) {
  if (speed < 0.5) return 'Штиль';
  if (speed < 3.3) return 'Легкий бриз';
  if (speed < 5.5) return 'Слабый ветер';
  if (speed < 8.0) return 'Умеренный ветер';
  if (speed < 10.8) return 'Свежий ветер';
  if (speed < 13.9) return 'Сильный ветер ⚠️';
  if (speed < 17.2) return 'Крепкий ветер ⚠️';
  return 'Штормовой ветер 🚨';
}

// Современный визуальный прогресс-бар
function buildProgressBar(value, maxVal, length = 10) {
  const ratio = Math.max(0, Math.min(1, value / maxVal));
  const filled = Math.round(ratio * length);
  return '▰'.repeat(filled) + '▱'.repeat(length - filled);
}

// Оценка индекса качества воздуха (AQI)
function getAqiInfo(aqi) {
  const val = Number(aqi);
  if (isNaN(val)) {
    return {
      emoji: '⚪',
      badge: 'НЕТ ДАННЫХ',
      bar: '▱▱▱▱▱▱▱▱▱▱',
      advice: 'Точные данные по индексу AQI временно недоступны.'
    };
  }
  const bar = buildProgressBar(val, 250, 10);
  if (val <= 50) {
    return {
      emoji: '🟢',
      badge: 'ЧИСТЫЙ ВОЗДУХ',
      bar,
      advice: 'Идеальные условия для прогулок, бега на свежем воздухе и проветривания.'
    };
  }
  if (val <= 100) {
    return {
      emoji: '🟡',
      badge: 'УМЕРЕННО',
      bar,
      advice: 'Воздух в пределах нормы. Чувствительным людям лучше избегать прогулок вдоль трасс.'
    };
  }
  if (val <= 150) {
    return {
      emoji: '🟠',
      badge: 'НЕЗДОРОВЫЙ ДЛЯ ЧУВСТВИТЕЛЬНЫХ',
      bar,
      advice: 'Людям с астмой, аллергией и детям стоит сократить интенсивные нагрузки на улице.'
    };
  }
  if (val <= 200) {
    return {
      emoji: '🔴',
      badge: 'ВРЕДНЫЙ ВОЗДУХ (СМОГ)',
      bar,
      advice: 'Закройте окна, включите очиститель воздуха и ограничьте пребывание на улице.'
    };
  }
  if (val <= 300) {
    return {
      emoji: '🟣',
      badge: 'ОЧЕНЬ ВРЕДНЫЙ',
      bar,
      advice: 'Опасно для здоровья! Не открывайте окна, на улице используйте респиратор FFP2/KN95.'
    };
  }
  return {
    emoji: '🟤',
    badge: 'ЭКСТРЕМАЛЬНО ОПАСНО',
    bar,
    advice: 'Чрезвычайная экологическая ситуация! Оставайтесь дома с закрытыми окнами.'
  };
}

// Оценка УФ-индекса
function getUvDescription(uv) {
  if (uv === undefined || uv === null) return '—';
  const v = Number(uv).toFixed(1);
  if (uv < 3) return `${v} 🟢 Низкий`;
  if (uv < 6) return `${v} 🟡 Умеренный (нужны очки/SPF)`;
  if (uv < 8) return `${v} 🟠 Высокий (защита SPF 30+)`;
  if (uv < 11) return `${v} 🔴 Очень высокий (SPF 50+)`;
  return `${v} 🟣 Экстремальный`;
}

// Форматирование температуры со знаком
function fmtTemp(t) {
  const r = Math.round(t);
  return r > 0 ? `+${r}°` : `${r}°`;
}

// Дни недели для 3-дневного прогноза
function formatDayLabel(dateStr, index) {
  const d = new Date(`${dateStr}T12:00:00`);
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const dayName = days[d.getDay()];
  const datePart = `${d.getDate()} ${months[d.getMonth()]}`;
  if (index === 0) return `Сегодня (${datePart}, ${dayName})`;
  if (index === 1) return `Завтра (${datePart}, ${dayName})`;
  return `${dayName}, ${datePart}`;
}

// Главное меню внизу экрана
const MAIN_REPLY_KEYBOARD = {
  keyboard: [
    [{ text: '📍 Отправить мою геопозицию', request_location: true }],
    [{ text: '🤖 Спросить ИИ' }, { text: '📊 Мой город сейчас' }],
    [{ text: '🏙 Города Казахстана' }, { text: '⏰ Время рассылки' }],
    [{ text: 'ℹ️ О источниках' }]
  ],
  resize_keyboard: true
};

// Инлайн-клавиатура: Кентау + все крупные города Казахстана
const KZ_CITIES_INLINE = {
  inline_keyboard: [
    [
      { text: '⭐ Кентау', callback_data: 'city:Кентау' },
      { text: '🇰🇿 Туркестан', callback_data: 'city:Туркестан' },
      { text: '🇰🇿 Шымкент', callback_data: 'city:Шымкент' }
    ],
    [
      { text: '🇰🇿 Алматы', callback_data: 'city:Алматы' },
      { text: '🇰🇿 Астана', callback_data: 'city:Астана' },
      { text: '🇰🇿 Караганда', callback_data: 'city:Караганда' }
    ],
    [
      { text: '🇰🇿 Тараз', callback_data: 'city:Тараз' },
      { text: '🇰🇿 Кызылорда', callback_data: 'city:Кызылорда' },
      { text: '🇰🇿 Актобе', callback_data: 'city:Актобе' }
    ],
    [
      { text: '🇰🇿 Атырау', callback_data: 'city:Атырау' },
      { text: '🇰🇿 Актау', callback_data: 'city:Актау' },
      { text: '🇰🇿 Уральск', callback_data: 'city:Уральск' }
    ],
    [
      { text: '🇰🇿 Павлодар', callback_data: 'city:Павлодар' },
      { text: '🇰🇿 Семей', callback_data: 'city:Семей' },
      { text: '🇰🇿 Усть-Каменогорск', callback_data: 'city:Усть-Каменогорск' }
    ],
    [
      { text: '🇰🇿 Костанай', callback_data: 'city:Костанай' },
      { text: '🇰🇿 Кокшетау', callback_data: 'city:Кокшетау' },
      { text: '🇰🇿 Петропавловск', callback_data: 'city:Петропавловск' }
    ],
    [
      { text: '🇰🇿 Талдыкорган', callback_data: 'city:Талдыкорган' },
      { text: '🇰🇿 Жезказган', callback_data: 'city:Жезказган' },
      { text: '🇰🇿 Экибастуз', callback_data: 'city:Экибастуз' }
    ]
  ]
};

// Инлайн-кнопки под отчетом
function buildReportInlineKeyboard(lat, lon) {
  const coords = `${Number(lat).toFixed(4)},${Number(lon).toFixed(4)}`;
  return {
    inline_keyboard: [
      [
        { text: '🤖 Полный ИИ-разбор дня', callback_data: `ai:${coords}` }
      ],
      [
        { text: '📊 График 24ч + Фото', callback_data: `hourly24:${coords}` },
        { text: '📅 Прогноз на 3 дня', callback_data: `daily3:${coords}` }
      ],
      [
        { text: '🫁 Химия воздуха', callback_data: `air:${coords}` },
        { text: '🔄 Обновить', callback_data: `refresh:${coords}` }
      ],
      [
        { text: '🏙 Сменить город', callback_data: `open_cities:${coords}` },
        { text: '⏰ Рассылка', callback_data: `schedmenu:${coords}` }
      ]
    ]
  };
}

// Клавиатура настройки времени рассылки
function buildScheduleKeyboard(user) {
  const status = user.notifyEnabled && user.notifyTime
    ? `🔔 Сейчас: включена в ${user.notifyTime}`
    : `🔕 Сейчас: выключена`;

  return {
    inline_keyboard: [
      [
        { text: '🌅 07:00', callback_data: 'settime:07:00' },
        { text: '🌅 08:00', callback_data: 'settime:08:00' },
        { text: '☀️ 09:00', callback_data: 'settime:09:00' }
      ],
      [
        { text: '🕛 12:00', callback_data: 'settime:12:00' },
        { text: '🌇 18:00', callback_data: 'settime:18:00' },
        { text: '🌙 21:00', callback_data: 'settime:21:00' }
      ],
      [
        { text: '⌨️ Ввести своё время (ЧЧ:ММ)', callback_data: 'settime:custom' }
      ],
      [
        { text: user.notifyEnabled ? '🔕 Отключить рассылку' : status, callback_data: 'settime:off' }
      ]
    ]
  };
}

// Вызов метода Telegram Bot API
async function tgCall(method, body) {
  const res = await fetch(`${TG_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

// Прямой геокодинг (с приоритетом нашей базы городов Казахстана)
async function geocodeCity(cityName) {
  const kzMatch = matchExactKzCity(cityName) || detectKzCityInSentence(cityName);
  if (kzMatch) {
    return {
      name: kzMatch.id,
      country: 'Казахстан',
      admin1: '',
      lat: kzMatch.lat,
      lon: kzMatch.lon
    };
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=ru&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;

  // Приоритет городам из Казахстана, если есть среди результатов
  const kzItem = data.results.find(r => r.country_code === 'KZ');
  const item = kzItem || data.results[0];
  return {
    name: item.name,
    country: item.country || '',
    admin1: item.admin1 || '',
    lat: item.latitude,
    lon: item.longitude
  };
}

// Обратный геокодинг по координатам
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ru`;
    const res = await fetch(url);
    const data = await res.json();
    const parts = [data.city || data.locality, data.principalSubdivision, data.countryName].filter(Boolean);
    return parts.length > 0 ? parts.slice(0, 2).join(', ') : `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

// Запрос всех метео- и эко-данных
async function fetchAllEnvData(lat, lon) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,apparent_temperature,wind_speed_10m,wind_gusts_10m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max&wind_speed_unit=ms&timezone=auto&forecast_days=4`;
  const openMeteoAirUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index&timezone=auto`;
  const waqiUrl = WAQI_TOKEN
    ? `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`
    : null;

  const [weatherRes, omAirRes, waqiRes] = await Promise.allSettled([
    fetch(weatherUrl).then(r => r.json()),
    fetch(openMeteoAirUrl).then(r => r.json()),
    waqiUrl ? fetch(waqiUrl).then(r => r.json()) : Promise.resolve(null)
  ]);

  return {
    weather: weatherRes.status === 'fulfilled' ? weatherRes.value : null,
    omAir: omAirRes.status === 'fulfilled' ? omAirRes.value : null,
    waqi: waqiRes.status === 'fulfilled' ? waqiRes.value : null
  };
}

// ============================================================================
// 📸 ГЕНЕРАЦИЯ ФОТО-ГРАФИКА НА 24 ЧАСА (Modern Dark UI Chart)
// ============================================================================

async function generateHourlyChartImageUrl(placeTitle, data) {
  const hourly = data.weather?.hourly;
  if (!hourly || !hourly.time) return null;

  const nowIso = data.weather?.current?.time || new Date().toISOString().slice(0, 13);
  let startIdx = hourly.time.findIndex(t => t >= nowIso);
  if (startIdx === -1) startIdx = 0;

  const sliceCount = Math.min(startIdx + 24, hourly.time.length);
  const labels = [];
  const temps = [];
  const winds = [];
  const rains = [];

  for (let i = startIdx; i < sliceCount; i++) {
    labels.push(hourly.time[i].split('T')[1].slice(0, 5));
    temps.push(Math.round(hourly.temperature_2m[i]));
    winds.push(Number(Number(hourly.wind_speed_10m[i]).toFixed(1)));
    rains.push(hourly.precipitation_probability?.[i] ?? 0);
  }

  const chartConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Температура (°C)',
          data: temps,
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.18)',
          borderWidth: 3,
          pointRadius: 3,
          pointBackgroundColor: '#38bdf8',
          fill: true,
          yAxisID: 'yTemp'
        },
        {
          type: 'line',
          label: 'Ветер (м/с)',
          data: winds,
          borderColor: '#a855f7',
          borderWidth: 2,
          borderDash: [4, 4],
          pointRadius: 2,
          fill: false,
          yAxisID: 'yTemp'
        },
        {
          type: 'bar',
          label: 'Осадки (%)',
          data: rains,
          backgroundColor: 'rgba(59, 130, 246, 0.28)',
          borderColor: 'rgba(59, 130, 246, 0.6)',
          borderWidth: 1,
          yAxisID: 'yRain'
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: `SALEM RADAR • Почасовой график 24ч (${placeTitle})`,
        fontColor: '#f8fafc',
        fontSize: 16
      },
      legend: {
        labels: {
          fontColor: '#cbd5e1',
          fontSize: 12
        }
      },
      scales: {
        xAxes: [
          {
            ticks: { fontColor: '#94a3b8', fontSize: 10 },
            gridLines: { color: 'rgba(148, 163, 184, 0.12)' }
          }
        ],
        yAxes: [
          {
            id: 'yTemp',
            position: 'left',
            ticks: { fontColor: '#38bdf8', fontSize: 11 },
            gridLines: { color: 'rgba(148, 163, 184, 0.15)' },
            scaleLabel: {
              display: true,
              labelString: '°C / Ветер (м/с)',
              fontColor: '#38bdf8'
            }
          },
          {
            id: 'yRain',
            position: 'right',
            ticks: { min: 0, max: 100, fontColor: '#60a5fa', fontSize: 10 },
            gridLines: { display: false },
            scaleLabel: {
              display: true,
              labelString: 'Осадки (%)',
              fontColor: '#60a5fa'
            }
          }
        ]
      }
    }
  };

  try {
    const res = await fetch('https://quickchart.io/chart/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        backgroundColor: '#0f172a',
        width: 900,
        height: 460,
        format: 'png',
        chart: chartConfig
      })
    });
    const json = await res.json();
    if (json && json.url) {
      return json.url;
    }
  } catch (err) {
    console.error('Ошибка генерации фото-графика:', err.message);
  }
  return null;
}

// ============================================================================
// 🧠 УМНЫЙ И АДАПТИВНЫЙ ИИ-МОДУЛЬ
// ============================================================================

function buildDeepTelemetryContext(placeTitle, data) {
  const w = data.weather?.current || {};
  const om = data.omAir?.current || {};
  const waqiData = data.waqi?.status === 'ok' ? data.waqi.data : null;
  const daily = data.weather?.daily || {};
  const hourly = data.weather?.hourly || {};

  const waqiAqi = waqiData && !isNaN(Number(waqiData.aqi)) ? Number(waqiData.aqi) : null;
  const aqi = waqiAqi ?? om.us_aqi ?? 35;

  const hourlyDigest = [];
  if (hourly.time) {
    const nowIso = w.time || new Date().toISOString().slice(0, 13);
    let startIdx = hourly.time.findIndex(t => t >= nowIso);
    if (startIdx === -1) startIdx = 0;
    const endIdx = Math.min(startIdx + 24, hourly.time.length);
    for (let i = startIdx; i < endIdx; i += 3) {
      const hr = hourly.time[i].split('T')[1].slice(0, 5);
      const temp = Math.round(hourly.temperature_2m[i]);
      const wind = hourly.wind_speed_10m[i];
      const rain = hourly.precipitation_probability?.[i] ?? 0;
      const cond = getWeatherMeta(hourly.weather_code?.[i]).text;
      hourlyDigest.push(`${hr}: ${temp}°C (${cond}, ветер ${wind} м/с, осадки ${rain}%)`);
    }
  }

  const dailyDigest = [];
  if (daily.time) {
    const count = Math.min(4, daily.time.length);
    for (let i = 0; i < count; i++) {
      const label = formatDayLabel(daily.time[i], i);
      const cond = getWeatherMeta(daily.weather_code[i]).text;
      const tMax = Math.round(daily.temperature_2m_max[i]);
      const tMin = Math.round(daily.temperature_2m_min[i]);
      const windMax = daily.wind_speed_10m_max[i];
      const rainProb = daily.precipitation_probability_max?.[i] ?? 0;
      dailyDigest.push(`${label}: ${cond}, днем ${tMax}°C / ночью ${tMin}°C, ветер до ${windMax} м/с, вер. осадков ${rainProb}%`);
    }
  }

  return {
    placeTitle,
    temp: Math.round(w.temperature_2m ?? 15),
    feels: Math.round(w.apparent_temperature ?? w.temperature_2m ?? 15),
    humidity: w.relative_humidity_2m ?? 50,
    pressureMm: w.surface_pressure ? Math.round(w.surface_pressure * 0.750062) : 750,
    windSpeed: w.wind_speed_10m ?? 2,
    windGusts: w.wind_gusts_10m ?? 4,
    windDir: getWindDirection(w.wind_direction_10m),
    weatherText: getWeatherMeta(w.weather_code).text,
    aqi,
    waqiStation: waqiData?.city?.name || 'Спутниковая сеть CAMS',
    pm25: om.pm2_5 ?? waqiData?.iaqi?.pm25?.v ?? 10,
    pm10: om.pm10 ?? waqiData?.iaqi?.pm10?.v ?? 20,
    no2: om.nitrogen_dioxide ?? '—',
    o3: om.ozone ?? '—',
    co: om.carbon_monoxide ?? '—',
    dust: om.dust ?? 0,
    uv: om.uv_index ?? 1,
    todayMax: daily.temperature_2m_max?.[0] !== undefined ? Math.round(daily.temperature_2m_max[0]) : null,
    todayMin: daily.temperature_2m_min?.[0] !== undefined ? Math.round(daily.temperature_2m_min[0]) : null,
    tomorrowMax: daily.temperature_2m_max?.[1] !== undefined ? Math.round(daily.temperature_2m_max[1]) : null,
    tomorrowMin: daily.temperature_2m_min?.[1] !== undefined ? Math.round(daily.temperature_2m_min[1]) : null,
    rainProbToday: daily.precipitation_probability_max?.[0] ?? 0,
    rainProbTomorrow: daily.precipitation_probability_max?.[1] ?? 0,
    hourlyDigest,
    dailyDigest
  };
}

async function callCloudLlm(systemInstruction, historyMessages, userMessage) {
  if (GEMINI_API_KEY) {
    const geminiEndpoints = [
      `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`
    ];

    const fullPrompt = [
      systemInstruction,
      '',
      historyMessages.length > 0
        ? 'История предыдущих сообщений:\n' + historyMessages.map(m => `${m.role === 'user' ? 'Пользователь' : 'Ассистент'}: ${m.content}`).join('\n')
        : '',
      `Текущий запрос пользователя: ${userMessage}`
    ].filter(Boolean).join('\n');

    for (const url of geminiEndpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
          })
        });
        if (res.ok) {
          const json = await res.json();
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 10) {
            return text.trim();
          }
        }
      } catch {
        // Переходим к следующему провайдеру
      }
    }
  }

  try {
    const messages = [
      { role: 'system', content: systemInstruction },
      ...historyMessages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage }
    ];

    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages,
        temperature: 0.7
      })
    });

    if (res.ok) {
      const json = await res.json();
      const reply = json?.choices?.[0]?.message?.content;
      if (reply && reply.trim().length > 10) {
        return reply.trim();
      }
    }
  } catch (err) {
    console.error('Ошибка облачного ИИ-шлюза:', err.message);
  }

  return null;
}

function formatLlmToTelegramHtml(rawText, placeTitle) {
  let cleaned = rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/__(.+?)__/g, '<i>$1</i>')
    .replace(/^#{1,3}\s+(.+)$/gm, '<b>$1</b>');

  return [
    `🤖 <b>SALEM AI • ИНТЕЛЛЕКТУАЛЬНЫЙ АССИСТЕНТ</b>`,
    `📍 <b>${placeTitle}</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    cleaned
  ].join('\n');
}

function generateContextualLocalFallback(t, userQuestion = null) {
  const q = (userQuestion || '').toLowerCase();

  if (!userQuestion) {
    const outfit = t.feels <= 0
      ? 'Зимняя куртка или пуховик, шапка и перчатки.'
      : t.feels <= 12
        ? 'Куртка, ветровка или пальто поверх худи/свитера.'
        : t.feels <= 20
          ? 'Худи, толстовка или легкая куртка.'
          : 'Легкая одежда (футболка/рубашка).';

    const airMsg = t.aqi <= 50
      ? `Воздух чистый (AQI ${t.aqi}, PM2.5: ${t.pm25} мкг/м³) — отлично для спорта и прогулок.`
      : t.aqi <= 100
        ? `Воздух приемлемый (AQI ${t.aqi}, PM2.5: ${t.pm25} мкг/м³) — гулять можно спокойно.`
        : `Воздух загрязнен (AQI ${t.aqi}, PM2.5: ${t.pm25} мкг/м³) — сократите нагрузку на улице и закройте окна.`;

    return [
      `🤖 <b>SALEM AI • КОМПЛЕКСНЫЙ РАЗБОР ДНЯ</b>`,
      `📍 <b>${t.placeTitle}</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `✨ <b>Salem!</b> Сейчас в <b>${t.placeTitle}</b> за окном <b>${fmtTemp(t.temp)}C</b> (${t.weatherText.toLowerCase()}, ощущается как <b>${fmtTemp(t.feels)}C</b>), ветер ${t.windSpeed} м/с.`,
      ``,
      `• 🧥 <b>Одежда:</b> ${outfit}`,
      `• 🫁 <b>Дыхание и спорт:</b> ${airMsg}`,
      `• 📈 <b>Динамика:</b> Сегодня от ${fmtTemp(t.todayMin ?? t.temp)}C до ${fmtTemp(t.todayMax ?? t.temp)}C (осадки ${t.rainProbToday}%), завтра до ${fmtTemp(t.tomorrowMax ?? t.temp)}C.`
    ].join('\n');
  }

  if (/^(привет|салем|salem|здравствуй|хай|как дела|чо там|че там)/i.test(q)) {
    return [
      `🤖 <b>SALEM AI</b> • 📍 <b>${t.placeTitle}</b>`,
      ``,
      `✨ <b>Salem!</b> Я на связи и слежу за обстановкой в <b>${t.placeTitle}</b>.`,
      `Прямо сейчас на улице <b>${fmtTemp(t.temp)}C</b> (${t.weatherText.toLowerCase()}), ветер ${t.windSpeed} м/с, а индекс чистоты воздуха — <b>${t.aqi} AQI</b> (PM2.5: ${t.pm25} мкг/м³).`,
      ``,
      `Спрашивай о чем угодно или просто напиши название любого города Казахстана (например: <code>Кентау</code>, <code>Туркестан</code>, <code>Шымкент</code>, <code>Астана</code>)!`
    ].join('\n');
  }

  return [
    `🤖 <b>SALEM AI</b> • 📍 <b>${t.placeTitle}</b>`,
    ``,
    `По твоему вопросу (<i>«${userQuestion}»</i>):`,
    `• Сейчас в <b>${t.placeTitle}</b>: <b>${fmtTemp(t.temp)}C</b> (ощущается как <b>${fmtTemp(t.feels)}C</b>), ${t.weatherText.toLowerCase()}.`,
    `• Ветер: <b>${t.windSpeed} м/с</b> (порывы до ${t.windGusts} м/с), давление ${t.pressureMm} мм рт. ст.`,
    `• Воздух: <b>AQI ${t.aqi}</b> (PM2.5: ${t.pm25} мкг/м³, PM10: ${t.pm10} мкг/м³).`,
    `• Ближайшие часы: ${t.hourlyDigest.slice(0, 3).join(' → ')}.`
  ].join('\n');
}

async function generateAiReport(chatId, placeTitle, data, userQuestion = null) {
  const user = getUser(chatId);
  const t = buildDeepTelemetryContext(placeTitle, data);

  const systemPrompt = [
    `Ты — Salem AI, умный, живой, эрудированный и адаптированный ИИ-ассистент в Telegram-боте погоды и экологии воздуха.`,
    `ВАЖНО: Сейчас у пользователя выбран город: ${t.placeTitle}. Вся телеметрия ниже относится ИМЕННО к городу ${t.placeTitle}! Никогда не говори про другой город, если пользователь сам не попросил.`,
    `Твой стиль: современный, дружелюбный, экспертный, без воды. Обращайся к пользователю на «ты».`,
    `НЕ используй одинаковые шаблонные списки в каждом ответе! Адаптируйся под конкретную реплику пользователя:`,
    `- Если пользователь поздоровался — ответь живо («Salem!»), в 2-3 предложениях расскажи, как сейчас погода и воздух в ${t.placeTitle}.`,
    `- Если пользователь задал конкретный вопрос — дай точный, продуманный ответ ИМЕННО на этот вопрос для города ${t.placeTitle}, аргументируя реальными цифрами из телеметрии ниже.`,
    `- Не используй заголовки с решетками (###), для выделения важного используй жирный шрифт **текст** и эмодзи.`,
    ``,
    `📡 АКТУАЛЬНАЯ ТЕЛЕМЕТРИЯ ДЛЯ ГОРОДА: ${t.placeTitle}`,
    `• Сейчас: ${t.weatherText}, температура ${t.temp}°C (ощущается как ${t.feels}°C), влажность ${t.humidity}%, давление ${t.pressureMm} мм рт. ст., УФ-индекс: ${t.uv}`,
    `• Ветер: ${t.windSpeed} м/с (порывы до ${t.windGusts} м/с), направление: ${t.windDir}`,
    `• Качество воздуха: общий индекс AQI = ${t.aqi} (станция: ${t.waqiStation})`,
    `• Химический состав воздуха: PM2.5 = ${t.pm25} мкг/м³ (норма ВОЗ до 15), PM10 = ${t.pm10} мкг/м³ (норма до 45), NO₂ = ${t.no2} мкг/м³, O₃ = ${t.o3} мкг/м³, CO = ${t.co} мкг/м³, пыль = ${t.dust} мкг/м³`,
    `• Почасовой прогноз на ближайшие 24 часа: ${t.hourlyDigest.join(' | ')}`,
    `• Прогноз по дням (сегодня + 3 дня): ${t.dailyDigest.join(' || ')}`
  ].join('\n');

  const promptForModel = userQuestion
    ? userQuestion
    : `Сделай полный, живой и умный ИИ-разбор обстановки на сегодня в городе ${t.placeTitle}: что надеть, стоит ли гулять/бегать, можно ли проветривать квартиру и как изменится погода в ближайшие часы.`;

  const llmReply = await callCloudLlm(systemPrompt, user.chatHistory || [], promptForModel);

  if (llmReply) {
    if (userQuestion) {
      appendChatHistory(chatId, 'user', userQuestion);
      appendChatHistory(chatId, 'assistant', llmReply);
    }
    return formatLlmToTelegramHtml(llmReply, placeTitle);
  }

  return generateContextualLocalFallback(t, userQuestion);
}

// ============================================================================
// ФОРМАТИРОВАНИЕ КАРТОЧЕК
// ============================================================================

function formatMainReport(placeTitle, data, isScheduled = false) {
  const w = data.weather?.current;
  const om = data.omAir?.current;
  const waqiData = data.waqi?.status === 'ok' ? data.waqi.data : null;

  if (!w) {
    return '⚠️ Не удалось получить метеоданные. Попробуйте чуть позже.';
  }

  const meta = getWeatherMeta(w.weather_code);
  const temp = fmtTemp(w.temperature_2m);
  const feels = fmtTemp(w.apparent_temperature);

  const windSpeed = w.wind_speed_10m;
  const windGusts = w.wind_gusts_10m;
  const windDir = getWindDirection(w.wind_direction_10m);
  const windText = getWindDescription(windSpeed);
  const pressureMm = w.surface_pressure ? Math.round(w.surface_pressure * 0.750062) : '—';

  const waqiAqi = waqiData && !isNaN(Number(waqiData.aqi)) ? Number(waqiData.aqi) : null;
  const omAqi = om?.us_aqi ?? null;
  const primaryAqi = waqiAqi !== null ? waqiAqi : omAqi;
  const aqiInfo = getAqiInfo(primaryAqi);

  const pm25 = om?.pm2_5 !== undefined ? `${om.pm2_5} мкг/м³` : (waqiData?.iaqi?.pm25?.v ? `${waqiData.iaqi.pm25.v}` : '—');
  const pm10 = om?.pm10 !== undefined ? `${om.pm10} мкг/м³` : (waqiData?.iaqi?.pm10?.v ? `${waqiData.iaqi.pm10.v}` : '—');
  const stationName = waqiData?.city?.name || 'Спутниковая сеть CAMS';

  const headerBadge = isScheduled
    ? `🔔 <b>ЕЖЕДНЕВНАЯ СВОДКА • SALEM!</b>\n`
    : `✨ <b>SALEM • МЕТЕО & ЭКО РАДАР</b>\n`;

  const lines = [
    headerBadge + `📍 <b>${placeTitle}</b>`,
    ``,
    `╭─ 🌡 <b>ПОГОДА СЕЙЧАС</b>`,
    `├ ${meta.icon} <b>${meta.text}</b>`,
    `├ Температура: <b>${temp}C</b> <i>(ощущается ${feels}C)</i>`,
    `├ Влажность: <b>${w.relative_humidity_2m}%</b>  •  Давление: <b>${pressureMm} мм</b>`,
    `╰ УФ-индекс: ${getUvDescription(om?.uv_index)}`,
    ``,
    `╭─ 💨 <b>ВЕТЕР И АЭРОДИНАМИКА</b>`,
    `├ Скорость: <b>${windSpeed} м/с</b> <i>(${windText})</i>`,
    `├ Порывы: до <b>${windGusts} м/с</b>`,
    `╰ Направление: ${windDir}`,
    ``,
    `╭─ 🫁 <b>КАЧЕСТВО ВОЗДУХА (AQI)</b>`,
    `├ ${aqiInfo.emoji} <b>${aqiInfo.badge}</b>`,
    `├ Шкала: <code>[${aqiInfo.bar}]</code> <b>${primaryAqi ?? '—'} AQI</b>`
  ];

  if (waqiAqi !== null) {
    lines.push(`├ 📡 Наземный датчик: <b>${waqiAqi} AQI</b> <i>(${stationName})</i>`);
  }
  if (omAqi !== null) {
    lines.push(`├ 🛰 Спутник CAMS: <b>${omAqi} US AQI</b> <i>(EU: ${om?.european_aqi ?? '—'})</i>`);
  }

  lines.push(
    `├ Мелкая пыль PM2.5: <b>${pm25}</b>`,
    `╰ Крупная пыль PM10: <b>${pm10}</b>`,
    ``,
    `💡 <i>${aqiInfo.advice}</i>`
  );

  return lines.join('\n');
}

// Детальный почасовой график на 24 часа (текст)
function formatHourly24Report(placeTitle, data) {
  const hourly = data.weather?.hourly;
  if (!hourly || !hourly.time) {
    return '⚠️ Почасовой график временно недоступен.';
  }

  const nowIso = data.weather?.current?.time || new Date().toISOString().slice(0, 13);
  let startIdx = hourly.time.findIndex(t => t >= nowIso);
  if (startIdx === -1) startIdx = 0;

  const sliceCount = Math.min(startIdx + 24, hourly.time.length);
  const temps = [];
  for (let i = startIdx; i < sliceCount; i++) {
    temps.push(hourly.temperature_2m[i]);
  }
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const range = Math.max(1, maxT - minT);

  const lines = [
    `📊 <b>ДЕТАЛЬНЫЙ ГРАФИК НА 24 ЧАСА (ПО ЧАСАМ)</b>`,
    `📍 <b>${placeTitle}</b>`,
    `╭─ Диапазон: от <b>${fmtTemp(minT)}C</b> до <b>${fmtTemp(maxT)}C</b>`,
    `╰─ Формат: <code>Час | Погода | График | Ветер | Осадки</code>`,
    ``
  ];

  for (let i = startIdx; i < sliceCount; i++) {
    const timeStr = hourly.time[i].split('T')[1].slice(0, 5);
    const rawT = hourly.temperature_2m[i];
    const tStr = fmtTemp(rawT).padStart(4, ' ');
    const wind = Number(hourly.wind_speed_10m[i]).toFixed(1).padStart(4, ' ');
    const rainProb = String(hourly.precipitation_probability?.[i] ?? 0).padStart(2, ' ');
    const code = hourly.weather_code?.[i] ?? 0;
    const icon = getWeatherMeta(code).icon;

    const barFill = Math.round(((rawT - minT) / range) * 5);
    const miniBar = '▰'.repeat(barFill) + '▱'.repeat(5 - barFill);

    lines.push(
      `<code>${timeStr}</code> ${icon} <code>${tStr} ${miniBar}</code> 💨<code>${wind}</code>м/с 💧<code>${rainProb}%</code>`
    );
  }

  lines.push(
    ``,
    `⚠️ <b>Предупреждение:</b> <i>Почасовой график на 24 часа является метеорологическим прогнозом (расчет численной модели Open-Meteo). Фактическая погода и скорость ветра могут незначительно отличаться.</i>`
  );

  return lines.join('\n');
}

// Отправка 24-часового отчета: ФОТО ГРАФИКА + ДЕТАЛЬНАЯ ТАБЛИЦА
async function sendHourly24WithPhoto(chatId, lat, lon, placeTitle, envData) {
  const [chartUrl, textReport] = await Promise.all([
    generateHourlyChartImageUrl(placeTitle, envData),
    Promise.resolve(formatHourly24Report(placeTitle, envData))
  ]);

  if (chartUrl) {
    await tgCall('sendPhoto', {
      chat_id: chatId,
      photo: chartUrl,
      caption: `📈 <b>Визуальный график погоды, ветра и осадков на 24 часа</b>\n📍 <b>${placeTitle}</b>\n<i>Ниже — подробная почасовая расшифровка 👇</i>`,
      parse_mode: 'HTML'
    });
  }

  await tgCall('sendMessage', {
    chat_id: chatId,
    text: textReport,
    parse_mode: 'HTML',
    reply_markup: buildReportInlineKeyboard(lat, lon)
  });
}

// Прогноз погоды на 3 дня вперед
function formatThreeDayForecast(placeTitle, data) {
  const daily = data.weather?.daily;
  if (!daily || !daily.time) {
    return '⚠️ Прогноз на 3 дня временно недоступен.';
  }

  const lines = [
    `📅 <b>ПРОГНОЗ ПОГОДЫ НА 3 ДНЯ ВПЕРЕД</b>`,
    `📍 <b>${placeTitle}</b>`,
    ``
  ];

  const daysCount = Math.min(4, daily.time.length);
  for (let i = 0; i < daysCount; i++) {
    const label = formatDayLabel(daily.time[i], i);
    const meta = getWeatherMeta(daily.weather_code[i]);
    const tMax = fmtTemp(daily.temperature_2m_max[i]);
    const tMin = fmtTemp(daily.temperature_2m_min[i]);
    const fMax = fmtTemp(daily.apparent_temperature_max[i]);
    const windMax = daily.wind_speed_10m_max[i];
    const gustMax = daily.wind_gusts_10m_max[i];
    const rainProb = daily.precipitation_probability_max?.[i] ?? 0;
    const rainSum = daily.precipitation_sum?.[i] ?? 0;
    const uvMax = daily.uv_index_max?.[i] ?? '—';

    lines.push(
      `╭─ 🗓 <b>${label.toUpperCase()}</b>`,
      `├ ${meta.icon} <b>${meta.text}</b>`,
      `├ 🌡 Днем: <b>${tMax}C</b>  •  Ночью: <b>${tMin}C</b> <i>(ощущ. до ${fMax}C)</i>`,
      `├ 💨 Ветер: до <b>${windMax} м/с</b> <i>(порывы до ${gustMax} м/с)</i>`,
      `╰ ☔ Осадки: <b>${rainProb}%</b> (${rainSum} мм)  •  ☀️ УФ: <b>${uvMax}</b>`,
      ``
    );
  }

  lines.push(
    `⚠️ <b>Важное предупреждение:</b>`,
    `<i>Данные на 3 дня вперед носят прогностический характер и рассчитаны суперкомпьютерными метеомоделями. При планировании важных поездок рекомендуем перепроверять сводку в день выезда.</i>`
  );

  return lines.join('\n');
}

// Подробный химический состав воздуха
function formatDetailedAirReport(placeTitle, data) {
  const om = data.omAir?.current;
  const waqiData = data.waqi?.status === 'ok' ? data.waqi.data : null;

  if (!om && !waqiData) {
    return '⚠️ Детальные данные о составе воздуха временно недоступны.';
  }

  const waqiAqi = waqiData && !isNaN(Number(waqiData.aqi)) ? Number(waqiData.aqi) : null;
  const omAqi = om?.us_aqi ?? null;
  const primaryAqi = waqiAqi ?? omAqi;
  const aqiInfo = getAqiInfo(primaryAqi);

  const lines = [
    `🫁 <b>ХИМИЧЕСКИЙ АНАЛИЗ ВОЗДУХА</b>`,
    `📍 <b>${placeTitle}</b>`,
    ``,
    `╭─ ${aqiInfo.emoji} <b>СТАТУС: ${aqiInfo.badge}</b>`,
    `╰─ Шкала: <code>[${aqiInfo.bar}]</code> <b>${primaryAqi ?? '—'} AQI</b>`,
    ``
  ];

  if (waqiData) {
    lines.push(
      `╭─ 📡 <b>1. НАЗЕМНАЯ СТАНЦИЯ МОНИТОРИНГА (WAQI)</b>`,
      `├ Станция: <code>${waqiData.city?.name || 'Локальный датчик'}</code>`,
      `├ Индекс AQI: <b>${waqiData.aqi}</b>`,
      `├ Главный загрязнитель: <b>${(waqiData.dominentpol || 'pm25').toUpperCase()}</b>`,
      `╰ Замер: ${waqiData.time?.s || 'актуальный'}`,
      ``
    );
  }

  if (om) {
    lines.push(
      `╭─ 🛰 <b>2. КОНЦЕНТРАЦИЯ ЧАСТИЦ (OPEN-METEO CAMS)</b>`,
      `├ <b>PM2.5</b> (мелкий смог): <b>${om.pm2_5 ?? '—'}</b> мкг/м³ <i>(норма ВОЗ &lt; 15)</i>`,
      `├ <b>PM10</b> (пыль): <b>${om.pm10 ?? '—'}</b> мкг/м³ <i>(норма ВОЗ &lt; 45)</i>`,
      `├ <b>NO₂</b> (диоксид азота): <b>${om.nitrogen_dioxide ?? '—'}</b> мкг/м³`,
      `├ <b>O₃</b> (приземный озон): <b>${om.ozone ?? '—'}</b> мкг/м³`,
      `├ <b>SO₂</b> (диоксид серы): <b>${om.sulphur_dioxide ?? '—'}</b> мкг/м³`,
      `├ <b>CO</b> (угарный газ): <b>${om.carbon_monoxide ?? '—'}</b> мкг/м³`,
      `╰ <b>Пылевая взвесь:</b> <b>${om.dust ?? '—'}</b> мкг/м³`
    );
  }

  lines.push(``, `💡 <i>${aqiInfo.advice}</i>`);
  return lines.join('\n');
}

// Отправка главного отчета
async function sendWeatherAndAirReport(chatId, lat, lon, placeTitle = null, isScheduled = false) {
  const resolvedTitle = placeTitle || await reverseGeocode(lat, lon);
  updateUser(chatId, {
    lat,
    lon,
    title: resolvedTitle,
    awaitingTimeInput: false,
    awaitingCityInput: false
  });

  const data = await fetchAllEnvData(lat, lon);
  const text = formatMainReport(resolvedTitle, data, isScheduled);

  await tgCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: buildReportInlineKeyboard(lat, lon)
  });
}

// Меню настройки времени рассылки
async function sendScheduleMenu(chatId) {
  const user = getUser(chatId);
  const statusLine = user.notifyEnabled && user.notifyTime
    ? `🟢 <b>Активна</b> — каждый день в <b>${user.notifyTime}</b>`
    : `⚪ <b>Отключена</b>`;

  const text = [
    `⏰ <b>НАСТРОЙКА ЕЖЕДНЕВНОЙ РАССЫЛКИ</b>`,
    ``,
    `╭─ 📍 Локация: <b>${user.title}</b>`,
    `╰─ 🔔 Статус: ${statusLine}`,
    ``,
    `Выбери удобное время на кнопках ниже или просто <b>напиши любое время в чат</b> в формате <code>ЧЧ:ММ</code> (например: <code>07:30</code> или <code>19:45</code>):`
  ].join('\n');

  await tgCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: buildScheduleKeyboard(user)
  });
}

// Меню выбора города Казахстана
async function sendCitiesMenu(chatId) {
  const user = getUser(chatId);
  updateUser(chatId, { awaitingCityInput: true, awaitingTimeInput: false });
  await tgCall('sendMessage', {
    chat_id: chatId,
    text: [
      `🇰🇿 <b>ВЫБОР ГОРОДА КАЗАХСТАНА</b>`,
      `📍 Сейчас выбран: <b>${user.title}</b>`,
      ``,
      `Нажми на нужный город ниже (включая <b>⭐ Кентау</b> и все областные центры РК) или просто напиши название любого города в чат:`
    ].join('\n'),
    parse_mode: 'HTML',
    reply_markup: KZ_CITIES_INLINE
  });
}

// Обработка входящих сообщений
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const user = getUser(chatId);

  // 1. Если пользователь отправил GPS-геопозицию
  if (msg.location) {
    const { latitude, longitude } = msg.location;
    await sendWeatherAndAirReport(chatId, latitude, longitude);
    return;
  }

  const text = (msg.text || '').trim();
  if (!text) return;

  // 2. Приветствие /start
  if (text === '/start' || text === '/help') {
    updateUser(chatId, { awaitingTimeInput: false, awaitingCityInput: false });
    const welcome = [
      `✨ <b>Salem!</b> Добро пожаловать в современный ИИ-радар погоды и чистоты воздуха.`,
      ``,
      `📍 <b>Твой текущий город:</b> <code>${user.title}</code>`,
      ``,
      `╭─ 🚀 <b>ЧТО Я УМЕЮ:</b>`,
      `├ 🇰🇿 <b>Все города Казахстана + Кентау:</b> просто напиши название города (например, <code>Кентау</code>, <code>Шымкент</code>, <code>Астана</code>) или выбери кнопкой`,
      `├ 🤖 <b>Адаптивный ИИ:</b> отвечает именно по твоему выбранному городу`,
      `├ 📊 <b>График 24ч + Фото:</b> картинка графика + почасовой расклад на сутки`,
      `├ 📅 <b>Прогноз на 3 дня:</b> дневные и ночные температуры, осадки и ветер`,
      `╰ ⏰ <b>Умная рассылка:</b> присылаю сводку в любое выбранное время`,
      ``,
      `👇 Выбери <b>«🏙 Города Казахстана»</b> или просто напиши город / вопрос в чат!`
    ].join('\n');

    await tgCall('sendMessage', {
      chat_id: chatId,
      text: welcome,
      parse_mode: 'HTML',
      reply_markup: MAIN_REPLY_KEYBOARD
    });
    return;
  }

  // 3. Кнопка «🤖 Спросить ИИ»
  if (text === '🤖 Спросить ИИ' || text === '/ai') {
    updateUser(chatId, { awaitingTimeInput: false, awaitingCityInput: false });
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: [
        `🤖 <b>SALEM AI НА СВЯЗИ!</b>`,
        `📍 Сейчас анализирую: <b>${user.title}</b>`,
        ``,
        `Спрашивай свободно (можешь также упомянуть любой другой город РК прямо в вопросе, например <i>«Какая погода в Кентау?»</i>):`,
        `• <i>«Во сколько сегодня лучше пойти гулять?»</i>`,
        `• <i>«Стоит ли сегодня мыть машину?»</i>`,
        `• <i>«Что надеть вечером?»</i>`
      ].join('\n'),
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: `✨ Полный ИИ-разбор (${user.title})`, callback_data: `ai:${user.lat.toFixed(4)},${user.lon.toFixed(4)}` }]
        ]
      }
    });
    return;
  }

  // 4. Кнопка «⏰ Время рассылки»
  if (text === '⏰ Время рассылки' || text === '/schedule') {
    updateUser(chatId, { awaitingCityInput: false });
    await sendScheduleMenu(chatId);
    return;
  }

  // 5. Кнопка «📊 Мой город сейчас»
  if (text === '📊 Мой город сейчас') {
    updateUser(chatId, { awaitingCityInput: false, awaitingTimeInput: false });
    await sendWeatherAndAirReport(chatId, user.lat, user.lon, user.title);
    return;
  }

  // 6. Кнопка «🏙 Города Казахстана» / «🏙 Сменить город»
  if (
    text === '🏙 Города Казахстана' ||
    text === '🏙 Сменить город' ||
    text === '🏙 Популярные города' ||
    text === '/city'
  ) {
    await sendCitiesMenu(chatId);
    return;
  }

  // 7. Кнопка «ℹ️ О источниках»
  if (text === 'ℹ️ О источниках') {
    updateUser(chatId, { awaitingTimeInput: false, awaitingCityInput: false });
    const info = [
      `✨ <b>SALEM • О ТЕХНОЛОГИЯХ БОТА</b>`,
      ``,
      `╭─ 🇰🇿 <b>Поддержка городов Казахстана</b>`,
      `╰ Встроена точная база координат для Кентау, Туркестана, Шымкента, Алматы, Астаны и всех крупных городов РК.`,
      ``,
      `╭─ 🤖 <b>Интеллектуальный ИИ-ассистент</b>`,
      `╰ Анализирует почасовой тренд, химию воздуха и давление именно для твоего выбранного города.`,
      ``,
      `╭─ 📡 <b>WAQI + Open-Meteo Copernicus</b>`,
      `╰ Двойной контроль воздуха и точные метеомодели на 24 часа и 3 дня.`
    ].join('\n');

    await tgCall('sendMessage', {
      chat_id: chatId,
      text: info,
      parse_mode: 'HTML',
      reply_markup: MAIN_REPLY_KEYBOARD
    });
    return;
  }

  // 8. Проверка: ввел ли пользователь время в формате ЧЧ:ММ
  const timeMatch = text.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (timeMatch) {
    const hh = timeMatch[1].padStart(2, '0');
    const mm = timeMatch[2];
    const formattedTime = `${hh}:${mm}`;
    updateUser(chatId, {
      notifyTime: formattedTime,
      notifyEnabled: true,
      awaitingTimeInput: false,
      awaitingCityInput: false,
      lastSentDate: null
    });

    await tgCall('sendMessage', {
      chat_id: chatId,
      text: [
        `✅ <b>Время рассылки успешно установлено!</b>`,
        ``,
        `╭─ ⏰ Время: <b>${formattedTime}</b> (ежедневно)`,
        `╰─ 📍 Локация: <b>${user.title}</b>`
      ].join('\n'),
      parse_mode: 'HTML',
      reply_markup: MAIN_REPLY_KEYBOARD
    });
    return;
  }

  if (user.awaitingTimeInput) {
    await tgCall('sendMessage', {
      chat_id: chatId,
      text: `⚠️ Пожалуйста, введи время в формате <b>ЧЧ:ММ</b> (например, <code>08:30</code> или <code>20:00</code>).`,
      parse_mode: 'HTML'
    });
    return;
  }

  // 9. Если пользователь написал название города Казахстана (например просто "Кентау", "Шымкент", "Астана")
  const exactKz = matchExactKzCity(text);
  if (exactKz) {
    await sendWeatherAndAirReport(chatId, exactKz.lat, exactKz.lon, exactKz.title);
    return;
  }

  // 10. Если пользователь в режиме выбора города ИЛИ написал "город <Название>"
  const explicitCityPrefix = text.match(/^(?:город|city)\s+(.+)$/i);
  if (user.awaitingCityInput || explicitCityPrefix) {
    const queryCity = explicitCityPrefix ? explicitCityPrefix[1].trim() : text;
    const geo = await geocodeCity(queryCity);
    if (!geo) {
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: `❌ Город «<b>${queryCity}</b>» не найден. Выбери город на кнопках выше или проверь написание.`,
        parse_mode: 'HTML'
      });
      return;
    }
    const title = [geo.name, geo.country].filter(Boolean).join(', ');
    await sendWeatherAndAirReport(chatId, geo.lat, geo.lon, title);
    return;
  }

  // 11. Проверяем: не упомянул ли пользователь какой-нибудь город Казахстана прямо внутри своего вопроса ИИ?
  // Например: "Какая сейчас погода в Кентау?" или "Что надеть в Астане?"
  const mentionedKz = detectKzCityInSentence(text);
  if (mentionedKz) {
    updateUser(chatId, {
      lat: mentionedKz.lat,
      lon: mentionedKz.lon,
      title: mentionedKz.title,
      awaitingCityInput: false
    });
  }

  const activeUser = getUser(chatId);

  // 12. УМНЫЙ ДИАЛОГ С ИИ по активному городу пользователя
  await tgCall('sendChatAction', { chat_id: chatId, action: 'typing' });
  const envData = await fetchAllEnvData(activeUser.lat, activeUser.lon);
  const aiText = await generateAiReport(chatId, activeUser.title, envData, text);
  await tgCall('sendMessage', {
    chat_id: chatId,
    text: aiText,
    parse_mode: 'HTML',
    reply_markup: buildReportInlineKeyboard(activeUser.lat, activeUser.lon)
  });
}

// Обработка инлайн-кнопок
async function handleCallbackQuery(cb) {
  const chatId = cb.message.chat.id;
  const user = getUser(chatId);
  const dataStr = cb.data || '';

  await tgCall('answerCallbackQuery', { callback_query_id: cb.id });

  // Явный выбор города из списка кнопок
  if (dataStr.startsWith('city:')) {
    const cityName = dataStr.slice(5);
    const kzMatch = matchExactKzCity(cityName);
    if (kzMatch) {
      await sendWeatherAndAirReport(chatId, kzMatch.lat, kzMatch.lon, kzMatch.title);
      return;
    }
    const geo = await geocodeCity(cityName);
    if (geo) {
      const title = [geo.name, geo.country].filter(Boolean).join(', ');
      await sendWeatherAndAirReport(chatId, geo.lat, geo.lon, title);
    }
    return;
  }

  // Установка времени рассылки
  if (dataStr.startsWith('settime:')) {
    const val = dataStr.slice(8);

    if (val === 'off') {
      updateUser(chatId, { notifyEnabled: false, awaitingTimeInput: false });
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: `🔕 <b>Ежедневная рассылка отключена.</b>\nТы всегда можешь включить её снова в меню «⏰ Время рассылки».`,
        parse_mode: 'HTML',
        reply_markup: MAIN_REPLY_KEYBOARD
      });
      return;
    }

    if (val === 'custom') {
      updateUser(chatId, { awaitingTimeInput: true, awaitingCityInput: false });
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: `⌨️ <b>Напиши желаемое время рассылки в чат</b> в формате <code>ЧЧ:ММ</code>\nНапример: <code>07:30</code>, <code>10:15</code> или <code>22:00</code>`,
        parse_mode: 'HTML'
      });
      return;
    }

    updateUser(chatId, {
      notifyTime: val,
      notifyEnabled: true,
      awaitingTimeInput: false,
      lastSentDate: null
    });

    await tgCall('sendMessage', {
      chat_id: chatId,
      text: [
        `✅ <b>Рассылка настроена!</b>`,
        ``,
        `╭─ ⏰ Время: <b>${val}</b> (каждый день)`,
        `╰─ 📍 Локация: <b>${user.title}</b>`
      ].join('\n'),
      parse_mode: 'HTML',
      reply_markup: MAIN_REPLY_KEYBOARD
    });
    return;
  }

  const [action, coords] = dataStr.split(':');
  if (!coords) return;

  if (action === 'open_cities') {
    await sendCitiesMenu(chatId);
    return;
  }

  if (action === 'schedmenu') {
    await sendScheduleMenu(chatId);
    return;
  }

  const [latStr, lonStr] = coords.split(',');
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  if (isNaN(lat) || isNaN(lon)) return;

  // Определяем название города для координат кнопки (если совпадает с одним из городов РК — берем его)
  const matchedKzByCoords = KZ_CITIES.find(
    c => Math.abs(c.lat - lat) < 0.05 && Math.abs(c.lon - lon) < 0.05
  );
  const placeTitle = matchedKzByCoords ? matchedKzByCoords.title : (user.title || await reverseGeocode(lat, lon));

  const envData = await fetchAllEnvData(lat, lon);

  if (action === 'ai') {
    await tgCall('sendChatAction', { chat_id: chatId, action: 'typing' });
    const text = await generateAiReport(chatId, placeTitle, envData, null);
    await tgCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: buildReportInlineKeyboard(lat, lon)
    });
  } else if (action === 'refresh') {
    const text = formatMainReport(placeTitle, envData);
    await tgCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: buildReportInlineKeyboard(lat, lon)
    });
  } else if (action === 'air') {
    const text = formatDetailedAirReport(placeTitle, envData);
    await tgCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: buildReportInlineKeyboard(lat, lon)
    });
  } else if (action === 'hourly24') {
    await sendHourly24WithPhoto(chatId, lat, lon, placeTitle, envData);
  } else if (action === 'daily3') {
    const text = formatThreeDayForecast(placeTitle, envData);
    await tgCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: buildReportInlineKeyboard(lat, lon)
    });
  }
}

// Планировщик ежедневной рассылки
function startScheduler() {
  setInterval(async () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hh}:${mm}`;
    const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    for (const chatId of Object.keys(usersDb)) {
      const u = usersDb[chatId];
      if (u.notifyEnabled && u.notifyTime === currentTime && u.lastSentDate !== todayDate) {
        updateUser(chatId, { lastSentDate: todayDate });
        try {
          await sendWeatherAndAirReport(chatId, u.lat, u.lon, u.title, true);
        } catch (err) {
          console.error(`Ошибка рассылки для ${chatId}:`, err.message);
        }
      }
    }
  }, 20000);
}

// Простой веб-сервер для облачных платформ (Render, Koyeb и др.)
const http = require('http');
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Salem Weather & Air Bot 24/7 is Active!');
}).listen(PORT, () => {
  console.log(`🌐 Сервер здоровья запущен на порту ${PORT} (для облака)`);
});

// Запуск Long Polling
async function startPolling() {
  const me = await tgCall('getMe', {});
  if (!me.ok) {
    console.error('❌ Ошибка авторизации Telegram токена:', me);
    process.exit(1);
  }
  console.log(`✅ Бот успешно запущен: @${me.result.username} (Salem KZ Cities + Kentau v4.5)`);

  startScheduler();

  let offset = 0;
  while (true) {
    try {
      const res = await tgCall('getUpdates', {
        offset,
        timeout: 25,
        allowed_updates: ['message', 'callback_query']
      });

      if (res.ok && Array.isArray(res.result)) {
        for (const update of res.result) {
          offset = update.update_id + 1;
          if (update.message) {
            handleMessage(update.message).catch(err => console.error('Ошибка обработки сообщения:', err));
          } else if (update.callback_query) {
            handleCallbackQuery(update.callback_query).catch(err => console.error('Ошибка обработки кнопки:', err));
          }
        }
      }
    } catch (err) {
      console.error('Ошибка сети при опросе Telegram:', err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

startPolling();
