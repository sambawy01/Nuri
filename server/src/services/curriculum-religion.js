// curriculum-religion.js
// Source: Egyptian Ministry of Education — Christian Religious Education Curriculum 2025-2026
// التربية الدينية المسيحية — Egyptian Education 2.0 Reform
// Developed by MOE in cooperation with the Coptic Orthodox Church and other Egyptian churches
// Textbooks: المكتبة الإلكترونية — ellibrary.moe.gov.eg/books/
// Note: This is the MOE school curriculum, not the Sunday School (مدارس الأحد) curriculum

const religion = {
  1: [
    {
      id: 'religion-1-who-am-i',
      name: 'Who Am I? — من أكون',
      strand: 'Bible & Faith',
      codes: [],
      objectives: [
        'Learn that God created me (الله خلقني) and my body is a gift from God',
        'Understand that I am part of a family that God loves',
        'Recognise that God loves me and cares for me',
        'Receive an introduction to church life and attending church',
      ],
    },
    {
      id: 'religion-1-creation-christmas',
      name: 'Creation and Christmas — الخلق وميلاد المسيح',
      strand: 'Bible & Faith',
      codes: [],
      objectives: [
        'Hear basic Bible stories from Creation',
        'Learn the Nativity story (ميلاد المسيح) and the meaning of Christmas',
        'Practise values of gratitude, sharing, and kindness',
      ],
    },
    {
      id: 'religion-1-jesus-easter',
      name: 'Jesus and Easter — يسوع والقيامة',
      strand: 'Bible & Faith',
      codes: [],
      objectives: [
        'Hear stories of Jesus\'s childhood',
        'Learn the meaning of Easter (القيامة) and its preparation',
        'Become aware of church feasts and celebrations',
      ],
    },
    {
      id: 'religion-1-prayers-values',
      name: 'Prayers and Good Behaviour — الصلاة والسلوك الحسن',
      strand: 'Values & Practice',
      codes: [],
      objectives: [
        'Learn to make the sign of the cross',
        'Receive an introduction to الصلاة الربانية (The Lord\'s Prayer)',
        'Learn basic prayers appropriate for young children',
        'Understand and practise good behaviour: gratitude, sharing, kindness',
      ],
    },
  ],

  2: [
    {
      id: 'religion-2-old-testament',
      name: 'Old Testament Stories — قصص العهد القديم',
      strand: 'Bible & Faith',
      codes: [],
      objectives: [
        'Hear the Creation narrative in greater depth',
        'Learn the story of Noah\'s Ark and God\'s promise',
        'Learn the story of Abraham and his faith in God',
        'Understand themes of God\'s care and protection in Old Testament stories',
      ],
    },
    {
      id: 'religion-2-jesus-miracles',
      name: 'Jesus\'s Miracles — معجزات يسوع',
      strand: 'Bible & Faith',
      codes: [],
      objectives: [
        'Hear simple miracle stories of Jesus from the New Testament',
        'Understand that Jesus\'s miracles show God\'s love and power',
        'Connect miracle stories to values of faith and trust in God',
      ],
    },
    {
      id: 'religion-2-values',
      name: 'Christian Values — القيم المسيحية',
      strand: 'Values & Practice',
      codes: [],
      objectives: [
        'Understand and practise honesty in daily life',
        'Understand and practise helping others',
        'Understand and practise obedience to parents',
      ],
    },
    {
      id: 'religion-2-church-life',
      name: 'Church Life and Feasts — الحياة الكنسية والأعياد',
      strand: 'Values & Practice',
      codes: [],
      objectives: [
        'Develop awareness of المعمودية (Baptism) as a sacrament',
        'Understand the importance of going to church regularly',
        'Learn simple hymns for children',
        'Become aware of Coptic feasts and the church calendar',
      ],
    },
  ],

  3: [
    {
      id: 'religion-3-moses-exodus',
      name: 'Moses and the Exodus — موسى والخروج',
      strand: 'Bible & Faith',
      codes: [],
      objectives: [
        'Learn the story of Moses and the Exodus from Egypt',
        'Learn the Ten Commandments (الوصايا العشر) and their meaning',
        'Understand God\'s law and guidance for His people',
      ],
    },
    {
      id: 'religion-3-parables',
      name: 'Parables of Jesus — أمثال يسوع',
      strand: 'Bible & Faith',
      codes: [],
      objectives: [
        'Hear and understand simple parables of Jesus',
        'Extract moral and spiritual lessons from parables',
        'Connect parable teachings to daily life and behaviour',
      ],
    },
    {
      id: 'religion-3-values',
      name: 'Values: Courage, Truth, Forgiveness — الشجاعة والصدق والمغفرة',
      strand: 'Values & Practice',
      codes: [],
      objectives: [
        'Understand and practise courage in standing for what is right',
        'Understand and practise truthfulness in speech and action',
        'Understand and practise forgiveness toward others',
      ],
    },
    {
      id: 'religion-3-church-traditions',
      name: 'Church Traditions — التقاليد الكنسية',
      strand: 'Values & Practice',
      codes: [],
      objectives: [
        'Learn the basics of القداس (The Liturgy) and its structure',
        'Identify parts of the church building and their significance',
        'Receive an introduction to key Coptic saints (سير القديسين)',
        'Memorise selected Psalms (مزامير)',
        'Develop awareness of the Coptic calendar and its seasons',
      ],
    },
  ],

  4: [
    {
      id: 'religion-4-love-others',
      name: 'Love for Others — حب الآخرين',
      strand: 'Bible & Faith',
      codes: [],
      objectives: [
        'Learn the story of the angel\'s announcement to Zechariah (بشارة الملاك لزكريا) from Luke\'s Gospel',
        'Learn the story of Joshua son of Nun (يشوع بن نون) from the Old Testament',
        'Learn the stories of the Virgin Mary and Elisabeth (العذراء مريم وأليصابات)',
        'Learn the story of the Shunammite woman and Elisha (المرأة الشونمية وأليشع)',
        'Understand prayer methods and spiritual disciplines',
      ],
    },
    {
      id: 'religion-4-prayer-gods-will',
      name: 'Prayer and God\'s Will — الصلاة وإرادة الله',
      strand: 'Bible & Faith',
      codes: [],
      objectives: [
        'Learn about Christ\'s childhood (طفولة المسيح)',
        'Learn the story of Elijah and the rain (إيليا والمطر) and the power of prayer',
        'Learn the story of Deborah and Barak (دبورة وباراق) from Old Testament judges',
        'Learn the story of Zacchaeus (زكا العشار) — self-reliance and repentance',
        'Learn the life of Saint Abanoub (القديس أبانوب) — Coptic child martyr',
      ],
    },
    {
      id: 'religion-4-courage-generosity',
      name: 'Courage and Generosity — الشجاعة والكرم',
      strand: 'Bible & Faith',
      codes: [],
      objectives: [
        'Learn about the relationship between Christ and John the Baptist',
        'Learn the story of the temptation on the mountain (التجربة على الجبل) and the meaning of fasting',
        'Learn the story of Gideon (جدعون) from the Old Testament',
        'Learn the parable of the widow\'s mites (فلسا الأرملة) and the value of generosity',
        'Learn the life of Saint George (مار جرجس) — the martyr',
        'Memorise golden verses (آيات ذهبية) from Scripture',
      ],
    },
  ],

  5: [
    {
      id: 'religion-5-christ-in-ot',
      name: 'Symbols of Christ in the Old Testament — رموز السيد المسيح في العهد القديم',
      strand: 'Bible & Faith',
      codes: [],
      objectives: [
        'Understand Old Testament typology (رموز): the Manna and the Rock as symbols of Christ (المن والصخرة)',
        'Understand the Battle of Amalek (حرب عماليق) as a type of Christ\'s victory',
        'Learn that Jesus is the fulfiller of Old Testament prophecies (الرب يسوع محقق النبوءات)',
        'Learn the story of the Three Youths in the furnace (الفتية الثلاثة) from Daniel 3 as an example of courage',
      ],
    },
    {
      id: 'religion-5-jesus-disciples',
      name: 'Jesus with His Disciples — الرب يسوع مع تلاميذه',
      strand: 'Bible & Faith',
      codes: [],
      objectives: [
        'Learn the account of the Transfiguration on the mount (على جبل التجلي)',
        'Learn the account of the Wedding at Cana of Galilee (في عرس قانا الجليل)',
        'Study the Tabernacle of Meeting (خيمة الاجتماع) as an image of heaven on earth and precursor to the church',
      ],
    },
    {
      id: 'religion-5-church-patriotism',
      name: 'The Church and Patriotism — الكنيسة وحب الوطن',
      strand: 'Values & Practice',
      codes: [],
      objectives: [
        'Understand the church as a school of patriotism (الكنيسة مدرسة حب الوطن)',
        'Discuss technology and social media ethics from a Christian perspective (التطور التكنولوجي ووسائل التواصل الاجتماعي)',
        'Apply Christian values to contemporary ethical situations',
      ],
    },
    {
      id: 'religion-5-scripture',
      name: 'Scripture Memorisation — المحفوظات',
      strand: 'Values & Practice',
      codes: [],
      objectives: [
        'Memorise extended passages from the Sermon on the Mount (الموعظة على الجبل) — Matthew 6:25-34',
        'Understand the meaning and application of memorised Scripture passages',
        'Connect OT prophecies to their NT fulfilment in structured Bible study',
      ],
    },
  ],

  6: [
    {
      id: 'religion-6-discovering-myself',
      name: 'Discovering Myself — اكتشف ذاتي',
      strand: 'Bible & Faith',
      codes: [],
      objectives: [
        'Learn the doctrine of الثالوث القدوس (The Holy Trinity) as core Christian teaching',
        'Learn about gratitude through the story of Israel\'s complaints in the wilderness (تذمرات بني إسرائيل)',
        'Understand the importance of العلاقات الأسرية (family relationships) from a Christian perspective',
        'Learn the story of Saul of Tarsus (شاول الطرسوسي) and his conversion to St. Paul as a lesson in patience (الصبر)',
        'Learn the life of Saint Mercurius — Abu Seifein (القديس مرقوريوس أبو سيفين)',
      ],
    },
    {
      id: 'religion-6-relationships',
      name: 'My Relationships with Others — علاقتي بالآخرين',
      strand: 'Bible & Faith',
      codes: [],
      objectives: [
        'Learn about الكتاب المقدس (The Holy Bible): its structure, inspiration, and importance',
        'Understand the value of المشورة والنصيحة (consultation and advice)',
        'Learn about sibling relationships through Miriam, Aaron, and Moses (مريم وهارون وموسى)',
        'Learn about التوبة والاعتراف (repentance and confession) through the story of Onesimus (أنسيموس)',
        'Learn the life of Saint Marina (القديسة مارينا) — Victor over Satan (الغالبة للشيطان)',
      ],
    },
    {
      id: 'religion-6-scripture',
      name: 'Scripture Memorisation — المحفوظات',
      strand: 'Values & Practice',
      codes: [],
      objectives: [
        'Continue memorising extended passages from the Sermon on the Mount (الموعظة على الجبل)',
        'Understand and apply memorised Scripture to daily ethical decisions',
        'Demonstrate Bible literacy: locate books, chapters, and verses in the Holy Bible',
      ],
    },
    {
      id: 'religion-6-sacraments-ethics',
      name: 'Sacraments and Ethics — الأسرار والأخلاق',
      strand: 'Values & Practice',
      codes: [],
      objectives: [
        'Understand التوبة والاعتراف (Repentance and Confession) as a sacrament of the Coptic Orthodox Church',
        'Discuss ethical topics: gratitude vs. complaining, patience, giving advice, responsible relationships',
        'Connect church teachings to modern life situations and personal decisions',
      ],
    },
  ],
};

module.exports = religion;
