#!/usr/bin/env node
// CLI: node ai-router/src/cli.mjs "pertanyaan" [--model=id] [--max-tokens=N]
import { routeTask } from './router.mjs';

const args = process.argv.slice(2);
const prompts = args.filter((a) => !a.startsWith('--'));
const opts = {};
for (const a of args) {
  if (a.startsWith('--model=')) opts.modelId = a.slice(8);
  if (a.startsWith('--max-tokens=')) opts.maxTokens = Number(a.slice(13));
  if (a === '--multimodal') opts.multimodal = true;
}

const prompt = prompts.join(' ');

if (!prompt) {
  console.error('Gunakan: node ai-router/src/cli.mjs "pertanyaan" [--model=id]');
  console.error('Model tersedia: glm | deepseek | gemini | gemini-fallback');
  console.error('Contoh: node ai-router/src/cli.mjs "ringkas teks ini: ..."');
  process.exit(1);
}

function formatUsage(u) {
  if (!u) return 'n/a';
  if (u.prompt_tokens !== undefined) {
    return `${u.prompt_tokens} in / ${u.completion_tokens} out (${u.total_tokens} total)`;
  }
  return `${u.promptTokenCount} in / ${u.candidatesTokenCount} out (${u.totalTokenCount} total)`;
}

try {
  const result = await routeTask(prompt, opts);

  console.log('┌─ Hasil');
  console.log(`│ Model        : ${result.modelId} (${result.model})`);
  console.log(`│ Provider     : ${result.provider}`);
  console.log(
    `│ Klasifikasi  : ${JSON.stringify(result.classification)}`
  );
  console.log(`│ Token        : ${formatUsage(result.usage)}`);
  if (result.attempts.length > 0) {
    console.log(
      `│ Gagal dicoba  : ${result.attempts
        .map((a) => `${a.modelId} (${a.status ?? 'err'})`)
        .join(', ')}`
    );
  }
  console.log('└─');
  console.log('');
  console.log(result.content.trim());
  console.log('');
  console.log(`- ai model yang menjawab: ${result.model} (${result.provider})`);
} catch (err) {
  console.error('Gagal:', err.message);
  process.exit(1);
}
