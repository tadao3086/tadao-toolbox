/**
 * AI Image Asset Navigator - Application Logic (Vanilla JS)
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. アプリケーションステート ---
  let state = {
    activePhaseId: "phase1",
    checkedTasks: {}, // id -> boolean
    drafts: {},       // phaseId -> text
    params: {
      theme: "",
      target: "",
      style: "",
      character: "",
      aspect: "",
      benefit: ""
    }
  };

  // デバウンス用タイマー
  let saveTimer = null;

  // --- 2. DOM要素の取得 ---
  const daysNavList = document.getElementById("days-nav-list"); // フェーズタブ一覧
  const tasksChecklist = document.getElementById("tasks-checklist");
  const promptsList = document.getElementById("prompts-list");
  const deliverablesList = document.getElementById("deliverables-list");
  
  // 共通パラメータ関連
  const paramTheme = document.getElementById("param-theme");
  const paramTarget = document.getElementById("param-target");
  const paramStyle = document.getElementById("param-style");
  const paramCharacter = document.getElementById("param-character");
  const paramAspect = document.getElementById("param-aspect");
  const paramBenefit = document.getElementById("param-benefit");
  const parametersCard = document.getElementById("parameters-section");
  const parametersToggleBtn = document.getElementById("parameters-toggle-btn");
  const parametersToggleIcon = document.getElementById("parameters-toggle-icon");

  // テーマ切り替え（ライト/ダーク）関連
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeIcon = document.getElementById("theme-icon");
  const themeText = document.getElementById("theme-text");

  // Phaseヘッダー関連
  const activeDayTitle = document.getElementById("active-day-title");
  const activeDaySubtitle = document.getElementById("active-day-subtitle");
  const activeDayObjective = document.getElementById("active-day-objective");
  const dayProgressBar = document.getElementById("day-progress-bar");
  const dayProgressText = document.getElementById("day-progress-text");

  // 全体進捗関連
  const globalProgressBar = document.getElementById("global-progress-bar");
  const globalProgressText = document.getElementById("global-progress-text");
  const globalCircleProgress = document.getElementById("global-circle-progress");
  const globalCircleText = document.getElementById("global-circle-text");
  const globalStatsText = document.getElementById("global-stats-text");

  // ドラフト関連
  const dayDraftTextarea = document.getElementById("day-draft-textarea");
  const charCount = document.getElementById("char-count");
  const savedIndicator = document.getElementById("saved-indicator");

  // --- 3. ローカルストレージ同期処理 ---
  function loadState() {
    try {
      const savedTasks = localStorage.getItem("aian_checked_tasks");
      if (savedTasks) state.checkedTasks = JSON.parse(savedTasks);

      const savedDrafts = localStorage.getItem("aian_drafts");
      if (savedDrafts) state.drafts = JSON.parse(savedDrafts);

      const savedParams = localStorage.getItem("aian_params");
      if (savedParams) state.params = JSON.parse(savedParams);

      const savedActivePhase = localStorage.getItem("aian_active_phase");
      if (savedActivePhase) state.activePhaseId = savedActivePhase;
    } catch (e) {
      console.error("LocalStorage load error:", e);
    }
  }

  function saveTasks() {
    localStorage.setItem("aian_checked_tasks", JSON.stringify(state.checkedTasks));
  }

  function saveDrafts() {
    localStorage.setItem("aian_drafts", JSON.stringify(state.drafts));
  }

  function saveParams() {
    localStorage.setItem("aian_params", JSON.stringify(state.params));
  }

  function saveActivePhase() {
    localStorage.setItem("aian_active_phase", state.activePhaseId);
  }

  // --- 4. 進捗計算とインジケーターの描画 ---
  function updateProgress() {
    const allPhases = AI_IMAGE_ASSET_DATA.phases;
    let totalTasksCount = 0;
    let totalCompletedCount = 0;

    allPhases.forEach(phase => {
      let phaseTotal = phase.tasks.length;
      let phaseCompleted = 0;

      phase.tasks.forEach(task => {
        totalTasksCount++;
        if (state.checkedTasks[task.id]) {
          phaseCompleted++;
          totalCompletedCount++;
        }
      });

      // 各フェーズタブのバッジ更新
      const tabElement = document.querySelector(`[data-day-id="${phase.id}"]`);
      if (tabElement) {
        const badge = tabElement.querySelector(".day-badge");
        if (badge) {
          badge.className = "day-badge"; // リセット
          if (phaseCompleted === 0) {
            badge.classList.add("badge-pending");
            badge.textContent = "未着手";
          } else if (phaseCompleted === phaseTotal) {
            badge.classList.add("badge-completed");
            badge.textContent = "完了";
          } else {
            badge.classList.add("badge-working");
            badge.textContent = "進行中";
          }
        }
      }

      // 現在アクティブなPhaseの進捗バー更新
      if (phase.id === state.activePhaseId) {
        const phasePercent = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
        dayProgressBar.style.width = `${phasePercent}%`;
        dayProgressText.textContent = `${phasePercent}%`;
      }
    });

    // 全体進捗の計算
    const globalPercent = totalTasksCount > 0 ? Math.round((totalCompletedCount / totalTasksCount) * 100) : 0;

    // ヘッダーおよび円グラフ進捗バーの更新
    globalProgressBar.style.width = `${globalPercent}%`;
    globalProgressText.textContent = `${globalPercent}%`;
    globalCircleText.textContent = `${globalPercent}%`;
    globalStatsText.textContent = `${totalCompletedCount} / ${totalTasksCount} タスク完了`;

    // SVG Circular Progress のダッシュオフセット計算 (周長 = 2 * PI * r = 2 * 3.14159 * 60 ≈ 377)
    const strokeDashOffset = 377 - (377 * globalPercent) / 100;
    globalCircleProgress.style.strokeDashoffset = strokeDashOffset;
  }

  // --- 5. プロンプト変数の置換ロジック ---
  function replacePromptTemplates(template) {
    let output = template;
    
    const placeholders = {
      theme: state.params.theme || "【発信テーマ（例: 自作ビール紹介）】",
      target: state.params.target || "【ターゲット（例: ビール好きの会社員）】",
      style: state.params.style || "【世界観・トーン（例: 白背景、アニメイラスト、マットな質感）】",
      character: state.params.character || "【主役キャラクター・要素（例: ショートカットの女性）】",
      aspect: state.params.aspect || "【サイズ比率（例: 16:9）】",
      benefit: state.params.benefit || "【得られるベネフィット（例: ビールの魅力が直感的に伝わる）】"
    };

    Object.keys(placeholders).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, "g");
      output = output.replace(regex, placeholders[key]);
    });

    return output;
  }

  // --- 6. UIのダイナミックレンダリング ---
  function renderPhasesNavigation() {
    daysNavList.innerHTML = "";
    AI_IMAGE_ASSET_DATA.phases.forEach(phase => {
      const li = document.createElement("li");
      li.className = `day-tab ${phase.id === state.activePhaseId ? 'active' : ''}`;
      li.setAttribute("data-day-id", phase.id);

      li.innerHTML = `
        <div class="day-tab-info">
          <span class="day-tab-num">${phase.title}</span>
          <span class="day-tab-title">${phase.subtitle}</span>
        </div>
        <span class="day-badge badge-pending">未着手</span>
      `;

      li.addEventListener("click", () => {
        document.querySelectorAll(".day-tab").forEach(tab => tab.classList.remove("active"));
        li.classList.add("active");
        switchActivePhase(phase.id);
      });

      daysNavList.appendChild(li);
    });
  }

  function renderPhaseContent() {
    const phase = AI_IMAGE_ASSET_DATA.phases.find(p => p.id === state.activePhaseId);
    if (!phase) return;

    // ヘッダーの描画
    activeDayTitle.textContent = phase.title;
    activeDaySubtitle.textContent = phase.subtitle;
    activeDayObjective.textContent = phase.objective;

    // 1. タスクリストのレンダリング
    tasksChecklist.innerHTML = "";
    phase.tasks.forEach(task => {
      const isChecked = !!state.checkedTasks[task.id];
      const div = document.createElement("div");
      div.className = `task-item ${isChecked ? 'checked' : ''}`;
      div.innerHTML = `
        <label class="checkbox-wrapper">
          <input type="checkbox" data-task-id="${task.id}" ${isChecked ? 'checked' : ''}>
          <span class="custom-checkbox"></span>
        </label>
        <div class="task-content">
          <span class="task-title">${task.title}</span>
          <span class="task-desc">${task.desc}</span>
        </div>
      `;

      // クリックイベント
      div.addEventListener("click", (e) => {
        // チェックボックスそのものやそのラッパーをクリックした場合の二重発火を防止
        if (e.target.tagName === "INPUT") return;
        
        const checkbox = div.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
        toggleTask(task.id, checkbox.checked, div);
      });

      // チェックボックス直接の変更イベント
      const checkbox = div.querySelector('input[type="checkbox"]');
      checkbox.addEventListener("change", (e) => {
        toggleTask(task.id, e.target.checked, div);
      });

      tasksChecklist.appendChild(div);
    });

    // 2. プロンプトのレンダリング
    promptsList.innerHTML = "";
    phase.prompts.forEach((prompt, index) => {
      const displayPromptText = replacePromptTemplates(prompt.template);
      const div = document.createElement("div");
      div.className = "prompt-box";
      div.innerHTML = `
        <div class="prompt-meta">
          <div class="prompt-info">
            <h4>${prompt.title}</h4>
            <p>${prompt.desc}</p>
          </div>
          <button class="btn-copy" data-prompt-id="${prompt.id}"><i class="fa-solid fa-copy"></i> Copy Prompt</button>
        </div>
        <div class="prompt-content-wrapper">
          <pre class="prompt-content" id="prompt-text-${prompt.id}">${escapeHtml(displayPromptText)}</pre>
        </div>
      `;

      // コピーボタンのロジック
      const copyBtn = div.querySelector(".btn-copy");
      copyBtn.addEventListener("click", () => {
        const textToCopy = replacePromptTemplates(prompt.template);
        navigator.clipboard.writeText(textToCopy).then(() => {
          copyBtn.classList.add("copied");
          copyBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Copied! ✨`;
          setTimeout(() => {
            copyBtn.classList.remove("copied");
            copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy Prompt`;
          }, 2000);
        }).catch(err => {
          console.error("Copy failed:", err);
          alert("コピーに失敗しました。文章を選択して直接コピーしてください。");
        });
      });

      promptsList.appendChild(div);
    });

    // 3. 成果物ドラフトテキストエリアの設定
    dayDraftTextarea.value = state.drafts[state.activePhaseId] || "";
    updateCharCount();

    // 4. 本日の完成目標のレンダリング
    deliverablesList.innerHTML = "";
    phase.deliverables.items.forEach(item => {
      const li = document.createElement("li");
      li.className = "deliverable-item";
      li.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <span>${item}</span>
      `;
      deliverablesList.appendChild(li);
    });

    updateProgress();
  }

  // --- 7. アクションロジック ---
  function switchActivePhase(phaseId) {
    state.activePhaseId = phaseId;
    saveActivePhase();
    renderPhaseContent();
  }

  function toggleTask(taskId, isChecked, taskDiv) {
    state.checkedTasks[taskId] = isChecked;
    if (isChecked) {
      taskDiv.classList.add("checked");
    } else {
      taskDiv.classList.remove("checked");
    }
    saveTasks();
    updateProgress();
  }

  function handleParamInput(key, value) {
    state.params[key] = value;
    saveParams();
    
    // 現在のプロンプト表示をリアルタイム更新
    const phase = AI_IMAGE_ASSET_DATA.phases.find(p => p.id === state.activePhaseId);
    if (phase) {
      phase.prompts.forEach(prompt => {
        const pre = document.getElementById(`prompt-text-${prompt.id}`);
        if (pre) {
          pre.textContent = replacePromptTemplates(prompt.template);
        }
      });
    }
  }

  function updateCharCount() {
    const len = dayDraftTextarea.value.length;
    charCount.textContent = `${len.toLocaleString()} 文字`;
  }

  // HTMLエスケープ処理
  function escapeHtml(string) {
    if (typeof string !== "string") return string;
    return string
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- 8. イベントリスナーの設定 ---

  // 共通パラメータインプットのリアルタイム検知
  paramTheme.addEventListener("input", (e) => handleParamInput("theme", e.target.value));
  paramTarget.addEventListener("input", (e) => handleParamInput("target", e.target.value));
  paramStyle.addEventListener("input", (e) => handleParamInput("style", e.target.value));
  paramCharacter.addEventListener("input", (e) => handleParamInput("character", e.target.value));
  paramAspect.addEventListener("input", (e) => handleParamInput("aspect", e.target.value));
  paramBenefit.addEventListener("input", (e) => handleParamInput("benefit", e.target.value));

  // 成果物メモ（自動保存と保存ステータス表示）
  dayDraftTextarea.addEventListener("input", () => {
    updateCharCount();
    
    // タイピング停止後500msで自動保存
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      state.drafts[state.activePhaseId] = dayDraftTextarea.value;
      saveDrafts();
      
      // 保存完了インジケーターをアニメーション表示
      savedIndicator.classList.add("show");
      setTimeout(() => {
        savedIndicator.classList.remove("show");
      }, 2500);
    }, 500);
  });

  // パラメータセクションのトグルの開閉
  parametersToggleBtn.addEventListener("click", () => {
    parametersCard.classList.toggle("collapsed");
  });

  // テーマ切り替え（ライト / ダーク）のイベント
  themeToggleBtn.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-mode");
    localStorage.setItem("aian_theme", isLight ? "light" : "dark");
    
    // アイコンとテキストの切り替え
    if (isLight) {
      themeIcon.className = "fa-solid fa-moon";
      if (themeText) themeText.textContent = "Dark Mode";
      themeToggleBtn.title = "ダークモードに切り替え";
    } else {
      themeIcon.className = "fa-solid fa-sun";
      if (themeText) themeText.textContent = "Light Mode";
      themeToggleBtn.title = "ライトモードに切り替え";
    }
  });

  // --- 9. アプリ起動時のデータ読み込みと初期描画 ---
  loadState();

  // テーマ（Light/Dark）の初期適用
  const savedTheme = localStorage.getItem("aian_theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    themeIcon.className = "fa-solid fa-moon";
    if (themeText) themeText.textContent = "Dark Mode";
    themeToggleBtn.title = "ダークモードに切り替え";
  } else {
    document.body.classList.remove("light-mode");
    themeIcon.className = "fa-solid fa-sun";
    if (themeText) themeText.textContent = "Light Mode";
    themeToggleBtn.title = "ライトモードに切り替え";
  }

  // 読み込んだパラメータをインプット欄に初期挿入
  paramTheme.value = state.params.theme || "";
  paramTarget.value = state.params.target || "";
  paramStyle.value = state.params.style || "";
  paramCharacter.value = state.params.character || "";
  paramAspect.value = state.params.aspect || "";
  paramBenefit.value = state.params.benefit || "";

  // ナビゲーションおよびコンテンツの初回描画
  renderPhasesNavigation();
  renderPhaseContent();
});
