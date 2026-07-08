// Data for advice mapping
const mistakeData = {
    "short_term": "「短期で大金狙い」はギャンブルになりがち。時間を味方につける複利効果を意識しましょう。",
    "panic_sell": "「暴落で狼狽売り」は一番の悪手です。相場は循環します。嵐が過ぎるのを待つ忍耐力を。",
    "ignore_cost": "「税金・手数料」は確実なマイナスリターンです。NISA等の非課税制度や低コスト商品を第一に。",
    "living_fund": "「生活資金で投資」は精神の安定を奪います。投資は必ず『最悪失っても生活できる余剰資金』で。",
    "debt": "「借金で投資」は絶対にNGです。レバレッジは諸刃の剣。現物取引から始めましょう。",
    "emotional": "「感情的売買」を防ぐにはルールが必要です。『毎月〇日に定額積立』など、感情の入る余地をなくしましょう。",
    "rumors": "「情報に流される」のはカモの証拠。自分が理解できないものには手を出さないのが鉄則です。",
    "concentration": "「一極集中」は成功すれば大きいですが、破綻のリスクも最大。卵は一つのカゴに盛らないこと。",
    "over_diversify": "「分散しすぎ」は管理不能のもと。自分が把握できる範囲（3〜5銘柄や、全世界株1本など）に絞りましょう。",
    "no_risk_understanding": "「リスク無理解」が最も危険です。リターンだけでなく、最大でどれくらい減る可能性があるかを確認しましたか？"
};

document.addEventListener('DOMContentLoaded', () => {
    const diagnoseBtn = document.getElementById('diagnoseBtn');
    const retryBtn = document.getElementById('retryBtn');
    const form = document.getElementById('checklistForm');
    const resultArea = document.getElementById('resultArea');
    const adviceContainer = document.getElementById('adviceContainer');
    const adviceList = document.getElementById('adviceList');

    // Result Elements
    const scoreCount = document.getElementById('scoreCount');
    const resultTitle = document.getElementById('resultTitle');
    const resultDesc = document.getElementById('resultDesc');

    diagnoseBtn.addEventListener('click', () => {
        // Gather checked items
        const checkboxes = form.querySelectorAll('input[name="mistake"]:checked');
        const checkedCount = checkboxes.length;
        const checkedValues = Array.from(checkboxes).map(cb => cb.value);

        // Calculate Result
        let title = "";
        let desc = "";
        let colorClass = ""; // For potential text coloring

        if (checkedCount === 0) {
            title = "🏆 投資体質：Sランク";
            desc = "素晴らしい！あなたは投資家としての資質が十分にあります。このまま規律を守って資産形成を続けましょう。";
        } else if (checkedCount <= 3) {
            title = "⚠️ 投資体質：Bランク（注意）";
            desc = "基本はできていますが、油断は禁物です。いくつかの悪い癖が資産形成の足を引っ張る可能性があります。";
        } else if (checkedCount <= 7) {
            title = "🚨 投資体質：Dランク（危険）";
            desc = "このままでは大きな損失を出す可能性が高いです。一度投資を休み、基礎知識を学び直すことを強くお勧めします。";
        } else {
            title = "💣 投資体質：ギャンブラー";
            desc = "あなたは今、投資ではなくギャンブルをしています。直ちにポジションを解消し、家計管理から見直してください。";
        }

        // Generate Specific Advice
        adviceList.innerHTML = "";
        if (checkedCount > 0) {
            checkedValues.forEach(val => {
                const adviceText = mistakeData[val];
                if (adviceText) {
                    const li = document.createElement('li');
                    li.textContent = adviceText;
                    adviceList.appendChild(li);
                }
            });
            adviceContainer.classList.remove('hidden');
        } else {
            adviceContainer.classList.add('hidden');
        }

        // Update DOM
        scoreCount.textContent = checkedCount;
        resultTitle.textContent = title;
        resultDesc.textContent = desc;

        // Visual Transition
        form.classList.add('hidden');
        resultArea.classList.remove('hidden');

        // Scroll to top of result
        resultArea.scrollIntoView({ behavior: 'smooth' });
    });

    retryBtn.addEventListener('click', () => {
        form.reset();
        resultArea.classList.add('hidden');
        form.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
