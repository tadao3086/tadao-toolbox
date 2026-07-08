// タダオの道具箱 収蔵品リスト
// ここに1件足してpushすると、サイトに反映されます。
// type: prompt（プロンプト） / gas（GASコード） / webapp（Webアプリ） / manga（マンガ）
// url: 収蔵アプリは apps/ 以下の相対パス、外部サービスはフルURL
window.COLLECTION = [
  {
    id: 1,
    type: "prompt",
    title: "DAOちゃん基本プロンプト",
    description: "キャラクターの基本設定用。表情やポーズは後ろに足して使う",
    content: "1girl, dao-chan, short hair, smile, simple background",
    url: "",
    image_url: "",
    tags: "#DAOちゃん,#プロンプト",
    created_at: "2026-06-12"
  },
  {
    id: 2,
    type: "gas",
    title: "カレンダー→LINE通知",
    description: "Googleカレンダーの予定を家族のLINEに通知。Webhookは302問題があるためbroadcast APIを使うのが正解",
    content: "function notifyLine() { /* コード本文をここに */ }",
    url: "",
    image_url: "",
    tags: "#GAS,#LINE,#家族",
    created_at: "2026-06-12"
  },
  {
    id: 3,
    type: "webapp",
    title: "こしき号ツアーLP",
    description: "Koshikiブリュワリーのキッチンカー全国ツアー報告ページ",
    content: "",
    url: "https://tadao3086.github.io/koshiki-tour-report/",
    image_url: "",
    tags: "#Koshiki,#LP",
    created_at: "2026-06-12"
  },
  {
    id: 7,
    type: "webapp",
    title: "モンスター纏いスタジオ",
    description: "モンスター24体を「纏う」キャラクターの画像生成プロンプトを作れるスタジオ。マンガ『主夫、モンスターを纏う』の世界観ツール",
    content: "",
    url: "apps/monster-matoi-studio/index.html",
    image_url: "",
    tags: "#アプリ,#プロンプト生成,#AIマンガ",
    created_at: "2026-07-08"
  },
  {
    id: 8,
    type: "webapp",
    title: "マンガタクティクス",
    description: "マンガ制作の24スキルをクイズとバトルで学ぶ、FFT風タクティクスゲーム",
    content: "",
    url: "apps/manga-skill-rpg/index.html",
    image_url: "",
    tags: "#アプリ,#ゲーム,#マンガ制作",
    created_at: "2026-07-08"
  },
  {
    id: 9,
    type: "webapp",
    title: "マンガプロンプト発射台",
    description: "画風・演出プロンプトをワンクリックでコピーできる発射台（合体版）",
    content: "",
    url: "apps/manga-prompt-launcher/index.html",
    image_url: "",
    tags: "#アプリ,#プロンプト,#AIマンガ",
    created_at: "2026-07-08"
  },
  {
    id: 10,
    type: "webapp",
    title: "画像レシピ セルフチェック",
    description: "画像生成のレシピを自分で点検できるセルフチェックツール",
    content: "",
    url: "apps/image-recipe/index.html",
    image_url: "",
    tags: "#アプリ,#画像生成",
    created_at: "2026-07-08"
  },
  {
    id: 11,
    type: "webapp",
    title: "Brain Launchpad Navigator v2",
    description: "AIを活用して最初のBrainコンテンツを7日間で販売開始するための実践ロードマップ。通常ビジネス向けと「創作・マンガ特化」を切り替えられるモードスイッチつき",
    content: "",
    url: "apps/brain-launchpad-navigator/index.html",
    image_url: "",
    tags: "#アプリ,#Brain,#ロードマップ",
    created_at: "2026-07-08"
  },
  {
    id: 12,
    type: "webapp",
    title: "AI Image Asset Navigator",
    description: "AI画像を「作って楽しむもの」から「使って価値を生む資産」に変える30日間ロードマップの進捗と、作成アセットを管理するダッシュボード",
    content: "",
    url: "apps/ai-image-asset-navigator/index.html",
    image_url: "",
    tags: "#アプリ,#AI画像,#ロードマップ",
    created_at: "2026-07-08"
  },
  {
    id: 13,
    type: "webapp",
    title: "投資初心者「やってはいけない」チェックリスト",
    description: "投資初心者が避けるべき10の失敗パターンをチェックすると、投資体質を自動診断して改善アクションを提示するシミュレーター",
    content: "",
    url: "apps/investment-checklist/index.html",
    image_url: "",
    tags: "#アプリ,#投資,#チェックリスト",
    created_at: "2026-07-08"
  }
];
