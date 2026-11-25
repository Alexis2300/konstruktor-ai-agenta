export const CONSULTATION_URL = 'https://t.me/m/T-E7DyClNGYy';
export const VK_URL = 'https://vk.ru/alexgass';

export const ROLES = [
  {
    id: 'sales',
    name: 'Нейропродавец',
    description: 'Отвечает на частые вопросы, уточняет потребность и замечает готовых к покупке клиентов.',
    tasks: ['Отвечать на вопросы о цене и составе продукта', 'Уточнять задачу потенциального клиента', 'Передавать готового к покупке клиента человеку'],
    skills: ['Диалог с клиентом', 'Квалификация обращения', 'Работа с базой знаний'],
    result: { purpose: 'помогать потенциальным клиентам получить точный ответ и выбрать следующий шаг' },
  },
  {
    id: 'content',
    name: 'Контент-агент',
    description: 'Помогает превращать идеи и материалы эксперта в понятный регулярный контент.',
    tasks: ['Составлять контент-план', 'Готовить черновики постов', 'Адаптировать одну мысль под разные форматы'],
    skills: ['Редактура', 'Планирование контента', 'Адаптация тона'],
    result: { purpose: 'ускорять подготовку полезного контента без потери смысла' },
  },
  {
    id: 'assistant',
    name: 'Бизнес-ассистент',
    description: 'Собирает задачи, готовит черновики и помогает держать рабочие дела в порядке.',
    tasks: ['Собирать список задач из заметок', 'Готовить проекты писем и документов', 'Напоминать о следующих шагах'],
    skills: ['Организация задач', 'Деловая переписка', 'Краткие сводки'],
    result: { purpose: 'снимать повторяющуюся организационную нагрузку' },
  },
  {
    id: 'research',
    name: 'Исследователь',
    description: 'Собирает информацию, сравнивает варианты и оформляет выводы для решения.',
    tasks: ['Собирать данные по теме', 'Сравнивать предложения и подходы', 'Готовить краткий отчёт с выводами'],
    skills: ['Поиск источников', 'Сравнительный анализ', 'Проверка фактов'],
    result: { purpose: 'быстро превращать разрозненную информацию в понятные выводы' },
  },
  {
    id: 'coordinator',
    name: 'Координатор',
    description: 'Следит за этапами, ответственными и сроками в повторяющихся процессах.',
    tasks: ['Раскладывать процесс на этапы', 'Готовить статусы по задачам', 'Находить задержки и следующие действия'],
    skills: ['Координация процессов', 'Контроль сроков', 'Статус-отчёты'],
    result: { purpose: 'делать ход работы прозрачным для владельца и команды' },
  },
  {
    id: 'support',
    name: 'Поддержка',
    description: 'Помогает пользователям находить ответы, материалы и понятные инструкции.',
    tasks: ['Отвечать на частые вопросы', 'Объяснять, где найти материалы', 'Передавать нестандартные случаи специалисту'],
    skills: ['База знаний', 'Пошаговые инструкции', 'Передача сложных случаев'],
    result: { purpose: 'давать быстрые и понятные ответы на типовые обращения' },
  },
];

export const PLATFORMS = [
  { id: 'codex', name: 'Codex', filename: 'AGENTS.md' },
  { id: 'claude', name: 'Claude Code', filename: 'CLAUDE.md' },
  { id: 'chat', name: 'Обычный AI-чат', filename: 'AI-CHAT-INSTRUCTION.md' },
];

export function createInitialState() {
  return {
    currentStep: 1,
    roleId: '',
    taskIds: [],
    customTasks: '',
    project: '',
    audience: '',
    product: '',
    commonQuestions: '',
    platform: '',
    mode: 'project',
    autonomy: 'drafts',
    forbidden: '',
    outputFormat: 'structured',
    detail: 'balanced',
  };
}

export function validateStep(step, state) {
  const errors = {};
  if (step === 1 && !state.roleId) {
    errors.roleId = 'Выберите роль будущего агента.';
  }
  if (step === 2 && state.taskIds.length === 0 && !state.customTasks.trim()) {
    errors.taskIds = 'Выберите хотя бы одну задачу или добавьте свою.';
  }
  if (step === 3) {
    if (!state.project.trim()) errors.project = 'Коротко опишите проект или напишите его название.';
    if (!state.audience.trim()) errors.audience = 'Укажите, кому помогает ваш проект.';
  }
  if (step === 4 && !state.platform) {
    errors.platform = 'Выберите, где будет работать агент.';
  }
  return errors;
}

function clean(value) {
  return String(value ?? '').trim();
}

function listFromText(value) {
  return clean(value)
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function selectedTasks(role, state) {
  const standard = state.taskIds
    .map((index) => role.tasks[Number(index)])
    .filter(Boolean);
  return [...new Set([...standard, ...listFromText(state.customTasks)])];
}

function taskExamples(role, chosen) {
  const general = [
    `Подготовь понятный план работы по задаче «${chosen[0] ?? role.tasks[0]}».`,
    'Сначала перечисли, каких данных не хватает для точного ответа.',
    'Предложи следующий безопасный шаг и объясни его простыми словами.',
    'Проверь результат на неточности и отдельно отметь предположения.',
    'Сделай краткую версию результата для быстрого просмотра.',
    'Составь шаблон, который можно использовать для похожих обращений.',
    'Отдели действия, которые можно выполнить самостоятельно, от действий, где нужно разрешение.',
  ];
  return [...new Set([...chosen, ...role.tasks, ...general])].slice(0, 10);
}

function platformInstruction(platform, body, skillRules) {
  if (platform.id === 'chat') {
    return `# Единая инструкция для AI-чата\n\nСкопируйте весь текст ниже в новый чат.\n\n${body}\n\n## Дополнительные правила\n${skillRules}`;
  }
  return `# ${platform.filename}\n\nРабочая среда: ${platform.name}.\n\n${body}\n\n## Подключаемые навыки\nХраните подробные повторяемые правила в отдельных файлах SKILL.md.`;
}

export function buildResult(state) {
  const role = ROLES.find((item) => item.id === state.roleId) ?? ROLES[0];
  const platform = PLATFORMS.find((item) => item.id === state.platform) ?? PLATFORMS[0];
  const chosen = selectedTasks(role, state);
  const project = clean(state.project) || 'ваш проект';
  const audience = clean(state.audience) || 'люди, которым помогает проект';
  const productLine = clean(state.product)
    ? `Продукт или услуга: ${clean(state.product)}.`
    : 'Используй только те сведения о продукте или услуге, которые передал пользователь.';
  const questionLine = clean(state.commonQuestions)
    ? `Типичные обращения: ${clean(state.commonQuestions)}.`
    : 'Не придумывай вопросы клиентов: опирайся на реальные обращения, если они будут переданы.';
  const detailLine = state.detail === 'short'
    ? 'Отвечай коротко: только результат и один следующий шаг.'
    : state.detail === 'deep'
      ? 'Показывай ход работы, важные допущения и проверку результата.'
      : 'Давай достаточно пояснений, чтобы результат можно было сразу применить.';
  const autonomy = state.autonomy === 'actions'
    ? 'Можно выполнять согласованные безопасные действия в пределах переданных материалов.'
    : state.autonomy === 'advice'
      ? 'Давай рекомендации, но не выполняй действия от имени пользователя.'
      : 'Готовь черновики и варианты. Перед внешним действием всегда проси подтверждение.';
  const baseSafety = 'Не публикуй, не оплачивай, не удаляй данные и не связывайся с людьми без явного разрешения.';
  const forbidden = clean(state.forbidden)
    ? `${baseSafety}\nДополнительный запрет: ${clean(state.forbidden)}.`
    : baseSafety;
  const taskLines = (chosen.length ? chosen : role.tasks.slice(0, 1)).map((task) => `- ${task}`).join('\n');
  const skillRules = role.skills.map((skill) => `- ${skill}: объясняй ход работы и проверяй результат перед выдачей.`).join('\n');

  const body = `## Роль\nТы — ${role.name.toLowerCase()} для проекта «${project}». Твоя цель — ${role.result.purpose}.\n\n## Для кого работаешь\nОсновная аудитория: ${audience}.\n${productLine}\n${questionLine}\n\n## Основные задачи\n${taskLines}\n\n## Порядок работы\n1. Пойми запрос и проверь, достаточно ли исходных данных.\n2. Если важной информации не хватает, задай короткие уточняющие вопросы.\n3. Выполни задачу по шагам и не выдавай предположения за факты.\n4. Покажи результат в ${state.outputFormat === 'brief' ? 'кратком' : state.outputFormat === 'table' ? 'табличном, где это уместно' : 'структурированном'} виде. ${detailLine}\n5. В конце назови один понятный следующий шаг.\n\n## Границы\n${autonomy}\n${forbidden}`;

  const examples = taskExamples(role, chosen);
  const materials = [
    '# Материалы для агента',
    '',
    '- Описание продукта или услуги — если есть.',
    '- Актуальные ответы на частые вопросы — при наличии.',
    '- Примеры хороших ответов, документов или публикаций — если есть.',
    '- Правила тона общения и слова, которых лучше избегать.',
    '- Контакты человека, которому передавать сложные случаи — при необходимости.',
    '',
    'Не добавляйте секретные данные, пароли и платёжную информацию.',
  ].join('\n');

  const skillName = `agent-${role.id}`;
  const skills = platform.id === 'chat'
    ? `# Дополнительные правила агента\n\nДля обычного чата эти правила уже можно вставить в общую инструкцию:\n\n${skillRules}`
    : `---\nname: ${skillName}\ndescription: Используйте, когда запрос относится к задачам агента «${role.name}».\n---\n\n# SKILL.md — рабочий навык «${role.name}»\n\n## Когда использовать\nКогда запрос относится к выбранным задачам агента.\n\n## Как работать\n${skillRules}\n\n## Проверка качества\n- Факты отделены от предположений.\n- Следующий шаг понятен человеку без технического опыта.\n- Внешние действия не выполняются без разрешения.`;

  const setup = platform.id === 'codex'
    ? `# Подключение в Codex\n\n1. Скачайте AGENTS.md и положите его в папку проекта.\n2. Сохраните навык по пути .agents/skills/${skillName}/SKILL.md внутри проекта.\n3. Откройте проект в Codex и дайте одну из стартовых команд ниже.`
    : platform.id === 'claude'
      ? `# Подключение в Claude Code\n\n1. Скачайте CLAUDE.md и положите его в папку проекта.\n2. Сохраните навык по пути .claude/skills/${skillName}/SKILL.md внутри проекта.\n3. Откройте проект в Claude Code и начните со стартовой команды.`
      : '# Подключение в обычном AI-чате\n\n1. Скачайте или скопируйте единую инструкцию.\n2. Вставьте её первым сообщением в новый чат.\n3. Добавьте реальные материалы проекта и используйте стартовую команду.';

  const instruction = platformInstruction(platform, body, skillRules);
  const tasks = `# 10 задач для первого запуска\n\n${examples.map((task, index) => `${index + 1}. ${task}`).join('\n')}`;
  const commands = `# Первые команды\n\n- «Изучи инструкцию и коротко скажи, как ты понял свою роль».\n- «Каких материалов тебе не хватает для точной работы?»\n- «Начни с задачи: ${chosen[0] ?? role.tasks[0]}».\n- «Покажи черновик результата, не выполняя внешних действий».`;
  const all = [
    `# Комплект агента «${role.name}»`,
    `## ${platform.filename}\n\n${instruction}`,
    platform.id === 'chat' ? '' : `## SKILL.md\n\n${skills}`,
    materials,
    tasks,
    commands,
    setup,
  ].filter(Boolean).join('\n\n---\n\n');

  return {
    passport: `# Паспорт агента\n\n- Роль: ${role.name}\n- Проект: ${project}\n- Аудитория: ${audience}\n- Среда: ${platform.name}\n- Режим: ${state.mode === 'once' ? 'разовая задача' : state.mode === 'routine' ? 'повторяемый процесс' : 'работа с проектом'}\n- Выбрано задач: ${chosen.length}`,
    instruction,
    skills,
    materials,
    tasks,
    commands,
    setup,
    all,
    instructionFilename: platform.filename,
  };
}

export const STEPS = [
  { id: 1, label: 'Роль', short: 'Кого создаём' },
  { id: 2, label: 'Задачи', short: 'Что поручить' },
  { id: 3, label: 'Контекст', short: 'О вашем проекте' },
  { id: 4, label: 'Среда работы', short: 'Где запускать' },
  { id: 5, label: 'Границы', short: 'Что разрешено' },
  { id: 6, label: 'Результат', short: 'Как отвечать' },
];

const STORAGE_KEY = 'alexander-gass-agent-builder-v1';
const RESULT_TABS = [
  { id: 'instruction', label: 'Инструкция' },
  { id: 'skills', label: 'Навыки' },
  { id: 'materials', label: 'Материалы' },
  { id: 'tasks', label: '10 задач' },
  { id: 'commands', label: 'Первые команды' },
  { id: 'setup', label: 'Подключение' },
];

let state = createInitialState();
let activeResultTab = 'instruction';
let toastTimer;

function escapeHTML(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isChecked(value, current) {
  return value === current ? 'checked' : '';
}

export function saveState(nextState = state) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    showToast('Не удалось сохранить ответы в браузере.');
  }
}

export function loadState() {
  if (typeof localStorage === 'undefined') return createInitialState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return createInitialState();
    const initial = createInitialState();
    return {
      ...initial,
      ...saved,
      currentStep: Math.min(6, Math.max(1, Number(saved.currentStep) || 1)),
      taskIds: Array.isArray(saved.taskIds) ? saved.taskIds.map(Number).filter(Number.isInteger) : [],
    };
  } catch {
    return createInitialState();
  }
}

function heading(title, description) {
  return `<div class="step-heading"><h2>${title}</h2><p>${description}</p></div>`;
}

function errorTarget(name) {
  return `<p class="field-error" data-error-for="${name}" id="error-${name}"></p>`;
}

function actions({ back = true, finish = false } = {}) {
  return `<div class="step-actions">
    ${back ? '<button class="button button-ghost" type="button" data-action="back">Назад</button>' : '<span></span>'}
    <button class="button button-primary action-end" type="button" data-action="next">${finish ? 'Собрать моего агента' : 'Продолжить'}</button>
  </div>`;
}

function renderRoleStep() {
  return `<div class="step-panel">
    ${heading('Выберите роль агента', 'Начните с одной понятной роли. Позже инструкцию можно будет изменить или собрать ещё одного агента.')}
    <fieldset class="field" data-error-target="roleId" aria-describedby="error-roleId">
      <legend class="visually-hidden">Роль агента</legend>
      <div class="choice-grid">
        ${ROLES.map((role, index) => `<label class="role-choice">
          <input type="radio" name="role" value="${role.id}" data-field="roleId" ${isChecked(role.id, state.roleId)}>
          <div class="role-card">
            <span class="choice-index">${String(index + 1).padStart(2, '0')}</span>
            <h3>${role.name}</h3>
            <p>${role.description}</p>
          </div>
        </label>`).join('')}
      </div>
      ${errorTarget('roleId')}
    </fieldset>
    ${actions({ back: false })}
  </div>`;
}

function renderTaskStep() {
  const role = ROLES.find((item) => item.id === state.roleId) ?? ROLES[0];
  return `<div class="step-panel">
    ${heading(`Что поручить роли «${role.name}»`, 'Отметьте повторяющиеся задачи. Можно выбрать несколько вариантов и добавить собственные.')}
    <fieldset class="field" data-error-target="taskIds" aria-describedby="error-taskIds">
      <legend>Типовые задачи</legend>
      <div class="task-list">
        ${role.tasks.map((task, index) => `<label class="task-item">
          <input type="checkbox" value="${index}" data-field="taskIds" ${state.taskIds.includes(index) ? 'checked' : ''}>
          <span>${task}</span>
        </label>`).join('')}
      </div>
      ${errorTarget('taskIds')}
    </fieldset>
    <div class="field">
      <label for="customTasks">Свои задачи <span class="field-hint">Необязательно</span></label>
      <textarea id="customTasks" data-field="customTasks" placeholder="Например: каждую пятницу собирать итоги недели">${escapeHTML(state.customTasks)}</textarea>
      <span class="field-hint">Каждую новую задачу пишите с новой строки.</span>
    </div>
    ${actions()}
  </div>`;
}

function renderContextStep() {
  return `<div class="step-panel">
    ${heading('Дайте агенту контекст', 'Достаточно нескольких простых фраз. Агент будет опираться на них и не станет придумывать недостающие факты.')}
    <div class="field-row">
      <div class="field" data-error-target="project">
        <label for="project">Проект или направление</label>
        <input id="project" type="text" data-field="project" value="${escapeHTML(state.project)}" placeholder="Например: онлайн-школа для руководителей" aria-describedby="error-project">
        ${errorTarget('project')}
      </div>
      <div class="field" data-error-target="audience">
        <label for="audience">Кому вы помогаете</label>
        <input id="audience" type="text" data-field="audience" value="${escapeHTML(state.audience)}" placeholder="Например: владельцам небольших команд" aria-describedby="error-audience">
        ${errorTarget('audience')}
      </div>
    </div>
    <div class="field">
      <label for="product">Продукт или услуга <span class="field-hint">Необязательно</span></label>
      <textarea id="product" data-field="product" placeholder="Что вы предлагаете и какую задачу это решает">${escapeHTML(state.product)}</textarea>
    </div>
    <div class="field">
      <label for="commonQuestions">Частые вопросы или обращения <span class="field-hint">Необязательно</span></label>
      <textarea id="commonQuestions" data-field="commonQuestions" placeholder="Например: сколько стоит, что входит, где скачать материалы">${escapeHTML(state.commonQuestions)}</textarea>
    </div>
    ${actions()}
  </div>`;
}

function renderPlatformStep() {
  const platformDescriptions = {
    codex: 'Для работы с файлами и проектом на компьютере.',
    claude: 'Для проекта с инструкцией CLAUDE.md.',
    chat: 'Одна инструкция, которую можно вставить в новый чат.',
  };
  const modes = [
    { id: 'once', name: 'Разовая задача', description: 'Агент получает одну задачу и отдаёт результат.' },
    { id: 'project', name: 'Работа с проектом', description: 'Агент знает общий контекст и помогает по запросу.' },
    { id: 'routine', name: 'Повторяемый процесс', description: 'Одинаковая последовательность действий запускается регулярно.' },
  ];
  return `<div class="step-panel">
    ${heading('Где будет работать агент', 'Выберите привычную среду. Конструктор подготовит подходящий файл или единую инструкцию для чата.')}
    <fieldset class="field" data-error-target="platform" aria-describedby="error-platform">
      <legend>Среда работы</legend>
      <div class="choice-grid three">
        ${PLATFORMS.map((platform) => `<label class="choice">
          <input type="radio" name="platform" value="${platform.id}" data-field="platform" ${isChecked(platform.id, state.platform)}>
          <div class="choice-card"><h3>${platform.name}</h3><p>${platformDescriptions[platform.id]}</p></div>
        </label>`).join('')}
      </div>
      ${errorTarget('platform')}
    </fieldset>
    <fieldset class="field">
      <legend>Как часто он нужен</legend>
      <div class="choice-grid three">
        ${modes.map((mode) => `<label class="choice">
          <input type="radio" name="mode" value="${mode.id}" data-field="mode" ${isChecked(mode.id, state.mode)}>
          <div class="choice-card"><h3>${mode.name}</h3><p>${mode.description}</p></div>
        </label>`).join('')}
      </div>
    </fieldset>
    ${actions()}
  </div>`;
}

function renderBoundariesStep() {
  const options = [
    { id: 'drafts', name: 'Только черновики', description: 'Готовит варианты и спрашивает перед любым внешним действием.' },
    { id: 'advice', name: 'Рекомендации', description: 'Предлагает решения, но ничего не делает от вашего имени.' },
    { id: 'actions', name: 'Согласованные действия', description: 'Выполняет только заранее разрешённые безопасные действия.' },
  ];
  return `<div class="step-panel">
    ${heading('Установите безопасные границы', 'Хороший агент знает не только свою задачу, но и момент, когда нужно остановиться и спросить разрешение.')}
    <fieldset class="field">
      <legend>Самостоятельность</legend>
      <div class="choice-grid three">
        ${options.map((option) => `<label class="choice">
          <input type="radio" name="autonomy" value="${option.id}" data-field="autonomy" ${isChecked(option.id, state.autonomy)}>
          <div class="choice-card"><h3>${option.name}</h3><p>${option.description}</p></div>
        </label>`).join('')}
      </div>
    </fieldset>
    <div class="field">
      <label for="forbidden">Что ему точно нельзя делать <span class="field-hint">Необязательно</span></label>
      <textarea id="forbidden" data-field="forbidden" placeholder="Например: называть цену без актуального прайса или публиковать материалы без проверки">${escapeHTML(state.forbidden)}</textarea>
      <span class="field-hint">Базовый запрет на оплату, публикацию, удаление и связь с людьми без разрешения добавится автоматически.</span>
    </div>
    ${actions()}
  </div>`;
}

function renderOutputStep() {
  const formats = [
    { id: 'structured', name: 'Структурировано', description: 'Заголовки, шаги и понятный следующий ход.' },
    { id: 'brief', name: 'Кратко', description: 'Только главное без длинных пояснений.' },
    { id: 'table', name: 'Таблица, где уместно', description: 'Сравнения и статусы в компактном виде.' },
  ];
  const details = [
    { id: 'short', name: 'Минимально', description: 'Быстрый ответ и следующий шаг.' },
    { id: 'balanced', name: 'С пояснениями', description: 'Достаточно деталей, чтобы сразу применить.' },
    { id: 'deep', name: 'Подробно', description: 'Ход работы, допущения и проверка результата.' },
  ];
  return `<div class="step-panel">
    ${heading('Выберите вид ответа', 'Последний шаг. Настройте, как агент будет оформлять результат — саму инструкцию вы получите сразу после этого.')}
    <fieldset class="field">
      <legend>Формат</legend>
      <div class="choice-grid three">
        ${formats.map((option) => `<label class="choice">
          <input type="radio" name="outputFormat" value="${option.id}" data-field="outputFormat" ${isChecked(option.id, state.outputFormat)}>
          <div class="choice-card"><h3>${option.name}</h3><p>${option.description}</p></div>
        </label>`).join('')}
      </div>
    </fieldset>
    <fieldset class="field">
      <legend>Подробность</legend>
      <div class="choice-grid three">
        ${details.map((option) => `<label class="choice">
          <input type="radio" name="detail" value="${option.id}" data-field="detail" ${isChecked(option.id, state.detail)}>
          <div class="choice-card"><h3>${option.name}</h3><p>${option.description}</p></div>
        </label>`).join('')}
      </div>
    </fieldset>
    ${actions({ finish: true })}
  </div>`;
}

const stepRenderers = [renderRoleStep, renderTaskStep, renderContextStep, renderPlatformStep, renderBoundariesStep, renderOutputStep];

function renderStepNav() {
  const nav = document.querySelector('#step-nav');
  const progress = Math.round(((state.currentStep - 1) / (STEPS.length - 1)) * 100);
  nav.style.setProperty('--progress', `${progress}%`);
  nav.innerHTML = `<div class="progress-label"><span>Ваша настройка</span><strong>${state.currentStep} из ${STEPS.length}</strong></div>
    <div class="progress-track" aria-hidden="true"></div>
    <div class="step-nav-list">
      ${STEPS.map((step) => {
        const available = step.id <= state.currentStep;
        const classes = ['step-link', available ? 'is-available' : '', step.id === state.currentStep ? 'is-current' : '', step.id < state.currentStep ? 'is-complete' : ''].filter(Boolean).join(' ');
        return `<button class="${classes}" type="button" data-step="${step.id}" ${available ? '' : 'disabled'} ${step.id === state.currentStep ? 'aria-current="step"' : ''}>
          <span class="step-number">${step.id}</span>
          <div><strong>${step.label}</strong><small>${step.short}</small></div>
        </button>`;
      }).join('')}
    </div>`;
}

export function renderStep() {
  const builder = document.querySelector('#builder');
  const result = document.querySelector('#result');
  builder.hidden = false;
  result.hidden = true;
  renderStepNav();
  document.querySelector('#step-content').innerHTML = stepRenderers[state.currentStep - 1]();
}

function clearFieldError(name) {
  const error = document.querySelector(`[data-error-for="${name}"]`);
  if (error) error.textContent = '';
  const target = document.querySelector(`[data-error-target="${name}"]`);
  if (target) target.removeAttribute('aria-invalid');
  document.querySelectorAll(`[data-field="${name}"]`).forEach((control) => control.removeAttribute('aria-invalid'));
}

function showErrors(errors) {
  for (const [name, message] of Object.entries(errors)) {
    const error = document.querySelector(`[data-error-for="${name}"]`);
    const target = document.querySelector(`[data-error-target="${name}"]`);
    if (error) error.textContent = message;
    if (target) target.setAttribute('aria-invalid', 'true');
    document.querySelectorAll(`[data-field="${name}"]`).forEach((control) => control.setAttribute('aria-invalid', 'true'));
  }
  const firstName = Object.keys(errors)[0];
  document.querySelector(`[data-field="${firstName}"]`)?.focus();
}

function updateStateFromControl(control) {
  const field = control.dataset.field;
  if (!field) return;
  clearFieldError(field);
  if (field === 'taskIds') {
    const value = Number(control.value);
    state.taskIds = control.checked
      ? [...new Set([...state.taskIds, value])]
      : state.taskIds.filter((item) => item !== value);
  } else if (field === 'roleId' && state.roleId !== control.value) {
    state.roleId = control.value;
    state.taskIds = [];
  } else {
    state[field] = control.value;
  }
  saveState();
}

function goNext() {
  const errors = validateStep(state.currentStep, state);
  if (Object.keys(errors).length) {
    showErrors(errors);
    return;
  }
  if (state.currentStep === STEPS.length) {
    renderResult();
    return;
  }
  state.currentStep += 1;
  saveState();
  renderStep();
  document.querySelector('#builder').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goBack() {
  if (state.currentStep <= 1) return;
  state.currentStep -= 1;
  saveState();
  renderStep();
}

function tabContent(result) {
  return result[activeResultTab] ?? result.instruction;
}

export function renderResult() {
  const builder = document.querySelector('#builder');
  const container = document.querySelector('#result');
  const bundle = buildResult(state);
  const role = ROLES.find((item) => item.id === state.roleId) ?? ROLES[0];
  const platform = PLATFORMS.find((item) => item.id === state.platform) ?? PLATFORMS[0];
  builder.hidden = true;
  container.hidden = false;
  container.innerHTML = `<div class="result-start">
      <div><strong>Шаг 1. Настройте агента под себя</strong><p>Нажмите кнопку и пройдите шесть коротких шагов. Так готовый агент будет работать именно под вашу задачу.</p></div>
      <button class="button button-primary" type="button" data-action="edit">Изменить настройки</button>
    </div>
    <div class="result-hero">
      <div><h2>Ваш агент собран</h2><p>Это готовая стартовая конфигурация. Скопируйте нужный раздел или скачайте весь комплект и попробуйте первую команду.</p></div>
      <div class="result-badge"><span>Роль</span><strong>${role.name}</strong><span>${platform.name}</span></div>
    </div>
    <pre class="passport">${escapeHTML(bundle.passport)}</pre>
    <div class="result-body">
      <div class="tabs" role="tablist" aria-label="Разделы результата">
        ${RESULT_TABS.map((tab) => `<button class="tab" type="button" role="tab" data-tab="${tab.id}" aria-selected="${activeResultTab === tab.id}">${tab.id === 'skills' && platform.id === 'chat' ? 'Правила' : tab.label}</button>`).join('')}
      </div>
      <div class="result-toolbar">
        <button class="button button-primary" type="button" data-action="download-all">Скачать весь комплект</button>
        <button class="button button-quiet" type="button" data-action="copy" data-section="${activeResultTab}">Скопировать раздел</button>
        <button class="button button-secondary" type="button" data-action="download-instruction">Скачать ${bundle.instructionFilename}</button>
        ${platform.id === 'chat' ? '' : '<button class="button button-ghost" type="button" data-action="download-skill">Скачать SKILL.md</button>'}
      </div>
      <pre class="result-code" tabindex="0">${escapeHTML(tabContent(bundle))}</pre>
      <div class="next-steps">
        <article class="next-card">
          <h3>Хотите разобрать агента под свой проект?</h3>
          <p>На консультации можно уточнить задачи, материалы и подходящий способ запуска.</p>
          <div class="contact-actions">
            <a class="button button-primary" href="${CONSULTATION_URL}" target="_blank" rel="noopener noreferrer">Написать в Telegram</a>
            <a class="button button-secondary" href="${VK_URL}" target="_blank" rel="noopener noreferrer">Написать ВКонтакте</a>
          </div>
        </article>
      </div>
      <div class="result-footer-actions">
        <button class="button button-ghost" type="button" data-action="edit">Изменить настройки</button>
        <button class="button button-danger" type="button" data-action="reset">Начать заново</button>
      </div>
    </div>`;
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Текст скопирован.');
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    document.execCommand('copy');
    field.remove();
    showToast('Текст скопирован.');
  }
}

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(`Файл ${filename} скачан.`);
}

function showToast(message) {
  if (typeof document === 'undefined') return;
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function bindAppEvents() {
  const stepContent = document.querySelector('#step-content');
  stepContent.addEventListener('input', (event) => {
    if (event.target.matches('input[type="text"], textarea')) updateStateFromControl(event.target);
  });
  stepContent.addEventListener('change', (event) => {
    if (event.target.matches('input')) updateStateFromControl(event.target);
  });
  stepContent.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'next') goNext();
    if (action === 'back') goBack();
  });

  document.querySelector('#step-nav').addEventListener('click', (event) => {
    const button = event.target.closest('[data-step]');
    if (!button || button.disabled) return;
    state.currentStep = Number(button.dataset.step);
    saveState();
    renderStep();
  });

  document.querySelector('#result').addEventListener('click', (event) => {
    const tab = event.target.closest('[data-tab]')?.dataset.tab ?? event.target.closest('[data-tab-jump]')?.dataset.tabJump;
    if (tab) {
      activeResultTab = tab;
      renderResult();
      return;
    }
    const action = event.target.closest('[data-action]')?.dataset.action;
    const bundle = buildResult(state);
    if (action === 'copy') copyText(bundle[activeResultTab]);
    if (action === 'download-all') downloadTextFile('my-ai-agent-kit.md', bundle.all);
    if (action === 'download-instruction') downloadTextFile(bundle.instructionFilename, bundle.instruction);
    if (action === 'download-skill') downloadTextFile('SKILL.md', bundle.skills);
    if (action === 'edit') {
      renderStep();
      document.querySelector('#builder').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (action === 'reset' && window.confirm('Удалить ответы и начать заново?')) {
      localStorage.removeItem(STORAGE_KEY);
      state = createInitialState();
      activeResultTab = 'instruction';
      renderStep();
      document.querySelector('#builder').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function initApp() {
  document.documentElement.classList.add('js');
  state = loadState();
  bindAppEvents();
  renderStep();
}

if (typeof document !== 'undefined') initApp();
