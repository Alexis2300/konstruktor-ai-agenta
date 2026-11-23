import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFile(path.join(root, name), 'utf8');
const loadApp = () => import(`${pathToFileURL(path.join(root, 'app.js')).href}?t=${Date.now()}`);

test('has_required_page_contract', async () => {
  const html = await read('index.html');
  for (const id of ['builder', 'step-nav', 'step-content', 'result', 'toast']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});

test('defines_exactly_six_roles', async () => {
  const { ROLES } = await loadApp();
  assert.equal(ROLES.length, 6);
  assert.deepEqual(ROLES.map((role) => role.id), [
    'sales', 'content', 'assistant', 'research', 'coordinator', 'support',
  ]);
  for (const role of ROLES) {
    for (const key of ['name', 'description', 'tasks', 'skills', 'result']) {
      assert.ok(role[key], `${role.id} должен содержать ${key}`);
    }
  }
});

test('uses_exact_external_links', async () => {
  const source = `${await read('index.html')}\n${await read('app.js')}`;
  assert.match(source, /https:\/\/t\.me\/m\/T-E7DyClNGYy/);
  assert.match(source, /https:\/\/noya-ai\.ru\/app\/login\?s=Q8XKC35X/);
});

test('keeps_brand_name_uninflected', async () => {
  const source = `${await read('index.html')}\n${await read('app.js')}`;
  assert.match(source, /Александр Гасс/);
  assert.doesNotMatch(source, /Александр(?:ом|у|а|е) Гасс/);
  assert.doesNotMatch(source, /Гасса|Гассу|Гассом|Гассе/);
});

function completedState(base, platform = 'codex') {
  return {
    ...base,
    roleId: 'sales',
    taskIds: [0, 1],
    project: 'Онлайн-школа для руководителей',
    audience: 'Владельцы небольших команд',
    platform,
  };
}

test('requires_role_task_project_audience_platform', async () => {
  const { createInitialState, validateStep } = await loadApp();
  const state = createInitialState();
  assert.deepEqual(Object.keys(validateStep(1, state)), ['roleId']);
  assert.deepEqual(Object.keys(validateStep(2, state)), ['taskIds']);
  assert.deepEqual(Object.keys(validateStep(3, state)).sort(), ['audience', 'project']);
  assert.deepEqual(Object.keys(validateStep(4, state)), ['platform']);
});

test('builds_codex_bundle', async () => {
  const { createInitialState, buildResult } = await loadApp();
  const result = buildResult(completedState(createInitialState(), 'codex'));
  assert.equal(result.instructionFilename, 'AGENTS.md');
  assert.match(result.instruction, /Онлайн-школа для руководителей/);
  assert.match(result.skills, /SKILL\.md/);
  assert.match(result.skills, /^---\nname: agent-sales\ndescription:/);
  assert.match(result.setup, /\.agents\/skills\/agent-sales\/SKILL\.md/);
  assert.match(result.setup, /Codex/);
  assert.match(result.all, /AGENTS\.md/);
});

test('builds_claude_bundle', async () => {
  const { createInitialState, buildResult } = await loadApp();
  const result = buildResult(completedState(createInitialState(), 'claude'));
  assert.equal(result.instructionFilename, 'CLAUDE.md');
  assert.match(result.instruction, /Claude Code/);
  assert.match(result.skills, /SKILL\.md/);
  assert.match(result.setup, /\.claude\/skills\/agent-sales\/SKILL\.md/);
});

test('builds_chat_bundle', async () => {
  const { createInitialState, buildResult } = await loadApp();
  const result = buildResult(completedState(createInitialState(), 'chat'));
  assert.equal(result.instructionFilename, 'AI-CHAT-INSTRUCTION.md');
  assert.match(result.instruction, /единая инструкция|скопируйте/i);
  assert.doesNotMatch(result.setup, /создайте.*SKILL\.md/i);
});

test('shows_sales_service_only_for_sales_role', async () => {
  const { createInitialState, buildResult } = await loadApp();
  const sales = completedState(createInitialState());
  const content = { ...sales, roleId: 'content' };
  assert.equal(buildResult(sales).showSalesServiceCta, true);
  assert.equal(buildResult(content).showSalesServiceCta, false);
});

test('does_not_invent_missing_optional_context', async () => {
  const { createInitialState, buildResult } = await loadApp();
  const result = buildResult(completedState(createInitialState()));
  const combined = Object.values(result).filter((value) => typeof value === 'string').join('\n');
  assert.doesNotMatch(combined, /цена:|₽|рубл|отзыв|гарантирован/i);
  assert.match(result.materials, /если есть|при наличии/i);
});

test('always_keeps_base_safety_rules_with_custom_rule', async () => {
  const { createInitialState, buildResult } = await loadApp();
  const state = { ...completedState(createInitialState()), forbidden: 'Не называй цену без прайса' };
  const result = buildResult(state);
  assert.match(result.instruction, /Не публикуй, не оплачивай, не удаляй данные/i);
  assert.match(result.instruction, /Не называй цену без прайса/i);
});

test('renders_six_step_labels', async () => {
  const source = await read('app.js');
  for (const label of ['Роль', 'Задачи', 'Контекст', 'Среда работы', 'Границы', 'Результат']) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /STEPS\s*=\s*\[/);
});

test('persists_builder_state', async () => {
  const source = await read('app.js');
  assert.match(source, /localStorage\.setItem/);
  assert.match(source, /localStorage\.getItem/);
  assert.match(source, /STORAGE_KEY/);
});

test('exposes_copy_and_download_controls', async () => {
  const source = await read('app.js');
  assert.match(source, /data-action=["']copy/);
  assert.match(source, /data-action=["']download-instruction/);
  assert.match(source, /data-action=["']download-skill/);
  assert.match(source, /data-action=["']download-all/);
});

test('highlights_edit_as_the_first_result_step', async () => {
  const source = await read('app.js');
  assert.match(source, /Шаг 1\. Настройте агента под себя/);
  assert.match(source, /data-action=["']edit["'][^>]*>Изменить настройки/);
});

test('uses_dark_neon_theme_and_readable_body_text', async () => {
  const css = await read('styles.css');
  assert.match(css, /color-scheme:\s*dark/);
  assert.match(css, /linear-gradient/);
  assert.match(css, /--neon:/);
  assert.match(css, /body\s*\{[^}]*font-size:\s*1\.0625rem/s);
  assert.doesNotMatch(css, /\.role-card p[^}]*font-size:\s*\.9rem/s);
  assert.doesNotMatch(css, /\.result-code[^}]*font-size:\s*\.82rem/s);
});

test('opens_external_links_in_new_tab', async () => {
  const source = `${await read('index.html')}\n${await read('app.js')}`;
  assert.match(source, /target=["']_blank["']/);
  assert.match(source, /rel=["']noopener noreferrer["']/);
});

test('has_local_inline_validation_targets', async () => {
  const source = await read('app.js');
  assert.match(source, /data-error-for/);
  assert.match(source, /aria-invalid/);
  assert.match(source, /field-error/);
});

test('preview_server_uses_localhost_4173_and_serves_index', async () => {
  const source = await read('preview-server.mjs');
  assert.match(source, /127\.0\.0\.1/);
  assert.match(source, /4173/);
  assert.match(source, /urlPath\s*===\s*["']\/["']\s*\?\s*["']index\.html["']/);
  assert.match(source, /text\/html/);
});

test('uses_selected_detail_level', async () => {
  const { createInitialState, buildResult } = await loadApp();
  const base = completedState(createInitialState());
  assert.match(buildResult({ ...base, detail: 'short' }).instruction, /отвечай коротко/i);
  assert.match(buildResult({ ...base, detail: 'deep' }).instruction, /ход работы.*допущения/i);
});

test('has_keyboard_skip_link', async () => {
  const html = await read('index.html');
  assert.match(html, /class=["']skip-link["']/);
  assert.match(html, /href=["']#builder["']/);
});
