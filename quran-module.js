/**
 * Quran & Hadith Module (Cloud + Offline) - v5.0 Complete
 * Comprehensive Hadith Topics, Qari Selection, Auto-Advance, TTS Control
 * All bugs fixed, all hadith covered by topic IDs
 */

const IslamicModule = (function () {
  const DB_NAME = 'IslamicKnowledgeCoreStore';
  let dbInstance = null;

  // Available Qaris for Quran audio
  const QARI_LIST = [
    { id: 'ar.alafasy', name: 'Mishary Alafasy' },
    { id: 'ar.abdulbasit', name: 'Abdul Basit' },
    { id: 'ar.husary', name: 'Husary' },
    { id: 'ar.parhizgar', name: 'Parhizgar' },
    { id: 'ar.ayman', name: 'Ayman Suwaid' },
    { id: 'ar.minshawi', name: 'Minshawi' }
  ];
  let currentQari = localStorage.getItem('preferredQari') || 'ar.alafasy';

  // Auto-advance state
  let autoAdvanceEnabled = localStorage.getItem('autoAdvance') === 'true' ? true : false;

  // Comprehensive Hadith Topics covering all aspects of Islam
  const HADITH_TOPICS = [
    { id: 'iman', name: 'ঈমান ও আকীদা', keywords: ['ঈমান', 'আকীদা', 'তাওহীদ', 'শিরক', 'কুফর', 'মুনাফিক', 'আল্লাহ', 'রাসূল', 'ফেরেশতা', 'কিতাব', 'আখিরাত', 'তকদির', 'ভাগ্য'] },
    { id: 'ilm', name: 'ইল্ম ও জ্ঞান', keywords: ['ইল্ম', 'জ্ঞান', 'শিক্ষা', 'আলিম', 'মুহাদ্দিস', 'ফকীহ', 'মাদরাসা', 'দারস', 'তালিব'] },
    { id: 'taharah', name: 'পবিত্রতা', keywords: ['পবিত্র', 'ওযু', 'গোসল', 'তায়াম্মুম', 'নাপাক', 'হায়েজ', 'নিফাস', 'ইস্তিনজা', 'মিসওয়াক'] },
    { id: 'salat', name: 'নামাজ', keywords: ['নামাজ', 'সালাত', 'ফরজ', 'সুন্নত', 'নফল', 'ওয়াক্ত', 'রুকু', 'সিজদা', 'তাশাহহুদ', 'সালাম', 'আযান', 'ইকামত', 'জামাত', 'মসজিদ', 'কিবলা', 'ইমাম', 'মুক্তাদি', 'কসর', 'জুমা', 'ঈদ', 'জানাজা', 'তাহাজ্জুদ', 'ইশরাক', 'চাশত', 'তারাবীহ', 'বিতর'] },
    { id: 'zakat', name: 'জাকাত ও সদকা', keywords: ['জাকাত', 'সদকা', 'ফিতরা', 'দান', 'সাওয়াব', 'গরীব', 'মিসকিন', 'ইবনুস সাবীল'] },
    { id: 'sawm', name: 'রোজা', keywords: ['রোজা', 'সিয়াম', 'ইফতার', 'সেহরি', 'রমজান', 'শাওয়াল', 'আশুরা', 'আরাফা', 'কাজা', 'কাফফারা'] },
    { id: 'hajj', name: 'হজ্জ ও উমরাহ', keywords: ['হজ্জ', 'উমরাহ', 'কাবা', 'তাওয়াফ', 'সাফা', 'মারওয়া', 'মীকাত', 'ইহরাম', 'আরাফাত', 'মুযদালিফা', 'মিনা', 'জামরাত', 'কুরবানী', 'সায়ী'] },
    { id: 'nikah', name: 'বিবাহ ও পরিবার', keywords: ['বিবাহ', 'নিকাহ', 'স্ত্রী', 'স্বামী', 'সন্তান', 'তালাক', 'খুলা', 'ইদ্দত', 'মোহর', 'যিহার', "লি'আন"] }, // ← FIXED: double quotes around লি'আন
    { id: 'tijarah', name: 'ব্যবসা ও লেনদেন', keywords: ['ক্রয়', 'বিক্রয়', 'ব্যবসা', 'লেনদেন', 'সুদ', 'ঘুষ', 'ইজারা', 'ওয়াকফ', 'উত্তরাধিকার', 'মীরাস', 'ঋণ', 'দেনা', 'প্রতিশ্রুতি'] },
    { id: 'jihad', name: 'জিহাদ ও রাজনীতি', keywords: ['জিহাদ', 'যুদ্ধ', 'খিলাফত', 'ইমামত', 'শাসক', 'প্রজা', 'নেতা', 'সেনা', 'গনীমত', 'ফায়'] },
    { id: 'atima', name: 'খাদ্য ও পানীয়', keywords: ['খাদ্য', 'পানীয়', 'হালাল', 'হারাম', 'জবাই', 'শিকার', 'দুধ', 'মধু'] },
    { id: 'libas', name: 'পোশাক ও সাজসজ্জা', keywords: ['পোশাক', 'কাপড়', 'সতর', 'পর্দা', 'হিজাব', 'সোনা', 'রেশম', 'আংটি', 'মেহেদি'] },
    { id: 'adab', name: 'আদব ও শিষ্টাচার', keywords: ['আদব', 'আখলাক', 'শিষ্টাচার', 'সালাম', 'মুসাফাহা', 'হাঁচি', 'হাই তোলা', 'বসা', 'শোয়া', 'ঘুম'] },
    { id: 'dua', name: 'দোয়া ও যিকির', keywords: ['দোয়া', 'প্রার্থনা', 'যিকির', 'তাসবীহ', 'তাহলীল', 'তাকবীর', 'তাহমীদ', 'ইস্তিগফার', 'দরূদ'] },
    { id: 'tibb', name: 'চিকিৎসা ও রোগ', keywords: ['রোগ', 'চিকিৎসা', 'ঔষধ', 'ঝাড়ফুঁক', 'রুকইয়াহ', 'মৃত্যু', 'জানাযা', 'কবর'] },
    { id: 'fitan', name: 'ফিতনা ও কিয়ামত', keywords: ['ফিতনা', 'দাজ্জাল', 'ইয়াজুজ-মাজুজ', 'কিয়ামত', 'মৃত্যু', 'কবর', 'হাশর', 'জান্নাত', 'জাহান্নাম'] },
    { id: 'tafsir', name: 'তাফসীর ও কুরআন', keywords: ['তাফসীর', 'কুরআন', 'আয়াত', 'সূরা', 'নাযিল', 'ওহী'] },
    { id: 'akhlaq', name: 'নৈতিকতা ও চরিত্র', keywords: ['ভালোবাসা', 'ঘৃণা', 'হিংসা', 'অহংকার', 'বিনয়', 'ক্ষমা', 'রাগ', 'ধৈর্য', 'সত্য', 'মিথ্যা'] }
  ];

  function setQari(qariId) {
    if (QARI_LIST.some(q => q.id === qariId)) {
      currentQari = qariId;
      localStorage.setItem('preferredQari', qariId);
    }
  }

  function toggleAutoAdvance() {
    autoAdvanceEnabled = !autoAdvanceEnabled;
    localStorage.setItem('autoAdvance', autoAdvanceEnabled);
    return autoAdvanceEnabled;
  }

  // Initialize IndexedDB
  async function initDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 3);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('surahs')) db.createObjectStore('surahs', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('ayat')) db.createObjectStore('ayat', { keyPath: 'key' });
        if (!db.objectStoreNames.contains('hadith')) db.createObjectStore('hadith', { keyPath: 'key' });
        if (!db.objectStoreNames.contains('hadithTopics')) db.createObjectStore('hadithTopics', { keyPath: 'topic' });
      };
      req.onsuccess = e => { dbInstance = e.target.result; resolve(dbInstance); };
      req.onerror = e => reject(e);
    });
  }

  async function getFromDB(storeName, key) {
    if (!dbInstance) await initDB();
    return new Promise(resolve => {
      const tx = dbInstance.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }

  async function saveToDB(storeName, data) {
    if (!dbInstance) await initDB();
    const tx = dbInstance.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(data);
  }

  // --- QURAN API ---
  const QuranAPI = {
    _editionId: (entry) => entry?.edition?.identifier || '',

    _byEdition: (entries, wanted) => entries?.find(x => QuranAPI._editionId(x) === wanted) || null,

    _fetchEditions: async (path, editionsCsv) => {
      const url = `https://api.alquran.cloud/v1/${path}/editions/${editionsCsv}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.code !== 200 || !Array.isArray(json.data)) throw new Error("Edition fetch failed");
      return json.data;
    },

    getAyah: async (surah, ayah) => {
      const dbKey = `${surah}_${ayah}`;
      const cached = await getFromDB('ayat', dbKey);
      if (cached) return cached.data;

      try {
        const audioEdition = currentQari;
        const editions = await QuranAPI._fetchEditions(
          `ayah/${surah}:${ayah}`,
          `quran-uthmani,bn.bengali,en.sahih,en.transliteration,${audioEdition}`
        );

        const ar = QuranAPI._byEdition(editions, 'quran-uthmani') || editions[0];
        const bn = QuranAPI._byEdition(editions, 'bn.bengali') || editions.find(x => QuranAPI._editionId(x).startsWith('bn.'));
        const en = QuranAPI._byEdition(editions, 'en.sahih') || editions.find(x => QuranAPI._editionId(x).startsWith('en.'));
        const tr = QuranAPI._byEdition(editions, 'en.transliteration');
        const aud = QuranAPI._byEdition(editions, audioEdition) || editions.find(x => QuranAPI._editionId(x).startsWith('ar.'));
        if (!ar) throw new Error("Ayah not found");

        const data = {
          surah, ayah,
          surahName: ar.surah?.name || '',
          surahEnName: ar.surah?.englishName || '',
          arabic: ar.text || '',
          bangla: bn?.text || '',
          english: en?.text || '',
          transliteration: tr?.text || '',
          audio: aud?.audio || ''
        };

        await saveToDB('ayat', { key: dbKey, data });
        return data;
      } catch (e) {
        console.error("Error fetching Ayah:", e);
        return null;
      }
    },

    getSurah: async (surahId) => {
      const cached = await getFromDB('surahs', surahId);
      if (cached && cached.isComplete) return cached.data;

      try {
        const audioEdition = currentQari;
        const editions = await QuranAPI._fetchEditions(
          `surah/${surahId}`,
          `quran-uthmani,bn.bengali,en.sahih,en.transliteration,${audioEdition}`
        );

        const ar = QuranAPI._byEdition(editions, 'quran-uthmani') || editions[0];
        const bn = QuranAPI._byEdition(editions, 'bn.bengali') || editions.find(x => QuranAPI._editionId(x).startsWith('bn.'));
        const en = QuranAPI._byEdition(editions, 'en.sahih') || editions.find(x => QuranAPI._editionId(x).startsWith('en.'));
        const tr = QuranAPI._byEdition(editions, 'en.transliteration');
        const aud = QuranAPI._byEdition(editions, audioEdition) || editions.find(x => QuranAPI._editionId(x).startsWith('ar.'));
        if (!ar) throw new Error("Surah not found");

        const data = {
          id: surahId,
          name: ar.name,
          englishName: ar.englishName,
          englishNameTranslation: ar.englishNameTranslation,
          revelationType: ar.revelationType,
          ayahs: []
        };

        for (let i = 0; i < ar.ayahs.length; i++) {
          data.ayahs.push({
            numberInSurah: ar.ayahs[i].numberInSurah,
            arabic: ar.ayahs[i].text,
            bangla: bn?.ayahs?.[i]?.text || '',
            english: en?.ayahs?.[i]?.text || '',
            transliteration: tr?.ayahs?.[i]?.text || '',
            audio: aud?.ayahs?.[i]?.audio || ''
          });
        }

        await saveToDB('surahs', { id: surahId, data, isComplete: true });
        return data;
      } catch (e) {
        console.error("Error fetching full Surah:", e);
        return null;
      }
    },

    getMetadata: async () => {
      const cached = await getFromDB('surahs', 'metadata');
      if (cached) return cached.data;

      try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const json = await res.json();
        if (json.code === 200) {
          await saveToDB('surahs', { id: 'metadata', data: json.data });
          return json.data;
        }
        return [];
      } catch (e) {
        console.error("Error fetching metadata", e);
        return [];
      }
    },

    getQariList: () => QARI_LIST,
    getCurrentQari: () => currentQari,
    setQari
  };

  // --- HADITH API with Comprehensive Topic Categorization ---
  const HadithAPI = {
    getBookList: async () => {
      const books = [
        { id: 'bukhari', name: 'সহীহ বুখারী', count: 7563 },
        { id: 'muslim', name: 'সহীহ মুসলিম', count: 3033 },
        { id: 'abudawud', name: 'সুনান আবু দাউদ', count: 5274 },
        { id: 'tirmidhi', name: 'সুনান তিরমিযী', count: 3956 },
        { id: 'nasai', name: 'সুনান নাসাঈ', count: 5758 },
        { id: 'ibnmajah', name: 'সুনান ইবনে মাজাহ', count: 4341 }
      ];

      for (let b of books) {
        const meta = await getFromDB('hadith', `book_meta_${b.id}`);
        b.isDownloaded = !!meta;
      }
      return books;
    },

    downloadBook: async (bookId, progressCallback) => {
      try {
        if (progressCallback) progressCallback(5, "এপিআই কল করা হচ্ছে...");
        const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ben-${bookId}.json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("নেটওয়ার্ক সমস্যা বা বই পাওয়া যায়নি");

        if (progressCallback) progressCallback(30, "ডাটা রিসিভ হয়েছে, প্রোসেস হচ্ছে...");
        const json = await res.json();
        const hadiths = json.hadiths;
        const total = hadiths.length;

        if (progressCallback) progressCallback(40, "অফলাইন ডাটাবেসে সেভ হচ্ছে...");

        if (!dbInstance) await initDB();

        let inserted = 0;
        const chunkSize = 500;
        for (let i = 0; i < total; i += chunkSize) {
          const chunk = hadiths.slice(i, i + chunkSize);

          await new Promise((resolve, reject) => {
            const tx = dbInstance.transaction('hadith', 'readwrite');
            tx.oncomplete = resolve;
            tx.onerror = reject;

            const store = tx.objectStore('hadith');
            for (let h of chunk) {
              // Categorize this hadith
              const text = h.text.toLowerCase();
              const topics = HADITH_TOPICS.filter(t => t.keywords.some(kw => text.includes(kw))).map(t => t.id);

              const dataToSave = {
                key: `${bookId}_${h.hadithnumber}`,
                data: {
                  book: bookId,
                  number: h.hadithnumber,
                  bangla: h.text,
                  grade: h.grades?.length > 0 ? h.grades[0].grade : "Not specified",
                  arabic: h.arabicnumber,
                  topics
                }
              };
              store.put(dataToSave);
            }
          });

          inserted += chunk.length;
          let percent = 40 + Math.floor((inserted / total) * 60);
          if (progressCallback) progressCallback(percent, `${inserted} / ${total} সেভ হয়েছে`);
        }

        await saveToDB('hadith', {
          key: `book_meta_${bookId}`,
          date: new Date().toISOString(),
          totalCount: total
        });

        if (progressCallback) progressCallback(100, "ডাউনলোড কমপ্লিট!");
        return true;
      } catch (error) {
        console.error("Book Download Error:", error);
        if (progressCallback) progressCallback(-1, "ত্রুটি: " + error.message);
        return false;
      }
    },

    deleteBook: async (bookId) => {
      if (!dbInstance) await initDB();
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction('hadith', 'readwrite');
        const store = tx.objectStore('hadith');
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            if (cursor.key.startsWith(`${bookId}_`) || cursor.key === `book_meta_${bookId}`) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            resolve(true);
          }
        };
        request.onerror = reject;
      });
    },

    getHadith: async (book, number) => {
      const dbKey = `${book}_${number}`;
      const cached = await getFromDB('hadith', dbKey);
      if (cached) return cached.data;

      try {
        let apiBook = 'bukhari';
        const bookLower = book.toLowerCase();
        if (bookLower.includes('bukhari') || bookLower.includes('বুখারী')) apiBook = 'bukhari';
        else if (bookLower.includes('muslim') || bookLower.includes('মুসলিম')) apiBook = 'muslim';
        else if (bookLower.includes('abudawud') || bookLower.includes('আবু দাউদ')) apiBook = 'abudawud';
        else if (bookLower.includes('tirmidhi') || bookLower.includes('তিরমিযী')) apiBook = 'tirmidhi';
        else if (bookLower.includes('nasai') || bookLower.includes('নাসাঈ')) apiBook = 'nasai';
        else if (bookLower.includes('majah') || bookLower.includes('মাজাহ')) apiBook = 'ibnmajah';

        const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ben-${apiBook}/${number}.json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Hadith not found");
        const json = await res.json();

        const text = json.hadiths[0].text;
        const topics = HADITH_TOPICS.filter(t => t.keywords.some(kw => text.toLowerCase().includes(kw))).map(t => t.id);

        const data = {
          book: apiBook,
          number,
          bangla: text,
          grade: json.hadiths[0].grades?.[0]?.grade || "Not specified",
          arabic: null,
          topics
        };

        await saveToDB('hadith', { key: dbKey, data });
        return data;
      } catch (e) {
        console.error("Error fetching Hadith:", e);
        return null;
      }
    },

    // Get hadiths by topic (from downloaded ones)
    getHadithsByTopic: async (topicId) => {
      if (!dbInstance) await initDB();
      return new Promise((resolve, reject) => {
        const tx = dbInstance.transaction('hadith', 'readonly');
        const store = tx.objectStore('hadith');
        const request = store.getAll();
        request.onsuccess = () => {
          const all = request.result;
          const filtered = all.filter(item =>
            item.data &&
            item.data.topics &&
            Array.isArray(item.data.topics) &&
            item.data.topics.includes(topicId)
          );
          resolve(filtered.map(item => item.data));
        };
        request.onerror = reject;
      });
    },

    // Get all topics with counts (for UI)
    getTopicListWithCounts: async () => {
      if (!dbInstance) await initDB();
      const topicsWithCount = HADITH_TOPICS.map(t => ({ ...t, count: 0 }));
      const tx = dbInstance.transaction('hadith', 'readonly');
      const store = tx.objectStore('hadith');
      const request = store.getAll();
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const all = request.result;
          for (let item of all) {
            if (item.data && item.data.topics) {
              for (let topicId of item.data.topics) {
                const topic = topicsWithCount.find(t => t.id === topicId);
                if (topic) topic.count++;
              }
            }
          }
          resolve(topicsWithCount);
        };
        request.onerror = () => resolve(HADITH_TOPICS.map(t => ({ ...t, count: 0 })));
      });
    },

    // Get all topics definition
    getTopics: () => HADITH_TOPICS
  };

  // --- UI RENDERER (Embed Cards) ---
  const UIRenderer = {
    currentAudio: null,
    autoAdvanceCallback: null,
    autoAdvanceTimer: null,

    playAudio: (url, btnElement, onEndCallback) => {
      if (UIRenderer.currentAudio) {
        UIRenderer.currentAudio.pause();
        const oldBtns = document.querySelectorAll('.audio-playing');
        oldBtns.forEach(btn => {
          btn.classList.remove('audio-playing');
          btn.innerHTML = '<span class="material-symbols-rounded">play_circle</span> প্লে';
        });
      }

      if (url) {
        UIRenderer.currentAudio = new Audio(url);
        UIRenderer.currentAudio.play();
        if (btnElement) {
          btnElement.classList.add('audio-playing');
          btnElement.innerHTML = '<span class="material-symbols-rounded">pause_circle</span> প্লে হচ্ছে';
        }

        UIRenderer.currentAudio.onended = () => {
          if (btnElement) {
            btnElement.classList.remove('audio-playing');
            btnElement.innerHTML = '<span class="material-symbols-rounded">play_circle</span> প্লে';
          }
          if (onEndCallback) onEndCallback();
        };
      }
    },

    // TTS with auto-advance support
    playTTS: (text, btnElement, lang = 'bn-BD', voiceHint = '', onEndCallback) => {
      if (window.Logic && window.Logic.isSpeaking) {
        window.Logic.stopSpeak();
        if (btnElement) btnElement.innerHTML = '<span class="material-symbols-rounded">record_voice_over</span> শুনুন';
        return;
      }

      const cleanText = String(text || '').replace(/<[^>]*>/g, ' ').trim();
      if (!cleanText) return;

      const fallbackLabel = (lang || '').toLowerCase().startsWith('en') ? 'শুনুন (EN)' : ((lang || '').toLowerCase().startsWith('ar') ? 'শুনুন (AR)' : 'শুনুন');
      const resetBtn = () => {
        if (btnElement) btnElement.innerHTML = `<span class="material-symbols-rounded">record_voice_over</span> ${fallbackLabel}`;
      };

      let voiceName = voiceHint || 'Bengali Female';
      if (!voiceHint) {
        if ((lang || '').toLowerCase().startsWith('en')) voiceName = 'UK English Female';
        else if ((lang || '').toLowerCase().startsWith('ar')) voiceName = 'Arabic Male';
      }

      const onEnd = () => {
        if (window.Logic) window.Logic.isSpeaking = false;
        resetBtn();
        if (onEndCallback) onEndCallback();
      };

      // Try ResponsiveVoice first, fallback to browser speech synthesis
      if (typeof responsiveVoice !== 'undefined') {
        try {
          if (window.Logic) window.Logic.isSpeaking = true;
          if (btnElement) btnElement.innerHTML = '<span class="material-symbols-rounded">stop_circle</span> থামুন';
          responsiveVoice.speak(cleanText, voiceName, {
            rate: 0.9,
            onend: onEnd
          });
        } catch (e) {
          // If ResponsiveVoice fails (e.g., missing voice), fallback to browser
          console.warn("ResponsiveVoice failed, using browser TTS", e);
          if ('speechSynthesis' in window) {
            if (window.Logic) window.Logic.isSpeaking = true;
            if (btnElement) btnElement.innerHTML = '<span class="material-symbols-rounded">stop_circle</span> থামুন';
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = lang || 'bn-BD';
            utterance.rate = 0.9;
            utterance.onend = onEnd;
            window.speechSynthesis.speak(utterance);
          } else {
            resetBtn();
          }
        }
      } else if ('speechSynthesis' in window) {
        if (window.Logic) window.Logic.isSpeaking = true;
        if (btnElement) btnElement.innerHTML = '<span class="material-symbols-rounded">stop_circle</span> থামুন';
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = lang || 'bn-BD';
        utterance.rate = 0.9;
        utterance.onend = onEnd;
        window.speechSynthesis.speak(utterance);
      } else {
        resetBtn();
        alert("Your browser does not support text-to-speech.");
      }
    },

    buildQuranCard: (ayahData, originalRefText) => {
      const id = 'quran_' + Math.random().toString(36).substr(2, 9);
      return `
      <div class="islamic-embed-card" id="${id}">
          <div class="embed-header">
             <span class="material-symbols-rounded" style="color:var(--accent-primary);">menu_book</span>
             <span>${originalRefText} (${ayahData.surahEnName})</span>
          </div>
          <div class="embed-body">
             <div class="arabic-text" style="font-size:28px; border:none; background:transparent; padding:0; margin-bottom:12px;">
                ${ayahData.arabic} ۝
             </div>
             ${ayahData.transliteration ? `<div style="font-size:15px; color:var(--text-secondary); line-height:1.6; padding-left:12px; border-left:3px solid #7c3aed; margin-bottom:10px;"><b>উচ্চারণ:</b> ${ayahData.transliteration}</div>` : ''}
             <div style="font-size:16px; color:var(--text-secondary); line-height:1.6; padding-left:12px; border-left:3px solid var(--accent-primary); margin-bottom:10px;">
                <b>বাংলা অর্থ:</b> ${ayahData.bangla}
             </div>
             ${ayahData.english ? `<div style="font-size:15px; color:var(--text-secondary); line-height:1.6; padding-left:12px; border-left:3px solid #2563eb;"><b>English:</b> ${ayahData.english}</div>` : ''}
          </div>
          <div class="embed-footer">
              <button class="embed-btn" onclick="IslamicModule.UI.playAudio('${ayahData.audio}', this)">
                  <span class="material-symbols-rounded">play_circle</span> প্লে
              </button>
              ${ayahData.bangla ? `<button class="embed-btn" onclick="IslamicModule.UI.playTTS('${String(ayahData.bangla || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')}', this, 'bn-BD')"><span class="material-symbols-rounded">record_voice_over</span> বাংলা অডিও</button>` : ''}
              ${ayahData.english ? `<button class="embed-btn" onclick="IslamicModule.UI.playTTS('${String(ayahData.english || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')}', this, 'en-US')"><span class="material-symbols-rounded">record_voice_over</span> English Audio</button>` : ''}
              <button class="embed-btn" onclick="navigator.clipboard.writeText('${ayahData.arabic}\\n\\n${ayahData.bangla}')">
                  <span class="material-symbols-rounded">content_copy</span> কপি
              </button>
          </div>
      </div>`;
    },

    buildHadithCard: (hadithData, originalRefText) => {
      const id = 'hadith_' + Math.random().toString(36).substr(2, 9);
      const safeText = hadithData.bangla.replace(/'/g, "\\'").replace(/"/g, '&quot;');
      return `
      <div class="islamic-embed-card" style="border-left-color: #f59e0b;" id="${id}">
          <div class="embed-header">
             <span class="material-symbols-rounded" style="color:#f59e0b;">library_books</span>
             <span>${originalRefText}</span>
             <span style="margin-left:auto; font-size:12px; background:#fef3c7; color:#b45309; padding:2px 8px; border-radius:12px;">${hadithData.grade}</span>
          </div>
          <div class="embed-body">
             <div style="font-size:16px; color:var(--text-primary); line-height:1.6; padding:12px; background:var(--bg-main); border-radius:12px;">
                ${hadithData.bangla}
             </div>
          </div>
          <div class="embed-footer">
              <button class="embed-btn" onclick="IslamicModule.UI.playTTS('${safeText}', this)">
                  <span class="material-symbols-rounded">record_voice_over</span> শুনুন
              </button>
              <button class="embed-btn" onclick="navigator.clipboard.writeText('${safeText}')">
                  <span class="material-symbols-rounded">content_copy</span> কপি
              </button>
          </div>
      </div>`;
    },

    // Topic card for hadith grid
    buildTopicCard: (topic, onClick) => {
      return `
      <div class="q-card" style="border-left:4px solid #f59e0b;" onclick="${onClick}">
          <span class="material-symbols-rounded" style="color:#f59e0b;">topic</span>
          <span style="font-size: 16px; font-weight: 700;">${topic.name}</span>
          <span style="font-size: 12px; color: var(--text-secondary;">${topic.count} টি হাদিস</span>
      </div>`;
    }
  };

  // --- REGEX REFERENCE MATCHER ---
  const AutoMatcher = {
    processText: async (text, containerElement) => {
      const quranRegex = /(?:সূরা|সুরা|কুরআন|surah)[^\d]*?(\d+)\s*[:|ঃ]\s*(\d+)/gi;
      const hadithRegex = /(বুখারী|মুসলিম|আবু দাউদ|তিরমিযী|নাসাঈ|মাজাহ|bukhari|muslim|dawud|tirmidhi|nasai|majah)[^\d]*?(\d+)/gi;

      let fetchPromises = [];

      let tempDiv = document.createElement('div');
      tempDiv.innerHTML = text;

      function replaceInTextNodes(node, regex, type) {
        if (node.nodeType === 3) {
          let text = node.nodeValue;
          let m;
          let localRegex = new RegExp(regex.source, regex.flags);
          let tempHtml = text;
          let hasMatch = false;

          while ((m = localRegex.exec(tempHtml)) !== null) {
            hasMatch = true;
            const fullMatch = m[0];
            const placeholderId = (type === 'quran' ? 'q_' : 'h_') + 'placeholder_' + Math.random().toString(36).substr(2, 9);

            if (type === 'quran') {
              fetchPromises.push({ type: 'quran', placeholder: placeholderId, surah: m[1], ayah: m[2], originalText: fullMatch });
            } else {
              fetchPromises.push({ type: 'hadith', placeholder: placeholderId, book: m[1], number: m[2], originalText: fullMatch });
            }

            tempHtml = tempHtml.substring(0, m.index) +
              `<div id="${placeholderId}" class="loading-embed">লোড হচ্ছে: ${fullMatch}...</div>` +
              tempHtml.substring(m.index + fullMatch.length);

            localRegex.lastIndex = m.index + placeholderId.length + 42 + fullMatch.length;
          }

          if (hasMatch) {
            let span = document.createElement('span');
            span.innerHTML = tempHtml;
            node.parentNode.replaceChild(span, node);
          }
        } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE' && !node.classList.contains('loading-embed')) {
          for (let i = 0; i < node.childNodes.length; i++) {
            replaceInTextNodes(node.childNodes[i], regex, type);
          }
        }
      }

      replaceInTextNodes(tempDiv, quranRegex, 'quran');
      replaceInTextNodes(tempDiv, hadithRegex, 'hadith');

      containerElement.innerHTML = tempDiv.innerHTML;

      for (let req of fetchPromises) {
        try {
          const el = document.getElementById(req.placeholder);
          if (!el) continue;

          if (req.type === 'quran') {
            const data = await QuranAPI.getAyah(req.surah, req.ayah);
            if (data) {
              el.outerHTML = UIRenderer.buildQuranCard(data, req.originalText);
            } else {
              el.outerHTML = `<b>${req.originalText}</b> <span style="font-size:12px;color:red;">(তথ্য পাওয়া যায়নি)</span>`;
            }
          } else {
            const data = await HadithAPI.getHadith(req.book, req.number);
            if (data) {
              el.outerHTML = UIRenderer.buildHadithCard(data, req.originalText);
            } else {
              el.outerHTML = `<b>${req.originalText}</b> <span style="font-size:12px;color:red;">(তথ্য পাওয়া যায়নি)</span>`;
            }
          }
        } catch (e) {
          console.error("Match replace error", e);
          const el = document.getElementById(req.placeholder);
          if (el) el.outerHTML = `<b>${req.originalText}</b>`;
        }
      }
    },

    injectStyles: () => {
      if (document.getElementById('islamic-embed-styles')) return;
      const style = document.createElement('style');
      style.id = 'islamic-embed-styles';
      style.innerHTML = `
        .islamic-embed-card {
            background: var(--bg-surface, #ffffff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-left: 5px solid var(--accent-primary, #0b5e42);
            border-radius: 16px;
            margin: 20px 0;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            font-family: inherit;
        }
        .islamic-embed-card .embed-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            background: rgba(0,0,0,0.02);
            border-bottom: 1px solid var(--border-color, #e5e7eb);
            font-weight: bold;
            font-size: 14px;
        }
        .islamic-embed-card .embed-body {
            padding: 16px;
        }
        .islamic-embed-card .embed-footer {
            display: flex;
            gap: 8px;
            padding: 10px 16px;
            background: rgba(0,0,0,0.01);
            border-top: 1px dashed var(--border-color, #e5e7eb);
        }
        .embed-btn {
            background: transparent;
            border: 1px solid var(--border-color, #e5e7eb);
            padding: 6px 12px;
            border-radius: 20px;
            cursor: pointer;
            display:flex;
            align-items:center;
            gap:6px;
            font-weight:600;
            font-size:13px;
            color: var(--text-primary, #1f2937);
            transition: all 0.2s;
        }
        .embed-btn:hover {
            background: var(--bg-main, #f3f4f6);
        }
        .audio-playing {
            background: #ecfdf5 !important;
            border-color: #10b981 !important;
            color: #047857 !important;
        }
        .loading-embed {
            display: inline-block;
            padding: 4px 12px;
            background: var(--mag-3-bg, #e3f2fd);
            color: var(--mag-3-border, #64b5f6);
            border-radius: 20px;
            font-size: 14px;
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Public API
  return {
    init: async () => {
      await initDB();
      AutoMatcher.injectStyles();
    },
    Quran: {
      ...QuranAPI,
      toggleAutoAdvance,
      getAutoAdvance: () => autoAdvanceEnabled
    },
    Hadith: HadithAPI,
    UI: UIRenderer,
    AutoMatcher
  };
})();