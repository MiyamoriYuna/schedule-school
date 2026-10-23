// ========================================
// 高等学校・共通教科 科目マスター
// 出典：文部科学省
// 高等学校学習指導要領（平成30年告示）
// ========================================

const highSchoolCommonSubjectMaster = [
  // 国語
  { id: "hs-common-japanese-modern", category: "国語", officialName: "現代の国語", credits: 2, requiredGroup: "japanese" },
  { id: "hs-common-japanese-language-culture", category: "国語", officialName: "言語文化", credits: 2, requiredGroup: "japanese" },
  { id: "hs-common-japanese-logic", category: "国語", officialName: "論理国語", credits: 4 },
  { id: "hs-common-japanese-literature", category: "国語", officialName: "文学国語", credits: 4 },
  { id: "hs-common-japanese-expression", category: "国語", officialName: "国語表現", credits: 4 },
  { id: "hs-common-japanese-classics", category: "国語", officialName: "古典探究", credits: 4 },

  // 地理歴史
  { id: "hs-common-geography-general", category: "地理歴史", officialName: "地理総合", credits: 2, requiredGroup: "geographyHistory" },
  { id: "hs-common-geography-advanced", category: "地理歴史", officialName: "地理探究", credits: 3 },
  { id: "hs-common-history-general", category: "地理歴史", officialName: "歴史総合", credits: 2, requiredGroup: "geographyHistory" },
  { id: "hs-common-history-japan", category: "地理歴史", officialName: "日本史探究", credits: 3 },
  { id: "hs-common-history-world", category: "地理歴史", officialName: "世界史探究", credits: 3 },

  // 公民
  { id: "hs-common-civics-public", category: "公民", officialName: "公共", credits: 2, required: true },
  { id: "hs-common-civics-ethics", category: "公民", officialName: "倫理", credits: 2 },
  { id: "hs-common-civics-politics-economics", category: "公民", officialName: "政治・経済", credits: 2 },

  // 数学
  { id: "hs-common-math-1", category: "数学", officialName: "数学Ⅰ", credits: 3, required: true },
  { id: "hs-common-math-2", category: "数学", officialName: "数学Ⅱ", credits: 4 },
  { id: "hs-common-math-3", category: "数学", officialName: "数学Ⅲ", credits: 3 },
  { id: "hs-common-math-a", category: "数学", officialName: "数学A", credits: 2 },
  { id: "hs-common-math-b", category: "数学", officialName: "数学B", credits: 2 },
  { id: "hs-common-math-c", category: "数学", officialName: "数学C", credits: 2 },

  // 理科
  { id: "hs-common-science-human-life", category: "理科", officialName: "科学と人間生活", credits: 2, requiredGroup: "science" },
  { id: "hs-common-physics-basic", category: "理科", officialName: "物理基礎", credits: 2, requiredGroup: "science" },
  { id: "hs-common-physics", category: "理科", officialName: "物理", credits: 4 },
  { id: "hs-common-chemistry-basic", category: "理科", officialName: "化学基礎", credits: 2, requiredGroup: "science" },
  { id: "hs-common-chemistry", category: "理科", officialName: "化学", credits: 4 },
  { id: "hs-common-biology-basic", category: "理科", officialName: "生物基礎", credits: 2, requiredGroup: "science" },
  { id: "hs-common-biology", category: "理科", officialName: "生物", credits: 4 },
  { id: "hs-common-earth-science-basic", category: "理科", officialName: "地学基礎", credits: 2, requiredGroup: "science" },
  { id: "hs-common-earth-science", category: "理科", officialName: "地学", credits: 4 },

  // 保健体育
  { id: "hs-common-pe", category: "保健体育", officialName: "体育", credits: "7〜8", required: true },
  { id: "hs-common-health", category: "保健体育", officialName: "保健", credits: 2, required: true },

  // 芸術
  ...["音楽", "美術", "工芸", "書道"].flatMap((category) =>
    [1, 2, 3].map((level) => ({
      id: `hs-common-arts-${category}-${level}`,
      category: "芸術",
      officialName: `${category}${["Ⅰ", "Ⅱ", "Ⅲ"][level - 1]}`,
      credits: 2,
      requiredGroup: level === 1 ? "arts" : undefined
    }))
  ),

  // 外国語
  { id: "hs-common-english-communication-1", category: "外国語", officialName: "英語コミュニケーションⅠ", credits: 3, required: true },
  { id: "hs-common-english-communication-2", category: "外国語", officialName: "英語コミュニケーションⅡ", credits: 4 },
  { id: "hs-common-english-communication-3", category: "外国語", officialName: "英語コミュニケーションⅢ", credits: 4 },
  { id: "hs-common-english-expression-1", category: "外国語", officialName: "論理・表現Ⅰ", credits: 2 },
  { id: "hs-common-english-expression-2", category: "外国語", officialName: "論理・表現Ⅱ", credits: 2 },
  { id: "hs-common-english-expression-3", category: "外国語", officialName: "論理・表現Ⅲ", credits: 2 },

  // 家庭
  { id: "hs-common-home-basic", category: "家庭", officialName: "家庭基礎", credits: 2, requiredGroup: "homeEconomics" },
  { id: "hs-common-home-comprehensive", category: "家庭", officialName: "家庭総合", credits: 4, requiredGroup: "homeEconomics" },

  // 情報
  { id: "hs-common-information-1", category: "情報", officialName: "情報Ⅰ", credits: 2, required: true },
  { id: "hs-common-information-2", category: "情報", officialName: "情報Ⅱ", credits: 2 },

  // 理数
  { id: "hs-common-math-science-inquiry-basic", category: "理数", officialName: "理数探究基礎", credits: 1 },
  { id: "hs-common-math-science-inquiry", category: "理数", officialName: "理数探究", credits: "2〜5" },

  // 総合的な探究の時間
  { id: "hs-common-integrated-inquiry", category: "総合的な探究の時間", officialName: "総合的な探究の時間", credits: "3〜6", required: true }
];

// ========================================
// 中学校・教科マスター
// 出典：文部科学省
// 中学校学習指導要領
// ========================================

const juniorHighSubjectMaster = [
  {
    id: "jh-japanese",
    officialName: "国語",
    category: "国語",
    subjectType: "common"
  },
  {
    id: "jh-social-studies",
    officialName: "社会",
    category: "社会",
    subjectType: "common"
  },
  {
    id: "jh-math",
    officialName: "数学",
    category: "数学",
    subjectType: "common"
  },
  {
    id: "jh-science",
    officialName: "理科",
    category: "理科",
    subjectType: "common"
  },
  {
    id: "jh-music",
    officialName: "音楽",
    category: "音楽",
    subjectType: "common"
  },
  {
    id: "jh-art",
    officialName: "美術",
    category: "美術",
    subjectType: "common"
  },
  {
    id: "jh-health-physical-education",
    officialName: "保健体育",
    category: "保健体育",
    subjectType: "common"
  },
  {
    id: "jh-technology-home-economics",
    officialName: "技術・家庭",
    category: "技術・家庭",
    subjectType: "common"
  },
  {
    id: "jh-foreign-language",
    officialName: "外国語",
    category: "外国語",
    subjectType: "common"
  },
  {
    id: "jh-moral-education",
    officialName: "道徳",
    category: "道徳",
    subjectType: "special"
  },
  {
    id: "jh-integrated-studies",
    officialName: "総合的な学習の時間",
    category: "総合的な学習の時間",
    subjectType: "special"
  },
  {
    id: "jh-special-activities",
    officialName: "特別活動",
    category: "特別活動",
    subjectType: "special"
  }
];

// ========================================
// 学校段階に応じた科目マスター取得
// ========================================

function getSubjectMasterForSchoolLevel(schoolLevel) {
  if (schoolLevel === "juniorHigh") {
    return juniorHighSubjectMaster;
  }

  if (schoolLevel === "highSchool") {
    return highSchoolCommonSubjectMaster;
  }

  return [];
}

// ========================================
// 高等学校・専門教科 科目マスター
// 出典：文部科学省
// 高等学校学習指導要領（平成30年告示）
// ========================================

const highSchoolSpecializedSubjectMaster = [
  // 農業
  ...[
    "農業と環境", "課題研究", "総合実習", "農業と情報",
    "作物", "野菜", "果樹", "草花", "畜産",
    "栽培と環境", "飼育と環境", "農業経営", "農業機械",
    "植物バイオテクノロジー", "食品製造", "食品化学",
    "食品微生物", "食品流通", "森林科学", "森林経営",
    "林産物利用", "農業土木設計", "農業土木施工",
    "水循環", "造園計画", "造園施工管理", "造園植栽",
    "測量", "生物活用", "地域資源活用"
  ].map((name, i) => ({
    id: `hs-special-agriculture-${String(i + 1).padStart(2, "0")}`,
    officialName: name,
    category: "農業",
    subjectType: "specialized",
    standardCredits: null,
    requiredType: "schoolDependent",
    aliases: []
  })),

  // 工業
  ...[
    "工業技術基礎", "課題研究", "実習", "製図",
    "工業情報数理", "工業材料技術", "工業技術英語",
    "工業管理技術", "工業環境技術", "機械工作",
    "機械設計", "原動機", "電子機械", "生産技術",
    "自動車工学", "自動車整備", "船舶工学",
    "電気回路", "電気機器", "電力技術", "電子技術",
    "電子回路", "電子計測制御", "通信技術",
    "プログラミング技術", "ハードウェア技術",
    "ソフトウェア技術", "コンピュータシステム技術",
    "建築構造", "建築計画", "建築構造設計",
    "建築施工", "建築法規", "設備計画",
    "空気調和設備", "衛生・防災設備", "測量",
    "土木基盤力学", "土木構造設計", "土木施工",
    "社会基盤工学", "工業化学", "化学工学",
    "地球環境化学", "材料製造技術", "材料工学",
    "材料加工", "セラミック化学", "セラミック技術",
    "セラミック工業", "繊維製品", "繊維・染色技術",
    "染織デザイン", "インテリア計画", "インテリア装備",
    "インテリアエレメント生産", "デザイン実践",
    "デザイン材料", "デザイン史"
  ].map((name, i) => ({
    id: `hs-special-industry-${String(i + 1).padStart(2, "0")}`,
    officialName: name,
    category: "工業",
    subjectType: "specialized",
    standardCredits: null,
    requiredType: "schoolDependent",
    aliases: []
  })),

  // 商業
  ...[
    "ビジネス基礎", "課題研究", "総合実践",
    "ビジネス実務", "マーケティング", "商品開発",
    "広告と販売促進", "ビジネス経済",
    "ビジネス経済応用", "経済活動と法", "簿記",
    "財務会計Ⅰ", "財務会計Ⅱ", "原価計算",
    "管理会計", "情報処理", "ビジネス情報",
    "電子商取引", "プログラミング", "ビジネス情報管理"
  ].map((name, i) => ({
    id: `hs-special-commerce-${String(i + 1).padStart(2, "0")}`,
    officialName: name,
    category: "商業",
    subjectType: "specialized",
    standardCredits: null,
    requiredType: "schoolDependent",
    aliases: []
  })),

  // 水産
  ...[
    "水産海洋基礎", "課題研究", "総合実習",
    "海洋情報技術", "水産海洋科学", "漁業",
    "航海・計器", "船舶運用", "船用機関",
    "機械設計工作", "電気理論", "移動体通信工学",
    "海洋通信技術", "資源増殖", "海洋生物",
    "海洋環境", "小型船舶", "食品製造",
    "食品管理", "水産流通", "ダイビング",
    "マリンスポーツ"
  ].map((name, i) => ({
    id: `hs-special-fisheries-${String(i + 1).padStart(2, "0")}`,
    officialName: name,
    category: "水産",
    subjectType: "specialized",
    standardCredits: null,
    requiredType: "schoolDependent",
    aliases: []
  }))
];

// ========================================
// 専門教科：家庭・看護・情報・福祉
// 出典：文部科学省
// 高等学校学習指導要領（平成30年告示）
// ========================================

const additionalSpecializedSubjects = [
  // 家庭（21科目）
  ...[
    "生活産業基礎",
    "課題研究",
    "生活産業情報",
    "消費生活",
    "保育基礎",
    "保育実践",
    "生活と福祉",
    "住生活デザイン",
    "服飾文化",
    "ファッション造形基礎",
    "ファッション造形",
    "ファッションデザイン",
    "服飾手芸",
    "フードデザイン",
    "食文化",
    "調理",
    "栄養",
    "食品",
    "食品衛生",
    "公衆衛生",
    "総合調理実習"
  ].map((name, i) => ({
    id: `hs-special-home-${String(i + 1).padStart(2, "0")}`,
    officialName: name,
    category: "家庭",
    subjectType: "specialized",
    standardCredits: null,
    requiredType: "unverified",
    aliases: []
  })),

  // 看護（13科目）
  ...[
    "基礎看護",
    "人体の構造と機能",
    "疾病の成り立ちと回復の促進",
    "健康支援と社会保障制度",
    "成人看護",
    "老年看護",
    "小児看護",
    "母性看護",
    "精神看護",
    "在宅看護",
    "看護の統合と実践",
    "看護臨地実習",
    "看護情報"
  ].map((name, i) => ({
    id: `hs-special-nursing-${String(i + 1).padStart(2, "0")}`,
    officialName: name,
    category: "看護",
    subjectType: "specialized",
    standardCredits: null,
    requiredType: "unverified",
    aliases: []
  })),

  // 情報（12科目）
  ...[
    "情報産業と社会",
    "課題研究",
    "情報の表現と管理",
    "情報テクノロジー",
    "情報セキュリティ",
    "情報システムのプログラミング",
    "ネットワークシステム",
    "データベース",
    "情報デザイン",
    "コンテンツの制作と発信",
    "メディアとサービス",
    "情報実習"
  ].map((name, i) => ({
    id: `hs-special-information-${String(i + 1).padStart(2, "0")}`,
    officialName: name,
    category: "情報",
    subjectType: "specialized",
    standardCredits: null,
    requiredType: "unverified",
    aliases: []
  })),

  // 福祉（9科目）
  ...[
    "社会福祉基礎",
    "介護福祉基礎",
    "コミュニケーション技術",
    "生活支援技術",
    "介護過程",
    "介護総合演習",
    "介護実習",
    "こころとからだの理解",
    "福祉情報"
  ].map((name, i) => ({
    id: `hs-special-welfare-${String(i + 1).padStart(2, "0")}`,
    officialName: name,
    category: "福祉",
    subjectType: "specialized",
    standardCredits: null,
    requiredType: "unverified",
    aliases: []
  }))
];

const allSubjectMaster = [
  ...juniorHighSubjectMaster,
  ...highSchoolCommonSubjectMaster,
  ...highSchoolSpecializedSubjectMaster,
  ...additionalSpecializedSubjects
];

// ========================================
// 専門教科：理数・体育・音楽・美術・英語
// 出典：文部科学省
// 高等学校学習指導要領（平成30年告示）
// ========================================

const finalSpecializedSubjects = [
  // 理数
  ...[
    "理数数学Ⅰ",
    "理数数学Ⅱ",
    "理数数学特論",
    "理数物理",
    "理数化学",
    "理数生物",
    "理数地学"
  ].map((name, i) => ({
    id: `hs-special-science-math-${String(i + 1).padStart(2, "0")}`,
    officialName: name,
    category: "理数",
    subjectType: "specialized",
    standardCredits: null,
    requiredType: "unverified",
    aliases: []
  })),

  // 体育
  ...[
    "スポーツ概論",
    "スポーツⅠ",
    "スポーツⅡ",
    "スポーツⅢ",
    "スポーツⅣ",
    "スポーツⅤ",
    "スポーツⅥ",
    "スポーツ総合演習"
  ].map((name, i) => ({
    id: `hs-special-physical-education-${String(i + 1).padStart(2, "0")}`,
    officialName: name,
    category: "体育（専門）",
    subjectType: "specialized",
    standardCredits: null,
    requiredType: "unverified",
    aliases: []
  })),

  // 音楽
  ...[
    "音楽理論",
    "音楽史",
    "演奏研究",
    "ソルフェージュ",
    "声楽",
    "器楽",
    "作曲",
    "鑑賞研究"
  ].map((name, i) => ({
    id: `hs-special-music-${String(i + 1).padStart(2, "0")}`,
    officialName: name,
    category: "音楽（専門）",
    subjectType: "specialized",
    standardCredits: null,
    requiredType: "unverified",
    aliases: []
  })),

  // 美術
  ...[
    "美術概論",
    "美術史",
    "鑑賞研究",
    "素描",
    "構成",
    "絵画",
    "版画",
    "彫刻",
    "ビジュアルデザイン",
    "クラフトデザイン",
    "情報メディアデザイン",
    "映像表現",
    "環境造形"
  ].map((name, i) => ({
    id: `hs-special-art-${String(i + 1).padStart(2, "0")}`,
    officialName: name,
    category: "美術（専門）",
    subjectType: "specialized",
    standardCredits: null,
    requiredType: "unverified",
    aliases: []
  })),

  // 英語
  ...[
    "総合英語Ⅰ",
    "総合英語Ⅱ",
    "総合英語Ⅲ",
    "ディベート・ディスカッションⅠ",
    "ディベート・ディスカッションⅡ",
    "エッセイライティングⅠ",
    "エッセイライティングⅡ"
  ].map((name, i) => ({
    id: `hs-special-english-${String(i + 1).padStart(2, "0")}`,
    officialName: name,
    category: "英語（専門）",
    subjectType: "specialized",
    standardCredits: null,
    requiredType: "unverified",
    aliases: []
  }))
];

// ========================================
// 科目マスター統合
// ========================================

const allSubjectMaster = [
  ...juniorHighSubjectMaster,
  ...highSchoolCommonSubjectMaster,
  ...highSchoolSpecializedSubjectMaster,
  ...additionalSpecializedSubjects,
  ...finalSpecializedSubjects
];
