
/*
 * 学校生活管理アプリ：科目マスター
 *
 * 参照資料：
 * 文部科学省「中学校学習指導要領」
 * 文部科学省「高等学校学習指導要領（平成30年告示）」
 *
 * 注意：
 * ・科目マスターと実際の履修条件は別管理
 * ・専門科目の単位数や必履修条件は学校の教育課程を確認する
 * ・このファイルは科目候補の初版
 */

// ========================================
// 共通のデータ作成関数
// ========================================

function createSubject(id, category, officialName, options = {}) {
  return {
    id,
    category,
    officialName,
    schoolLevel: options.schoolLevel || ["highSchool"],
    subjectType: options.subjectType || "specialized",
    standardCredits: options.standardCredits ?? null,
    requiredType: options.requiredType || "unverified",
    requiredGroup: options.requiredGroup || null,
    aliases: options.aliases || [],
    source: options.source || "文部科学省 学習指導要領",
    custom: false
  };
}

function createSubjectList(prefix, category, names, options = {}) {
  return names.map((name, index) =>
    createSubject(
      `${prefix}-${String(index + 1).padStart(3, "0")}`,
      category,
      name,
      options
    )
  );
}

// ========================================
// 中学校
// ========================================

const juniorHighSubjectMaster = [
  createSubject("jh-japanese", "国語", "国語", {
    schoolLevel: ["juniorHigh"],
    subjectType: "common"
  }),
  createSubject("jh-social-studies", "社会", "社会", {
    schoolLevel: ["juniorHigh"],
    subjectType: "common"
  }),
  createSubject("jh-math", "数学", "数学", {
    schoolLevel: ["juniorHigh"],
    subjectType: "common"
  }),
  createSubject("jh-science", "理科", "理科", {
    schoolLevel: ["juniorHigh"],
    subjectType: "common"
  }),
  createSubject("jh-music", "音楽", "音楽", {
    schoolLevel: ["juniorHigh"],
    subjectType: "common"
  }),
  createSubject("jh-art", "美術", "美術", {
    schoolLevel: ["juniorHigh"],
    subjectType: "common"
  }),
  createSubject(
    "jh-health-physical-education",
    "保健体育",
    "保健体育",
    { schoolLevel: ["juniorHigh"], subjectType: "common" }
  ),
  createSubject(
    "jh-technology-home-economics",
    "技術・家庭",
    "技術・家庭",
    { schoolLevel: ["juniorHigh"], subjectType: "common" }
  ),
  createSubject("jh-foreign-language", "外国語", "外国語", {
    schoolLevel: ["juniorHigh"],
    subjectType: "common"
  }),
  createSubject("jh-moral-education", "道徳", "道徳", {
    schoolLevel: ["juniorHigh"],
    subjectType: "special"
  }),
  createSubject(
    "jh-integrated-studies",
    "総合的な学習の時間",
    "総合的な学習の時間",
    { schoolLevel: ["juniorHigh"], subjectType: "special" }
  ),
  createSubject(
    "jh-special-activities",
    "特別活動",
    "特別活動",
    { schoolLevel: ["juniorHigh"], subjectType: "special" }
  )
];

// ========================================
// 高等学校・共通教科
// ========================================

const highSchoolCommonSubjectMaster = [
  // 国語
  ...[
    ["現代の国語", 2],
    ["言語文化", 2],
    ["論理国語", 4],
    ["文学国語", 4],
    ["国語表現", 4],
    ["古典探究", 4]
  ].map(([name, credits], i) =>
    createSubject(`hs-common-japanese-${i + 1}`, "国語", name, {
      standardCredits: credits,
      subjectType: "common",
      requiredGroup: i < 2 ? "japanese" : null
    })
  ),

  // 地理歴史
  ...[
    ["地理総合", 2],
    ["地理探究", 3],
    ["歴史総合", 2],
    ["日本史探究", 3],
    ["世界史探究", 3]
  ].map(([name, credits], i) =>
    createSubject(`hs-common-geography-history-${i + 1}`, "地理歴史", name, {
      standardCredits: credits,
      subjectType: "common",
      requiredGroup:
        name === "地理総合" || name === "歴史総合"
          ? "geographyHistory"
          : null
    })
  ),

  // 公民
  ...[
    ["公共", 2, "required"],
    ["倫理", 2, "unverified"],
    ["政治・経済", 2, "unverified"]
  ].map(([name, credits, requiredType], i) =>
    createSubject(`hs-common-civics-${i + 1}`, "公民", name, {
      standardCredits: credits,
      subjectType: "common",
      requiredType
    })
  ),

  // 数学
  ...[
    ["数学Ⅰ", 3, "required"],
    ["数学Ⅱ", 4, "unverified"],
    ["数学Ⅲ", 3, "unverified"],
    ["数学A", 2, "unverified"],
    ["数学B", 2, "unverified"],
    ["数学C", 2, "unverified"]
  ].map(([name, credits, requiredType], i) =>
    createSubject(`hs-common-math-${i + 1}`, "数学", name, {
      standardCredits: credits,
      subjectType: "common",
      requiredType
    })
  ),

  // 理科
  ...[
    ["科学と人間生活", 2],
    ["物理基礎", 2],
    ["物理", 4],
    ["化学基礎", 2],
    ["化学", 4],
    ["生物基礎", 2],
    ["生物", 4],
    ["地学基礎", 2],
    ["地学", 4]
  ].map(([name, credits], i) =>
    createSubject(`hs-common-science-${i + 1}`, "理科", name, {
      standardCredits: credits,
      subjectType: "common",
      requiredGroup:
        name === "科学と人間生活" ||
        name.endsWith("基礎")
          ? "science"
          : null
    })
  ),

  // 保健体育
  createSubject("hs-common-pe", "保健体育", "体育", {
    standardCredits: "7〜8",
    subjectType: "common",
    requiredType: "required"
  }),
  createSubject("hs-common-health", "保健体育", "保健", {
    standardCredits: 2,
    subjectType: "common",
    requiredType: "required"
  }),

  // 芸術
  ...["音楽", "美術", "工芸", "書道"].flatMap((category, i) =>
    [1, 2, 3].map((level) =>
      createSubject(
        `hs-common-arts-${i + 1}-${level}`,
        "芸術",
        `${category}${["Ⅰ", "Ⅱ", "Ⅲ"][level - 1]}`,
        {
          standardCredits: 2,
          subjectType: "common",
          requiredGroup: level === 1 ? "arts" : null
        }
      )
    )
  ),

  // 外国語
  ...[
    ["英語コミュニケーションⅠ", 3, "required"],
    ["英語コミュニケーションⅡ", 4, "unverified"],
    ["英語コミュニケーションⅢ", 4, "unverified"],
    ["論理・表現Ⅰ", 2, "unverified"],
    ["論理・表現Ⅱ", 2, "unverified"],
    ["論理・表現Ⅲ", 2, "unverified"]
  ].map(([name, credits, requiredType], i) =>
    createSubject(`hs-common-english-${i + 1}`, "外国語", name, {
      standardCredits: credits,
      subjectType: "common",
      requiredType
    })
  ),

  // 家庭
  createSubject("hs-common-home-basic", "家庭", "家庭基礎", {
    standardCredits: 2,
    subjectType: "common",
    requiredGroup: "homeEconomics"
  }),
  createSubject("hs-common-home-comprehensive", "家庭", "家庭総合", {
    standardCredits: 4,
    subjectType: "common",
    requiredGroup: "homeEconomics"
  }),

  // 情報
  createSubject("hs-common-information-1", "情報", "情報Ⅰ", {
    standardCredits: 2,
    subjectType: "common",
    requiredType: "required"
  }),
  createSubject("hs-common-information-2", "情報", "情報Ⅱ", {
    standardCredits: 2,
    subjectType: "common"
  }),

  // 理数
  createSubject(
    "hs-common-math-science-inquiry-basic",
    "理数",
    "理数探究基礎",
    { standardCredits: 1, subjectType: "common" }
  ),
  createSubject(
    "hs-common-math-science-inquiry",
    "理数",
    "理数探究",
    { standardCredits: "2〜5", subjectType: "common" }
  ),

  // 総合的な探究の時間
  createSubject(
    "hs-common-integrated-inquiry",
    "総合的な探究の時間",
    "総合的な探究の時間",
    {
      standardCredits: "3〜6",
      subjectType: "special",
      requiredType: "required"
    }
  )
];

// ========================================
// 高等学校・専門教科
// ※単位数・履修条件は学校ごとの確認が必要
// ========================================

const highSchoolSpecializedSubjectMaster = [
  // 農業
  ...createSubjectList("hs-agriculture", "農業", [
    "農業と環境", "課題研究", "総合実習", "農業と情報",
    "作物", "野菜", "果樹", "草花", "畜産",
    "栽培と環境", "飼育と環境", "農業経営", "農業機械",
    "植物バイオテクノロジー", "食品製造", "食品化学",
    "食品微生物", "食品流通", "森林科学", "森林経営",
    "林産物利用", "農業土木設計", "農業土木施工",
    "水循環", "造園計画", "造園施工管理", "造園植栽",
    "測量", "生物活用", "地域資源活用"
  ]),

  // 工業
  ...createSubjectList("hs-industry", "工業", [
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
  ]),

  // 商業
  ...createSubjectList("hs-commerce", "商業", [
    "ビジネス基礎", "課題研究", "総合実践",
    "ビジネス実務", "マーケティング", "商品開発",
    "広告と販売促進", "ビジネス経済",
    "ビジネス経済応用", "経済活動と法", "簿記",
    "財務会計Ⅰ", "財務会計Ⅱ", "原価計算",
    "管理会計", "情報処理", "ビジネス情報",
    "電子商取引", "プログラミング", "ビジネス情報管理"
  ]),

  // 水産
  ...createSubjectList("hs-fisheries", "水産", [
    "水産海洋基礎", "課題研究", "総合実習",
    "海洋情報技術", "水産海洋科学", "漁業",
    "航海・計器", "船舶運用", "船用機関",
    "機械設計工作", "電気理論", "移動体通信工学",
    "海洋通信技術", "資源増殖", "海洋生物",
    "海洋環境", "小型船舶", "食品製造",
    "食品管理", "水産流通", "ダイビング",
    "マリンスポーツ"
  ]),

  // 家庭（専門教科）
  ...createSubjectList("hs-home-special", "家庭（専門）", [
    "生活産業基礎", "課題研究", "生活産業情報",
    "消費生活", "保育基礎", "保育実践", "生活と福祉",
    "住生活デザイン", "服飾文化", "ファッション造形基礎",
    "ファッション造形", "ファッションデザイン", "服飾手芸",
    "フードデザイン", "食文化", "調理", "栄養",
    "食品", "食品衛生", "公衆衛生", "総合調理実習"
  ]),

  // 看護
  ...createSubjectList("hs-nursing", "看護", [
    "基礎看護", "人体の構造と機能",
    "疾病の成り立ちと回復の促進", "健康支援と社会保障制度",
    "成人看護", "老年看護", "小児看護", "母性看護",
    "精神看護", "在宅看護", "看護の統合と実践",
    "看護臨地実習", "看護情報"
  ]),

  // 情報（専門教科）
  ...createSubjectList("hs-information-special", "情報（専門）", [
    "情報産業と社会", "課題研究", "情報の表現と管理",
    "情報テクノロジー", "情報セキュリティ",
    "情報システムのプログラミング", "ネットワークシステム",
    "データベース", "情報デザイン", "コンテンツの制作と発信",
    "メディアとサービス", "情報実習"
  ]),

  // 福祉
  ...createSubjectList("hs-welfare", "福祉", [
    "社会福祉基礎", "介護福祉基礎", "コミュニケーション技術",
    "生活支援技術", "介護過程", "介護総合演習",
    "介護実習", "こころとからだの理解", "福祉情報"
  ]),

  // 理数（専門教科）
  ...createSubjectList("hs-science-math-special", "理数（専門）", [
    "理数数学Ⅰ", "理数数学Ⅱ", "理数数学特論",
    "理数物理", "理数化学", "理数生物", "理数地学"
  ]),

  // 体育（専門教科）
  ...createSubjectList("hs-physical-education-special", "体育（専門）", [
    "スポーツ概論", "スポーツⅠ", "スポーツⅡ",
    "スポーツⅢ", "スポーツⅣ", "スポーツⅤ",
    "スポーツⅥ", "スポーツ総合演習"
  ]),

  // 音楽（専門教科）
  ...createSubjectList("hs-music-special", "音楽（専門）", [
    "音楽理論", "音楽史", "演奏研究", "ソルフェージュ",
    "声楽", "器楽", "作曲", "鑑賞研究"
  ]),

  // 美術（専門教科）
  ...createSubjectList("hs-art-special", "美術（専門）", [
    "美術概論", "美術史", "鑑賞研究", "素描", "構成",
    "絵画", "版画", "彫刻", "ビジュアルデザイン",
    "クラフトデザイン", "情報メディアデザイン",
    "映像表現", "環境造形"
  ]),

  // 英語（専門教科）
  ...createSubjectList("hs-english-special", "英語（専門）", [
    "総合英語Ⅰ", "総合英語Ⅱ", "総合英語Ⅲ",
    "ディベート・ディスカッションⅠ",
    "ディベート・ディスカッションⅡ",
    "エッセイライティングⅠ",
    "エッセイライティングⅡ"
  ])
];

// ========================================
// 学校設定科目・利用者独自科目
// 既存の公式マスターとは分けて管理する
// ========================================

const schoolCustomSubjectMaster = [];

// ========================================
// 全科目マスター
// ※このファイル内で一度だけ宣言する
// ========================================

const allSubjectMaster = [
  ...juniorHighSubjectMaster,
  ...highSchoolCommonSubjectMaster,
  ...highSchoolSpecializedSubjectMaster,
  ...schoolCustomSubjectMaster
];

// ========================================
// 学校段階・区分ごとの取得
// ========================================

function getSubjectMasterForSchoolLevel(schoolLevel, options = {}) {
  if (schoolLevel === "juniorHigh") {
    return juniorHighSubjectMaster;
  }

  if (schoolLevel === "highSchool") {
    const includeSpecialized = options.includeSpecialized ?? true;

    return includeSpecialized
      ? [
          ...highSchoolCommonSubjectMaster,
          ...highSchoolSpecializedSubjectMaster
        ]
      : highSchoolCommonSubjectMaster;
  }

  return [];
}

// ========================================
// 教科カテゴリ一覧
// ========================================

function getSubjectCategories(schoolLevel, options = {}) {
  const subjects = getSubjectMasterForSchoolLevel(schoolLevel, options);

  return [...new Set(subjects.map(subject => subject.category))];
}

// ========================================
// IDで科目を検索
// ========================================

function findSubjectById(id) {
  return allSubjectMaster.find(subject => subject.id === id) || null;
}

// ========================================
// 科目名で検索
// 同名の科目が複数ある場合は複数返す
// ========================================

function findSubjectsByName(name, schoolLevel = null) {
  return allSubjectMaster.filter(subject => {
    const matchesName =
      subject.officialName === name ||
      subject.aliases.includes(name);

    const matchesLevel =
      schoolLevel === null ||
      subject.schoolLevel.includes(schoolLevel);

    return matchesName && matchesLevel;
  });
}

// ========================================
// マスターの検証
// 重複ID・必須項目の欠落を検出する
// ========================================

function validateSubjectMaster() {
  const errors = [];
  const seenIds = new Set();

  for (const subject of allSubjectMaster) {
    if (!subject.id) {
      errors.push("IDがない科目があります。");
    } else if (seenIds.has(subject.id)) {
      errors.push(`IDが重複しています: ${subject.id}`);
    }

    seenIds.add(subject.id);

    if (!subject.officialName) {
      errors.push(`正式名称がありません: ${subject.id}`);
    }

    if (!subject.category) {
      errors.push(`カテゴリがありません: ${subject.id}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    count: allSubjectMaster.length
  };
}

console.log("科目マスターの読み込み確認");
console.log(validateSubjectMaster());
console.log("中学校の科目数:", juniorHighSubjectMaster.length);
console.log("高校共通教科の科目数:", highSchoolCommonSubjectMaster.length);
console.log("高校専門教科の科目数:", highSchoolSpecializedSubjectMaster.length);
