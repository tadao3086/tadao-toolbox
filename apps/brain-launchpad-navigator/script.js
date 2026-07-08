/**
 * Brain Launchpad Navigator v2 - Application Logic (Vanilla JS)
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. アプリケーションステート ---
  let state = {
    activeDayId: "day0",
    mode: "normal", // 'normal' または 'creative' (創作・マンガ特化)
    checkedTasks: {}, // id -> boolean
    drafts: {},       // dayId -> text (通常/特化を結合して管理またはキー分離)
    params: {
      theme: "",
      target: "",
      experience: "",
      strength: "",
      benefit: ""
    }
  };

  // デバウンス用タイマー
  let saveTimer = null;

  // --- 2. DOM要素の取得 ---
  const daysNavList = document.getElementById("days-nav-list");
  const tasksChecklist = document.getElementById("tasks-checklist");
  const promptsList = document.getElementById("prompts-list");
  const deliverablesList = document.getElementById("deliverables-list");
  
  // 共通パラメータ関連
  const paramTheme = document.getElementById("param-theme");
  const paramTarget = document.getElementById("param-target");
  const paramExperience = document.getElementById("param-experience");
  const paramStrength = document.getElementById("param-strength");
  const paramBenefit = document.getElementById("param-benefit");
  
  const labelParamTheme = document.getElementById("label-param-theme");
  const labelParamTarget = document.getElementById("label-param-target");
  const labelParamExperience = document.getElementById("label-param-experience");
  const labelParamStrength = document.getElementById("label-param-strength");
  const labelParamBenefit = document.getElementById("label-param-benefit");

  const parametersCard = document.getElementById("parameters-section");
  const parametersToggleBtn = document.getElementById("parameters-toggle-btn");
  const parametersToggleIcon = document.getElementById("parameters-toggle-icon");

  // モード・テーマ切り替え関連
  const modeToggle = document.getElementById("mode-toggle");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeIcon = document.getElementById("theme-icon");
  const themeText = document.getElementById("theme-text");
  const normalLabel = document.querySelector(".normal-label");
  const creativeLabel = document.querySelector(".creative-label");

  // Dayヘッダー関連
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
      const savedTasks = localStorage.getItem("bln2_checked_tasks");
      if (savedTasks) state.checkedTasks = JSON.parse(savedTasks);

      const savedDrafts = localStorage.getItem("bln2_drafts");
      if (savedDrafts) state.drafts = JSON.parse(savedDrafts);

      const savedParams = localStorage.getItem("bln2_params");
      if (savedParams) state.params = JSON.parse(savedParams);

      const savedActiveDay = localStorage.getItem("bln2_active_day");
      if (savedActiveDay) state.activeDayId = savedActiveDay;

      const savedMode = localStorage.getItem("bln2_mode");
      if (savedMode) state.mode = savedMode;
    } catch (e) {
      console.error("LocalStorage load error:", e);
    }
  }

  function saveTasks() {
    localStorage.setItem("bln2_checked_tasks", JSON.stringify(state.checkedTasks));
  }

  function saveDrafts() {
    localStorage.setItem("bln2_drafts", JSON.stringify(state.drafts));
  }

  function saveParams() {
    localStorage.setItem("bln2_params", JSON.stringify(state.params));
  }

  function saveActiveDay() {
    localStorage.setItem("bln2_active_day", state.activeDayId);
  }

  function saveMode() {
    localStorage.setItem("bln2_mode", state.mode);
  }

  // --- 4. パラメータ入力欄のプレースホルダー・ラベルの動的切替 ---
  const PARAM_TIPS = {
    normal: {
      labels: {
        theme: '<i class="fa-solid fa-lightbulb"></i> 発信テーマ / ジャンル',
        target: '<i class="fa-solid fa-bullseye"></i> 想定ターゲット読者',
        experience: '<i class="fa-solid fa-user-gear"></i> あなたの強み・実体験・失敗談',
        strength: '<i class="fa-solid fa-award"></i> 提供できる具体的な手順・成果物',
        benefit: '<i class="fa-solid fa-gift"></i> 読者が得られる最大の変化（ベネフィット）'
      },
      placeholders: {
        theme: "例: AIプロンプトを使った副業, Canvaでつくるサムネデザイン",
        target: "例: Brainを初出品したい副業初心者, デザインが苦手なママ",
        experience: "例: 過去に3回挫折したが4回目でAIを活用して商品化できた経験, Canvaを毎日使って1年など",
        strength: "例: 30日の投稿テンプレート, 審査通過の最終チェックシート",
        benefit: "例: 迷わず最初の1本を販売開始できる、作業時間を毎日30分削減できる"
      }
    },
    creative: {
      labels: {
        theme: '<i class="fa-solid fa-pen-nib"></i> 創作メソッド / テーマ',
        target: '<i class="fa-solid fa-users"></i> 想定ターゲット（クリエイター）',
        experience: '<i class="fa-solid fa-book-open"></i> あなたの創作経験・挫折・独自性',
        strength: '<i class="fa-solid fa-toolbox"></i> 配布するアセット（プロット、演出、監査）',
        benefit: '<i class="fa-solid fa-star"></i> クリエイターが得られる最大の変化'
      },
      placeholders: {
        theme: "例: 大バコ・中バコ・小バコ式マンガ構成シート",
        target: "例: ネームが面白くならずに悩んでいる同人作家やWEBマンガ家",
        experience: "例: ハコ書き構成法を用いた演出術, 読者の認知負荷コントロール法則, 私の失敗談",
        strength: "例: Show, Don't Tell演出変換カタログ, 脳科学ネームチェックシート",
        benefit: "例: 読者の没入感を最大化し、中だるみしないネームを最後まで作りきれる"
      }
    }
  };

  function updateParameterLabels() {
    const isCreative = state.mode === "creative";
    const tip = isCreative ? PARAM_TIPS.creative : PARAM_TIPS.normal;

    labelParamTheme.innerHTML = tip.labels.theme;
    labelParamTarget.innerHTML = tip.labels.target;
    labelParamExperience.innerHTML = tip.labels.experience;
    labelParamStrength.innerHTML = tip.labels.strength;
    labelParamBenefit.innerHTML = tip.labels.benefit;

    paramTheme.placeholder = tip.placeholders.theme;
    paramTarget.placeholder = tip.placeholders.target;
    paramExperience.placeholder = tip.placeholders.experience;
    paramStrength.placeholder = tip.placeholders.strength;
    paramBenefit.placeholder = tip.placeholders.benefit;
  }

  // --- 5. 進捗計算とインジケーターの描画 ---
  function updateProgress() {
    const allDays = BRAIN_LAUNCHPAD_DATA.days;
    let totalTasksCount = 0;
    let totalCompletedCount = 0;
    const isCreative = state.mode === "creative";

    allDays.forEach(day => {
      const dayTasks = isCreative ? day.tasks_creative : day.tasks_normal;
      let dayTotal = dayTasks.length;
      let dayCompleted = 0;

      dayTasks.forEach(task => {
        totalTasksCount++;
        if (state.checkedTasks[task.id]) {
          dayCompleted++;
          totalCompletedCount++;
        }
      });

      // 各Dayタブのバッジ更新
      const tabElement = document.querySelector(`[data-day-id="${day.id}"]`);
      if (tabElement) {
        const badge = tabElement.querySelector(".day-badge");
        if (badge) {
          badge.className = "day-badge"; // リセット
          if (dayCompleted === 0) {
            badge.classList.add("badge-pending");
            badge.textContent = "未着手";
          } else if (dayCompleted === dayTotal) {
            badge.classList.add("badge-completed");
            badge.textContent = "完了";
          } else {
            badge.classList.add("badge-working");
            badge.textContent = "進行中";
          }
        }
      }

      // 現在アクティブなDayの進捗バー更新
      if (day.id === state.activeDayId) {
        const dayPercent = dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;
        dayProgressBar.style.width = `${dayPercent}%`;
        dayProgressText.textContent = `${dayPercent}%`;
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

  // --- 6. プロンプト変数の置換ロジック ---
  function replacePromptTemplates(template) {
    let output = template;
    const isCreative = state.mode === "creative";
    const defaults = isCreative ? PARAM_TIPS.creative.placeholders : PARAM_TIPS.normal.placeholders;

    const placeholders = {
      theme: state.params.theme || `【${defaults.theme}】`,
      target: state.params.target || `【${defaults.target}】`,
      experience: state.params.experience || `【${defaults.experience}】`,
      strength: state.params.strength || `【${defaults.strength}】`,
      benefit: state.params.benefit || `【${defaults.benefit}】`
    };

    Object.keys(placeholders).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, "g");
      output = output.replace(regex, placeholders[key]);
    });

    return output;
  }

  // --- 7. UIのダイナミックレンダリング ---
  function renderDaysNavigation() {
    daysNavList.innerHTML = "";
    const isCreative = state.mode === "creative";

    BRAIN_LAUNCHPAD_DATA.days.forEach(day => {
      const li = document.createElement("li");
      li.className = `day-tab ${day.id === state.activeDayId ? 'active' : ''}`;
      li.setAttribute("data-day-id", day.id);

      const daySubtitle = isCreative ? day.subtitle_creative : day.subtitle_normal;

      li.innerHTML = `
        <div class="day-tab-info">
          <span class="day-tab-num">${day.title}</span>
          <span class="day-tab-title" title="${daySubtitle}">${daySubtitle}</span>
        </div>
        <span class="day-badge badge-pending">未着手</span>
      `;

      li.addEventListener("click", () => {
        document.querySelectorAll(".day-tab").forEach(tab => tab.classList.remove("active"));
        li.classList.add("active");
        switchActiveDay(day.id);
      });

      daysNavList.appendChild(li);
    });
  }

  function renderDayContent() {
    const day = BRAIN_LAUNCHPAD_DATA.days.find(d => d.id === state.activeDayId);
    if (!day) return;

    const isCreative = state.mode === "creative";
    const daySubtitle = isCreative ? day.subtitle_creative : day.subtitle_normal;
    const dayObjective = isCreative ? day.objective_creative : day.objective_normal;
    const dayTasks = isCreative ? day.tasks_creative : day.tasks_normal;
    const dayPrompts = isCreative ? day.prompts_creative : day.prompts_normal;
    const dayDeliverables = isCreative ? day.deliverables_creative : day.deliverables_normal;

    // ヘッダーの描画
    activeDayTitle.textContent = day.title;
    activeDaySubtitle.textContent = daySubtitle;
    activeDayObjective.textContent = dayObjective;

    // 1. タスクリストのレンダリング
    tasksChecklist.innerHTML = "";
    dayTasks.forEach(task => {
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

      // 行クリックイベント
      div.addEventListener("click", (e) => {
        if (e.target.tagName === "INPUT") return;
        const checkbox = div.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
        toggleTask(task.id, checkbox.checked, div);
      });

      // チェックボックス直接変更イベント
      const checkbox = div.querySelector('input[type="checkbox"]');
      checkbox.addEventListener("change", (e) => {
        toggleTask(task.id, e.target.checked, div);
      });

      tasksChecklist.appendChild(div);
    });

    // 2. プロンプトのレンダリング
    promptsList.innerHTML = "";
    dayPrompts.forEach((prompt) => {
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
    // ドラフトはモード（通常/創作）ごとにローカルストレージで管理
    const draftKey = `${state.activeDayId}_${state.mode}`;
    dayDraftTextarea.value = state.drafts[draftKey] || "";
    updateCharCount();

    // 4. 本日の完成目標のレンダリング
    deliverablesList.innerHTML = "";
    dayDeliverables.items.forEach(item => {
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

  // --- 8. アクションロジック ---
  function switchActiveDay(dayId) {
    state.activeDayId = dayId;
    saveActiveDay();
    renderDayContent();
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
    
    // 現在表示されているプロンプトをリアルタイム更新
    const day = BRAIN_LAUNCHPAD_DATA.days.find(d => d.id === state.activeDayId);
    if (day) {
      const dayPrompts = state.mode === "creative" ? day.prompts_creative : day.prompts_normal;
      dayPrompts.forEach(prompt => {
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

  // --- 9. イベントリスナーの設定 ---

  // 共通パラメータインプットのリアルタイム検知
  paramTheme.addEventListener("input", (e) => handleParamInput("theme", e.target.value));
  paramTarget.addEventListener("input", (e) => handleParamInput("target", e.target.value));
  paramExperience.addEventListener("input", (e) => handleParamInput("experience", e.target.value));
  paramStrength.addEventListener("input", (e) => handleParamInput("strength", e.target.value));
  paramBenefit.addEventListener("input", (e) => handleParamInput("benefit", e.target.value));

  // 成果物メモ（自動保存と保存ステータス表示）
  dayDraftTextarea.addEventListener("input", () => {
    updateCharCount();
    
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const draftKey = `${state.activeDayId}_${state.mode}`;
      state.drafts[draftKey] = dayDraftTextarea.value;
      saveDrafts();
      
      // 保存完了インジケーターをフェード表示
      savedIndicator.classList.add("show");
      setTimeout(() => {
        savedIndicator.classList.remove("show");
      }, 2000);
    }, 500);
  });

  // パラメータセクションのトグルの開閉
  parametersToggleBtn.addEventListener("click", () => {
    parametersCard.classList.toggle("collapsed");
  });

  // モードトグルスイッチのハンドリング
  modeToggle.addEventListener("change", (e) => {
    state.mode = e.target.checked ? "creative" : "normal";
    saveMode();

    if (state.mode === "creative") {
      document.body.classList.add("creative-mode");
      creativeLabel.classList.add("active");
      normalLabel.classList.remove("active");
    } else {
      document.body.classList.remove("creative-mode");
      creativeLabel.classList.remove("active");
      normalLabel.classList.add("active");
    }

    // プレースホルダーの更新、ナビ・コンテンツの再描画
    updateParameterLabels();
    renderDaysNavigation();
    renderDayContent();
  });

  // テーマ切り替え（ライト / ダーク）のイベント
  themeToggleBtn.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-mode");
    localStorage.setItem("bln2_theme", isLight ? "light" : "dark");
    
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

  // --- 10. アプリ起動時のデータ読み込みと初期描画 ---
  loadState();

  // テーマ（Light/Dark）の初期適用
  const savedTheme = localStorage.getItem("bln2_theme") || "dark";
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

  // モードトグルの初期適用
  if (state.mode === "creative") {
    modeToggle.checked = true;
    document.body.classList.add("creative-mode");
    creativeLabel.classList.add("active");
    normalLabel.classList.remove("active");
  } else {
    modeToggle.checked = false;
    document.body.classList.remove("creative-mode");
    creativeLabel.classList.remove("active");
    normalLabel.classList.add("active");
  }

  // 読み込んだパラメータをインプット欄に初期挿入
  paramTheme.value = state.params.theme || "";
  paramTarget.value = state.params.target || "";
  paramExperience.value = state.params.experience || "";
  paramStrength.value = state.params.strength || "";
  paramBenefit.value = state.params.benefit || "";

  // パラメータラベル、プレースホルダーの設定
  updateParameterLabels();

  // ナビゲーションおよびコンテンツの初回描画
  renderDaysNavigation();
  renderDayContent();
});
