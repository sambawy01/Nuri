// curriculum-religion-islamic.js
// Source: Egyptian Ministry of Education — Islamic Religious Education Curriculum 2025-2026
// Based on the new Education 2.0 system
// Strands: Aqeedah & Quran, Seerah & Figures, Ibadaat (Worship), Akhlaq & Values

const religionIslamic = {
  1: [
    {
      id: 'religion-islamic-1-allah',
      name: 'Allah is My Lord (الله ربي)',
      strand: 'Aqeedah & Quran',
      codes: [],
      objectives: [
        'Recite and understand the meaning of the Shahada (testimony of faith)',
        'Name the five pillars of Islam and explain each one simply',
        'Recite Surah Al-Ikhlas and explain that Allah is One with no partners',
        'Describe Allah as the Creator of everything, the All-Hearing, All-Seeing, the Forgiving, and the Most Merciful',
        'Know that Allah sent heavenly books to guide people',
      ],
    },
    {
      id: 'religion-islamic-1-quran-memorisation',
      name: 'Quran Memorization Year 1 (حفظ القرآن - السنة الأولى)',
      strand: 'Aqeedah & Quran',
      codes: [],
      objectives: [
        'Memorise and recite Surah Al-Fatiha with correct pronunciation',
        'Memorise and recite Surah Al-Ikhlas, Al-Falaq, and An-Nas',
        'Memorise and recite Surah Al-Alaq and Surah Al-Qadr',
        'Understand the simple meaning of each memorised surah',
      ],
    },
    {
      id: 'religion-islamic-1-prophet-early-life',
      name: 'The Prophet\'s Early Life (حياة الرسول المبكرة)',
      strand: 'Seerah & Figures',
      codes: [],
      objectives: [
        'Retell the story of Prophet Ibrahim and Ismail building the Kaaba',
        'Describe the birth and early childhood of Prophet Muhammad ﷺ',
        'Explain how the Quran was first revealed to the Prophet in Cave Hira',
        'Describe how Khadijah reassured the Prophet after the first revelation',
      ],
    },
    {
      id: 'religion-islamic-1-companions',
      name: 'Companions of the Prophet (صحابة الرسول)',
      strand: 'Seerah & Figures',
      codes: [],
      objectives: [
        'Identify Abu Bakr As-Siddiq and explain why he was called "the truthful"',
        'Know that Khadijah bint Khuwaylid was the first to believe in the Prophet',
        'Identify Ali ibn Abi Talib as the Prophet\'s cousin and early believer',
        'Understand the hadith "The best of you is the best to his family"',
      ],
    },
    {
      id: 'religion-islamic-1-prayer-purification',
      name: 'Prayer and Purification (الصلاة والطهارة)',
      strand: 'Ibadaat',
      codes: [],
      objectives: [
        'Demonstrate the steps of wudu (ablution) in the correct order',
        'Recite Surah Al-Fatiha as part of prayer',
        'Name the five daily prayer times and perform basic prayer movements',
        'Recite simple prayer supplications and the Tashahhud',
        'Understand the importance of conserving water during wudu',
      ],
    },
    {
      id: 'religion-islamic-1-charity-pilgrimage',
      name: 'Charity and Pilgrimage (الزكاة والحج)',
      strand: 'Ibadaat',
      codes: [],
      objectives: [
        'Explain what Zakat is and why Muslims give to those in need',
        'Describe Hajj as the pilgrimage to Makkah and one of the five pillars',
        'Understand that Sadaqah (voluntary charity) helps others and pleases Allah',
      ],
    },
    {
      id: 'religion-islamic-1-good-character',
      name: 'Good Character (حسن الخلق)',
      strand: 'Akhlaq & Values',
      codes: [],
      objectives: [
        'Practise tolerance and compassion toward others in daily life',
        'Explain why maintaining family ties and honouring parents is important in Islam',
        'Show kindness to animals and respect toward elders',
        'Understand the importance of guarding the tongue and speaking good words',
        'Recite a simple Ramadan nasheed and understand its meaning',
      ],
    },
  ],

  2: [
    {
      id: 'religion-islamic-2-pillars-of-faith',
      name: 'Pillars of Faith (أركان الإيمان)',
      strand: 'Aqeedah & Quran',
      codes: [],
      objectives: [
        'Name and explain the six pillars of faith (Iman)',
        'Describe belief in Allah, His Angels, and His Messengers',
        'Identify the Messengers of strong will (Ulul Azm)',
        'Explain belief in the Last Day and describe Paradise and its conditions',
      ],
    },
    {
      id: 'religion-islamic-2-quran-memorisation',
      name: 'Quran Memorization Year 2 (حفظ القرآن - السنة الثانية)',
      strand: 'Aqeedah & Quran',
      codes: [],
      objectives: [
        'Memorise and recite Surah Al-Falaq and An-Nas with correct pronunciation',
        'Memorise and recite Surah Ad-Duha and understand its message of comfort',
        'Memorise and recite Surah Al-Lail and understand its themes',
      ],
    },
    {
      id: 'religion-islamic-2-stories-prophets',
      name: 'Stories of the Prophets (قصص الأنبياء)',
      strand: 'Seerah & Figures',
      codes: [],
      objectives: [
        'Retell the story of Prophet Noah and the great flood',
        'Retell the story of Prophet Abraham and his faith in Allah',
        'Describe how Hagar searched for water and the miracle of Zamzam',
        'Explain the story of the Ransom Sacrifice and its significance',
      ],
    },
    {
      id: 'religion-islamic-2-prophet-companions',
      name: 'The Prophet and His Companions (الرسول وصحابته)',
      strand: 'Seerah & Figures',
      codes: [],
      objectives: [
        'Describe key events from Prophet Muhammad\'s childhood',
        'Identify the four Rightly Guided Caliphs: Abu Bakr, Umar, Uthman, and Ali',
        'Know the contributions of Aisha bint Abi Bakr and Hafsa bint Umar',
      ],
    },
    {
      id: 'religion-islamic-2-perfecting-prayer',
      name: 'Perfecting Prayer (إتقان الصلاة)',
      strand: 'Ibadaat',
      codes: [],
      objectives: [
        'Demonstrate proper etiquette and behaviour during prayer',
        'Identify the pillars (arkan) of prayer and explain why each is essential',
        'Recite the remembrances (adhkar) said after prayer',
      ],
    },
    {
      id: 'religion-islamic-2-fasting-celebrations',
      name: 'Fasting and Celebrations (الصيام والأعياد)',
      strand: 'Ibadaat',
      codes: [],
      objectives: [
        'Describe Hajj in more detail and explain its rituals',
        'Explain the meaning and practices of Eid Al-Adha',
        'Understand what fasting means and why Muslims fast in Ramadan',
        'Explain the meaning and practices of Eid Al-Fitr',
      ],
    },
    {
      id: 'religion-islamic-2-islamic-values',
      name: 'Islamic Values (القيم الإسلامية)',
      strand: 'Akhlaq & Values',
      codes: [],
      objectives: [
        'Practise truthfulness and trustworthiness in daily interactions',
        'Demonstrate good table manners and personal cleanliness as Islamic habits',
        'Explain the importance of cooperation with family and classmates',
      ],
    },
    {
      id: 'religion-islamic-2-stories-good-character',
      name: 'Stories of Good Character (قصص الأخلاق الحميدة)',
      strand: 'Akhlaq & Values',
      codes: [],
      objectives: [
        'Identify examples of tolerance and mercy from Islamic stories',
        'Explain the rewards of honouring parents and showing humility',
        'Describe how giving to others and participation strengthen the community',
      ],
    },
  ],

  3: [
    {
      id: 'religion-islamic-3-names-of-allah',
      name: 'Names of Allah (أسماء الله الحسنى)',
      strand: 'Aqeedah & Quran',
      codes: [],
      objectives: [
        'Explain the Oneness of Allah (Tawhid) and why it is central to Islam',
        'Describe the meanings of Al-Malik (The King), As-Salam (The Source of Peace), and Al-Afuw (The Pardoner)',
        'Explain the concept of God-consciousness (Taqwa) and how it guides behaviour',
      ],
    },
    {
      id: 'religion-islamic-3-quran-sunnah',
      name: 'Quran and Sunnah (القرآن والسنة)',
      strand: 'Aqeedah & Quran',
      codes: [],
      objectives: [
        'Explain that the Quran and Sunnah are the two main sources of guidance in Islam',
        'Describe the concepts of Paradise and Hell as described in the Quran',
        'Identify righteous deeds mentioned in Surah Al-Balad and explain their importance',
        'Apply lessons from Quran and Sunnah to everyday situations',
      ],
    },
    {
      id: 'religion-islamic-3-quran-memorisation',
      name: 'Quran Memorization Year 3 (حفظ القرآن - السنة الثالثة)',
      strand: 'Aqeedah & Quran',
      codes: [],
      objectives: [
        'Memorise and recite selected verses from Surah Al-Hashr and Ar-Rahman',
        'Memorise and recite selected verses from Surah Al-Hujurat and Al-Balad',
        'Demonstrate improved recitation with attention to basic pronunciation rules',
      ],
    },
    {
      id: 'religion-islamic-3-trials-prophet',
      name: 'Trials of the Prophet (محن الرسول)',
      strand: 'Seerah & Figures',
      codes: [],
      objectives: [
        'Describe the Year of Sorrow and the Prophet\'s journey to Taif',
        'Explain how the Prophet showed mercy and patience during hardship',
        'Describe the Prophet\'s character with his family, grandsons, and companions',
      ],
    },
    {
      id: 'religion-islamic-3-prophets-companions',
      name: 'Prophets and Companions (أنبياء وصحابة)',
      strand: 'Seerah & Figures',
      codes: [],
      objectives: [
        'Retell the story of Prophet Yunus and the lessons of patience and repentance',
        'Retell the story of Prophet Solomon and his wisdom and kingdom',
        'Identify Zayd ibn Thabit, Ja\'far ibn Abi Talib, and Mus\'ab ibn Umayr and their contributions to Islam',
      ],
    },
    {
      id: 'religion-islamic-3-purification-prayer',
      name: 'Purification and Prayer (الطهارة والصلاة)',
      strand: 'Ibadaat',
      codes: [],
      objectives: [
        'Demonstrate correct purification and ablution with understanding of its virtues',
        'Explain the conditions for valid prayer and actions that invalidate it',
        'Describe the virtues of prayer and strive to perfect its performance',
      ],
    },
    {
      id: 'religion-islamic-3-supplication-fasting',
      name: 'Supplication and Fasting (الدعاء والصيام)',
      strand: 'Ibadaat',
      codes: [],
      objectives: [
        'Explain the etiquette and best times for making dua (supplication)',
        'Recite daily supplications for morning, evening, eating, and sleeping',
        'Describe the virtues of fasting and explain the basic rules of how to fast',
        'Make supplication for others and understand its reward in Islam',
      ],
    },
    {
      id: 'religion-islamic-3-character-conduct',
      name: 'Character and Conduct (الأخلاق والسلوك)',
      strand: 'Akhlaq & Values',
      codes: [],
      objectives: [
        'Explain the concept of trust (Amanah) through the story of the shepherd',
        'Describe perseverance as a key to success using examples from the Prophet\'s life',
        'Understand that Allah shows mercy to the merciful',
        'Apply the etiquette of interacting with others as taught in Surah Al-Hujurat',
        'Explain the trust of speech and the responsibility of honest communication',
      ],
    },
  ],

  4: [
    {
      id: 'religion-islamic-4-knowing-allah',
      name: 'Knowing Allah (معرفة الله)',
      strand: 'Aqeedah & Quran',
      codes: [],
      objectives: [
        'Explain belief in Allah and His Angels with supporting evidence',
        'Describe the meaning of Al-Musawwir (The Fashioner) and recognise Allah\'s design in humans and the universe',
        'Explain the meaning of Al-Qadir (The All-Powerful) and give examples from creation',
        'Describe belief in Allah\'s Books and Messengers and their role in guidance',
      ],
    },
    {
      id: 'religion-islamic-4-quran-tajweed',
      name: 'Quran and Tajweed Year 4 (القرآن والتجويد)',
      strand: 'Aqeedah & Quran',
      codes: [],
      objectives: [
        'Memorise and recite Surah At-Tin and Surah An-Naba with correct tajweed',
        'Apply the rules of Lam (الـ) in recitation',
        'Identify and apply rules of Noon Sakinah and Tanween in Quran recitation',
      ],
    },
    {
      id: 'religion-islamic-4-prophet-mission',
      name: 'The Prophet\'s Mission Begins (بداية رسالة النبي)',
      strand: 'Seerah & Figures',
      codes: [],
      objectives: [
        'Describe Muhammad\'s lineage, upbringing, and role in rebuilding the Kaaba',
        'Explain the significance of Cave Hira and the first revelation',
        'Describe the secret call to Islam and the role of Al-Arqam ibn Abi Al-Arqam\'s house',
        'Explain the early challenges faced by Muslims in Makkah',
      ],
    },
    {
      id: 'religion-islamic-4-earlier-prophets',
      name: 'Earlier Prophets (الأنبياء السابقون)',
      strand: 'Seerah & Figures',
      codes: [],
      objectives: [
        'Retell the story of Prophet Hud and his people of \'Ad',
        'Retell the story of the People of the Cave (Ashab Al-Kahf) and its lessons of faith',
        'Extract moral lessons from prophetic stories about patience and trust in Allah',
      ],
    },
    {
      id: 'religion-islamic-4-worship-detail',
      name: 'Worship in Detail (العبادات بالتفصيل)',
      strand: 'Ibadaat',
      codes: [],
      objectives: [
        'Explain the role of water in purification and demonstrate correct ablution',
        'Describe the etiquette of relieving oneself in Islam',
        'Explain the virtues of prayer, the Adhan, and the Iqamah',
        'Perform a complete description of prayer from beginning to end',
      ],
    },
    {
      id: 'religion-islamic-4-ramadan-fasting',
      name: 'Ramadan and Fasting (رمضان والصيام)',
      strand: 'Ibadaat',
      codes: [],
      objectives: [
        'Explain how the beginning of Ramadan is confirmed',
        'Describe the etiquette of fasting including suhoor and iftar',
        'Understand the spiritual benefits of fasting beyond hunger and thirst',
      ],
    },
    {
      id: 'religion-islamic-4-living-with-others',
      name: 'Living with Others (العيش مع الآخرين)',
      strand: 'Akhlaq & Values',
      codes: [],
      objectives: [
        'Explain how Islam teaches respect for people of different religions',
        'Describe tolerance as an Islamic value and give examples from the Prophet\'s life',
        'Understand the concept of coexistence and its importance in a diverse society',
      ],
    },
  ],

  5: [
    {
      id: 'religion-islamic-5-deepening-faith',
      name: 'Deepening Faith (تعميق الإيمان)',
      strand: 'Aqeedah & Quran',
      codes: [],
      objectives: [
        'Explain the concept of religion and worship (Ibadah) in Islam',
        'Describe the meanings of Allah\'s names Al-Wadoud (The Loving), Ar-Ra\'uf (The Compassionate), and Al-Hakeem (The Wise)',
        'Explain belief in heavenly books and their role across different prophets',
      ],
    },
    {
      id: 'religion-islamic-5-quran-tajweed',
      name: 'Quran and Tajweed Year 5 (القرآن والتجويد)',
      strand: 'Aqeedah & Quran',
      codes: [],
      objectives: [
        'Memorise and recite Surah Al-Infitar and Surah Al-A\'la with correct tajweed',
        'Apply tajweed rules: Idgham, Izhar, Iqlab, and Ikhfa',
        'Identify and apply Qalqalah and assimilation of Meem and Noon in recitation',
      ],
    },
    {
      id: 'religion-islamic-5-sunnah-hadith',
      name: 'Sunnah and Hadith (السنة والحديث)',
      strand: 'Aqeedah & Quran',
      codes: [],
      objectives: [
        'Explain the meaning of Prophetic Sunnah and its role alongside the Quran',
        'Memorise and explain the hadith "Guard Allah, He will guard you"',
        'Apply teachings from the Sunnah to personal conduct and daily life',
      ],
    },
    {
      id: 'religion-islamic-5-hijrah',
      name: 'The Hijrah (الهجرة)',
      strand: 'Seerah & Figures',
      codes: [],
      objectives: [
        'Describe the Prophet\'s preparation for Hijrah and the migration to Medina',
        'Retell the story of the Cave of Thawr and Allah\'s protection',
        'Explain the significance of building the Prophet\'s Mosque and brotherhood in Medina',
        'Describe how the Prophet dealt with epidemics and hardship in Medina',
      ],
    },
    {
      id: 'religion-islamic-5-early-battles',
      name: 'Early Battles (الغزوات الأولى)',
      strand: 'Seerah & Figures',
      codes: [],
      objectives: [
        'Describe the causes and events of the Battle of Badr',
        'Describe the causes and events of the Battle of Uhud',
        'Extract lessons about faith, unity, and obedience from the early battles',
      ],
    },
    {
      id: 'religion-islamic-5-prophet-musa',
      name: 'Prophet Musa (سيدنا موسى)',
      strand: 'Seerah & Figures',
      codes: [],
      objectives: [
        'Retell the story of Moses confronting Pharaoh with Allah\'s message',
        'Describe Moses\' departure from Egypt and the parting of the sea',
        'Extract lessons about courage and trust in Allah from the story of Musa',
      ],
    },
    {
      id: 'religion-islamic-5-advanced-prayer-fasting',
      name: 'Advanced Prayer and Fasting (أحكام متقدمة للصلاة والصيام)',
      strand: 'Ibadaat',
      codes: [],
      objectives: [
        'Explain advanced rulings related to prayer and cleanliness',
        'Describe the conditions and obligations of Ramadan fasting',
        'Identify valid exemptions from fasting and actions that invalidate the fast',
      ],
    },
    {
      id: 'religion-islamic-5-zakat',
      name: 'Zakat (الزكاة)',
      strand: 'Ibadaat',
      codes: [],
      objectives: [
        'Define Zakat al-Fitr and explain when and how it is given',
        'Explain the different types of Zakat and how they are calculated',
        'Identify the eligible recipients of Zakat and the etiquette of giving',
      ],
    },
    {
      id: 'religion-islamic-5-humility-character',
      name: 'Humility and Character (التواضع والأخلاق)',
      strand: 'Akhlaq & Values',
      codes: [],
      objectives: [
        'Explain humility as a core Islamic value and give examples from the Prophet\'s life',
        'Describe how faith leads to inner peace and strong character',
        'Connect the concept of humility in religion to respectful daily interactions',
      ],
    },
  ],

  6: [
    {
      id: 'religion-islamic-6-last-day',
      name: 'The Last Day (اليوم الآخر)',
      strand: 'Aqeedah & Quran',
      codes: [],
      objectives: [
        'Explain belief in the Last Day, Resurrection, and Accounting as pillars of faith',
        'Describe the concepts of reward and punishment in the Hereafter',
        'Explain piety (Taqwa) and righteous deeds as preparation for the Last Day',
      ],
    },
    {
      id: 'religion-islamic-6-quran-tajweed',
      name: 'Quran and Tajweed Year 6 (القرآن والتجويد)',
      strand: 'Aqeedah & Quran',
      codes: [],
      objectives: [
        'Memorise and recite Surah Al-Ma\'arij, Al-Haqqah, Al-Qalam, and selected verses of Al-Mulk',
        'Apply the rules of Isti\'adha and Basmala correctly before recitation',
        'Identify and apply the different types of extended Madd in Quran recitation',
      ],
    },
    {
      id: 'religion-islamic-6-later-events',
      name: 'Later Events and the Prophet\'s Death (الأحداث المتأخرة ووفاة النبي)',
      strand: 'Seerah & Figures',
      codes: [],
      objectives: [
        'Describe the events of the Battle of Hunayn and the Siege of Taif',
        'Explain the significance of the Tabuk Expedition',
        'Retell the events surrounding the death of the Prophet ﷺ and its impact on the community',
      ],
    },
    {
      id: 'religion-islamic-6-islamic-scholars',
      name: 'Great Islamic Scholars (علماء الإسلام العظام)',
      strand: 'Seerah & Figures',
      codes: [],
      objectives: [
        'Describe the contributions of Imam Abu Hanifah and Imam Malik ibn Anas to Islamic jurisprudence',
        'Describe the contributions of Imam Al-Shafi\'i to Islamic scholarship',
        'Identify Abu Hurairah as a major companion known for narrating hadith',
      ],
    },
    {
      id: 'religion-islamic-6-hajj',
      name: 'Hajj (الحج)',
      strand: 'Ibadaat',
      codes: [],
      objectives: [
        'Explain the pillars of Hajj and the sequence of its rituals',
        'Describe the etiquette and spiritual significance of Hajj',
        'Connect the rituals of Hajj to the stories of Ibrahim and Ismail',
      ],
    },
    {
      id: 'religion-islamic-6-transactions',
      name: 'Islamic Transactions (المعاملات الإسلامية)',
      strand: 'Ibadaat',
      codes: [],
      objectives: [
        'Explain the basic Islamic rules of buying and selling',
        'Identify prohibited practices in trade such as deception and hoarding',
        'Understand the importance of honesty and fairness in financial dealings',
      ],
    },
    {
      id: 'religion-islamic-6-mercy-brotherhood',
      name: 'Mercy, Brotherhood and Knowledge (الرحمة والأخوة والعلم)',
      strand: 'Akhlaq & Values',
      codes: [],
      objectives: [
        'Explain the Islamic values of mercy and gentleness in interactions with others',
        'Describe brotherhood in faith and how it strengthens the Muslim community',
        'Explain the importance of striving in knowledge as an act of worship',
        'Connect God-consciousness (Taqwa) to ethical behaviour and lifelong learning',
      ],
    },
  ],
};

module.exports = religionIslamic;
