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
