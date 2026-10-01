/**
 * Embedded fallback data and constants for the Friendship Audit.
 * Ensures zero-latency offline loading and provides fallback values.
 */

export const DEFAULT_AUDIT_DATA = {
  summary: {
    total_messages: 6037,
    total_chars: 144551,
    meters_of_text: 547.5,
    avg_day: 398.9,
    avg_hour: 16.6,
    trial_days: 14,
    peak_day: {
      date: "28.09.2026",
      count: 937,
      title: "День индустриального спама (937 сообщений!)"
    },
    night_stats: {
      total: 2794,
      percent: 48.9,
      evgeniy: 1539,
      lolita: 1255
    }
  },
  users: {
    evgeniy: {
      name: "Женя",
      messages: 3263,
      percent: 54.1,
      chars: 110473,
      char_percent: 76.4,
      avg_chars: 33.9,
      voice: 9,
      video: 171,
      night: 1539
    },
    lolita: {
      name: "Лолита",
      messages: 2774,
      percent: 45.9,
      chars: 34078,
      char_percent: 23.6,
      avg_chars: 12.3,
      voice: 210,
      video: 95,
      night: 1255
    }
  },
  dates_chart: [
    { date: "21.09", total: 23, evg: 12, lol: 11 },
    { date: "22.09", total: 150, evg: 70, lol: 80 },
    { date: "23.09", total: 530, evg: 259, lol: 271 },
    { date: "24.09", total: 510, evg: 269, lol: 241 },
    { date: "25.09", total: 888, evg: 467, lol: 421 },
    { date: "26.09", total: 694, evg: 359, lol: 335 },
    { date: "27.09", total: 125, evg: 58, lol: 67 },
    { date: "28.09", total: 937, evg: 455, lol: 482 },
    { date: "29.09", total: 839, evg: 480, lol: 359 },
    { date: "30.09", total: 610, evg: 389, lol: 221 },
    { date: "01.10", total: 655, evg: 412, lol: 243 }
  ],
  hours_chart: [
    { hour: "00:00", total: 395, evg: 210, lol: 185 },
    { hour: "01:00", total: 512, evg: 275, lol: 237 },
    { hour: "02:00", total: 684, evg: 374, lol: 310 },
    { hour: "03:00", total: 590, evg: 321, lol: 269 },
    { hour: "04:00", total: 345, evg: 192, lol: 153 },
    { hour: "05:00", total: 140, evg: 80, lol: 60 },
    { hour: "06:00", total: 42, evg: 22, lol: 20 },
    { hour: "07:00", total: 28, evg: 15, lol: 13 },
    { hour: "08:00", total: 65, evg: 30, lol: 35 },
    { hour: "09:00", total: 95, evg: 48, lol: 47 },
    { hour: "10:00", total: 130, evg: 72, lol: 58 },
    { hour: "11:00", total: 185, evg: 95, lol: 90 },
    { hour: "12:00", total: 240, evg: 130, lol: 110 },
    { hour: "13:00", total: 280, evg: 150, lol: 130 },
    { hour: "14:00", total: 295, evg: 155, lol: 140 },
    { hour: "15:00", total: 310, evg: 162, lol: 148 },
    { hour: "16:00", total: 325, evg: 175, lol: 150 },
    { hour: "17:00", total: 340, evg: 180, lol: 160 },
    { hour: "18:00", total: 290, evg: 150, lol: 140 },
    { hour: "19:00", total: 270, evg: 145, lol: 125 },
    { hour: "20:00", total: 265, evg: 140, lol: 125 },
    { hour: "21:00", total: 295, evg: 160, lol: 135 },
    { hour: "22:00", total: 320, evg: 170, lol: 150 },
    { hour: "23:00", total: 378, evg: 205, lol: 173 }
  ],
  emojis: [
    { emoji: "😭", count: 142, desc: "«Плачу от смеха / кринжа»", tag: "Ультра-топ" },
    { emoji: "😂", count: 89, desc: "«Классический ор выше гор»", tag: "Реакция" },
    { emoji: "💀", count: 64, desc: "«Умер от происходящего»", tag: "Фатализм" },
    { emoji: "😅", count: 52, desc: "«Нервный смешок в 3 ночи»", tag: "Бессонница" },
    { emoji: "🔥", count: 49, desc: "«Огонь вайб кружочков»", tag: "Одобрение" },
    { emoji: "🙏", count: 31, desc: "«Молитва за смену на WB»", tag: "Смирение" }
  ],
  quotes: [
    {
      author: "Лолита",
      text: "у меня почему то комп молчит, когда я товары пикаю...",
      context: "Утро на пункте выдачи заказов. Компьютер объявил забастовку.",
      tag: "WB будни",
      icon: "📦"
    },
    {
      author: "Лолита",
      text: "ебаать у тебя вайб",
      context: "Экспертная оценка видео-кружочка Жени.",
      tag: "Вайб-чек",
      icon: "✨"
    },
    {
      author: "Лолита",
      text: "ненавижу людей",
      replyAuthor: "Женя",
      replyText: "А я как будто их люблю",
      context: "Редкое единодушие в 17:39 вечера.",
      tag: "Философия",
      icon: "🧠"
    },
    {
      author: "Женя",
      text: "Ладно больше не буду тебе мозги заполнять сложной инфой",
      replyAuthor: "Лолита",
      replyText: "ммм пиздец",
      context: "Глубокая полночная аналитика в 02:51 ночи.",
      tag: "Ночная лекция",
      icon: "🌙"
    },
    {
      author: "Женя",
      text: "а ты чо уже спать ложишься?",
      context: "Время: 02:05 ночи. Вопрос искреннего удивления.",
      tag: "Режим сна",
      icon: "⏰"
    },
    {
      author: "Лолита",
      text: "ладно, мне кажется спать пора",
      context: "Время: 03:14 ночи. Кажется, пора, но это не точно.",
      tag: "Тайм-менеджмент",
      icon: "💤"
    },
    {
      author: "Лолита",
      text: "я сегодня буду пить пиво ахахвхв",
      context: "Тактический план-перехват на вечер.",
      tag: "Планы на жизнь",
      icon: "🍺"
    },
    {
      author: "Женя",
      text: "все ладно я пойду, сполоснусь и спать нахуй",
      context: "Время: 01:50 ночи. Решительный финал трудового дня.",
      tag: "Дисциплина",
      icon: "🚿"
    },
    {
      author: "Лолита",
      text: "не, я тя помню, я в шк тя видела эахахахах",
      context: "Внезапные архивные рассекреченные данные.",
      tag: "Архивы",
      icon: "🏫"
    },
    {
      author: "Лолита",
      text: "а у тя есть карта вб? только вб банк эахаха",
      context: "Финансовый консалтинг высшей категории.",
      tag: "Финтех",
      icon: "💳"
    },
    {
      author: "Женя",
      text: "Слава Богу я ночью помылся. Что с утра ванна будет у меня не доступна",
      context: "Стратегия распределения водных ресурсов.",
      tag: "Тактика",
      icon: "🛁"
    },
    {
      author: "Лолита",
      text: "я чото пиздец объелась",
      replyAuthor: "Женя",
      replyText: "пиздец ты конечно выдала",
      context: "В 00:46 ночи. Диалог гурманов.",
      tag: "Нутрициология",
      icon: "🍕"
    }
  ],
  photos: [
    { src: "ChatExport_2026-10-01/photos/photo_1@16-07-2026_21-35-36.jpg", user: "Женя", date: "16.07.2026", time: "21:35", note: "Первое знакомство / WB старт" },
    { src: "ChatExport_2026-10-01/photos/photo_10@22-09-2026_16-50-25.jpg", user: "Лолита", date: "22.09.2026", time: "16:50", note: "Вещдок №10" },
    { src: "ChatExport_2026-10-01/photos/photo_19@23-09-2026_23-21-35.jpg", user: "Женя", date: "23.09.2026", time: "23:21", note: "Ночной эфир" },
    { src: "ChatExport_2026-10-01/photos/photo_28@24-09-2026_02-58-39.jpg", user: "Женя", date: "24.09.2026", time: "02:58", note: "В 3 ночи спать нельзя" },
    { src: "ChatExport_2026-10-01/photos/photo_37@25-09-2026_14-14-23.jpg", user: "Женя", date: "25.09.2026", time: "14:14", note: "Пятничный спам" },
    { src: "ChatExport_2026-10-01/photos/photo_46@26-09-2026_00-54-59.jpg", user: "Лолита", date: "26.09.2026", time: "00:54", note: "Полночные хроники" },
    { src: "ChatExport_2026-10-01/photos/photo_55@27-09-2026_16-09-48.jpg", user: "Женя", date: "27.09.2026", time: "16:09", note: "Выходной затишье" },
    { src: "ChatExport_2026-10-01/photos/photo_64@28-09-2026_01-21-29.jpg", user: "Женя", date: "28.09.2026", time: "01:21", note: "Начало рекорда (937 сообщений)" },
    { src: "ChatExport_2026-10-01/photos/photo_73@28-09-2026_13-27-44.jpg", user: "Женя", date: "28.09.2026", time: "13:27", note: "Пик спама 28.09" },
    { src: "ChatExport_2026-10-01/photos/photo_82@29-09-2026_23-31-24.jpg", user: "Женя", date: "29.09.2026", time: "23:31", note: "Почти полночь" },
    { src: "ChatExport_2026-10-01/photos/photo_91@30-09-2026_01-27-17.jpg", user: "Женя", date: "30.09.2026", time: "01:27", note: "Финал тестового периода" },
    { src: "ChatExport_2026-10-01/photos/photo_100@30-09-2026_01-41-30.jpg", user: "Женя", date: "30.09.2026", time: "01:41", note: "Секретный материал дела" }
  ]
};

export const PHOTO_NOTES_FALLBACK = [
  "Первое знакомство / WB старт",
  "Вещдок №2 (Бейсболка)",
  "Ночной энергетик",
  "Диалог про защитный механизм",
  "К выдаче 1256 (WB будни)",
  "Полночные хроники",
  "Стрим и музыка",
  "Ночной Mercedes w220",
  "Пик спама 28.09 («Что это коврик»)",
  "Музыкальные лекции в ночи",
  "Будильники на утро",
  "Секретный материал дела"
];

export const EMOJI_METADATA_MAP = {
  "😭": { tag: "Ультра-топ", desc: "«Плачу от смеха / кринжа»" },
  "😂": { tag: "Реакция", desc: "«Классический ор выше гор»" },
  "💀": { tag: "Фатализм", desc: "«Умер от происходящего»" },
  "😅": { tag: "Бессонница", desc: "«Нервный смешок в 3 ночи»" },
  "🔥": { tag: "Одобрение", desc: "«Огонь вайб кружочков»" },
  "🙏": { tag: "Смирение", desc: "«Молитва за смену на WB»" },
  "❤": { tag: "Любовь", desc: "«Сердечко и признание»" },
  "❤️": { tag: "Любовь", desc: "«Сердечко и признание»" },
  "👍": { tag: "Нормалды", desc: "«Одобрено и база»" },
  "✨": { tag: "Вайб-чек", desc: "«Оценка крутого вайба»" },
  "🤨": { tag: "Вопросик", desc: "«Скепсис и подозрение»" },
  "😥": { tag: "Грустинка", desc: "«Усталость и тяжелый вздох»" }
};
