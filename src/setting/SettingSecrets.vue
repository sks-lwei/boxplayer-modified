<script setup lang='ts'>
import { computed, reactive, ref, watch } from 'vue'
import useSettingStore from './settingstore'
import { SECRET_REGISTRY, getSecret, setSecrets, type SecretEntry } from '../utils/secrets'
import message from '../utils/message'

const settingStore = useSettingStore()

// 当前表单的值（reactive 以便模板直接绑定）
const formState = reactive<Record<string, string>>({})
const saving = ref(false)
const lastSavedAt = ref<number>(0)

// 把 registry 按 group 分组
const grouped = computed(() => {
  const map = new Map<string, SecretEntry[]>()
  for (const e of SECRET_REGISTRY) {
    if (!map.has(e.group)) map.set(e.group, [])
    map.get(e.group)!.push(e)
  }
  return Array.from(map.entries())
})

// 初始化表单值 —— 优先 runtimeSecrets，fallback 编译时静态值
function syncFormFromStore() {
  const current = settingStore.runtimeSecrets || {}
  for (const e of SECRET_REGISTRY) {
    formState[e.key] = current[e.key] ?? getSecret(e.key)
  }
}
syncFormFromStore()

// 每次打开设置页（mounted / 切换到该 tab）都刷新一次，以防别的地方改过
watch(() => settingStore.runtimeSecrets, () => syncFormFromStore(), { deep: true })

function onInput(key: string, value: string) {
  formState[key] = value
}

// 仅保存被改动的字段
function saveAll(showFeedback = true) {
  const current = settingStore.runtimeSecrets || {}
  const diff: Record<string, string> = {}
  let changed = false
  for (const e of SECRET_REGISTRY) {
    const newVal = (formState[e.key] ?? '').trim()
    const oldVal = current[e.key] ?? ''
    if (newVal !== oldVal) {
      diff[e.key] = newVal
      changed = true
    }
  }
  if (changed) {
    saving.value = true
    // updateStore 内部会自动调用 SaveSetting() 落盘 setting.config
    settingStore.updateStore({ runtimeSecrets: { ...current, ...diff } })
    // 同时刷新 getSecret() 的内存缓存 —— 新值立即可被调用方读取
    setSecrets(diff as any)
    lastSavedAt.value = Date.now()
    saving.value = false
    if (showFeedback) message.success(`已保存 ${Object.keys(diff).length} 项接入配置`)
  } else if (showFeedback) {
    message.info('没有变动需要保存')
  }
}

function clearAll() {
  if (!confirm('确定清空所有运行时接入配置？编译期 .env.local 的静态值不受影响。')) return
  settingStore.updateStore({ runtimeSecrets: {} })
  syncFormFromStore()
}

// 生成一键授权链接按钮的目标 client_id
function buildBaiduDemoUrl() {
  const id = formState['BAIDU_APP_ID']?.trim() || getSecret('BAIDU_APP_ID')
  if (!id) { alert('请先填写百度网盘 Client ID'); return }
  const url = `https://openapi.baidu.com/oauth/2.0/authorize?response_type=code&client_id=${encodeURIComponent(id)}&redirect_uri=xbyboxplayer-oauth://callback&scope=basic,netdisk&qrcode=1&force_login=1`
  window.open(url, '_blank')
}
</script>

<template>
  <div class="settingpage">
    <div class="settinghead">接入配置</div>
    <div class="settingrow">
      <div class="settings-row-label">说明</div>
      <div class="secrets-intro">
        在此界面填写各网盘/平台的 <b>Client ID</b> 与 <b>Client Secret</b>，
        填写后 <b>立即生效</b>（自动保存到本地设置），无需重新编译打包。
        <br>
        所有字段均可留空——留空时使用编译期 <code>.env.local</code> 注入的值。
        <br>
        百度网盘等平台因 2024 年起收紧开放平台权限，建议申请一个属于自己的开发者应用（scope 勾选 <code>basic,netdisk</code>）。
      </div>
    </div>

    <div class="settingrow">
      <div class="settings-row-label">操作</div>
      <div class="secrets-actions">
        <a-button type="primary" size="mini" :loading="saving" @click="saveAll">立即保存</a-button>
        <a-button size="mini" @click="clearAll" status="danger">清空运行时配置</a-button>
        <a-button size="mini" @click="buildBaiduDemoUrl" :disabled="!formState['BAIDU_APP_ID']">预览百度授权页</a-button>
        <span v-if="lastSavedAt" class="secrets-saved-at">✓ 已自动保存 {{ new Date(lastSavedAt).toLocaleTimeString() }}</span>
      </div>
    </div>

    <div class="settingspace" />

    <!-- 按分组渲染所有接入配置 -->
    <template v-for="[group, entries] in grouped" :key="group">
      <div class="settinghead">{{ group }}</div>
      <div v-for="entry in entries" :key="entry.key" class="settingrow">
        <div class="settings-row-label">
          <span class="secrets-entry-label" :title="entry.hint || ''">{{ entry.label }}</span>
          <code class="secrets-entry-key">{{ entry.key }}</code>
        </div>
        <a-input
          v-if="entry.type === 'client_secret' || entry.type === 'token'"
          v-model="formState[entry.key]"
          placeholder="留空则使用编译期值"
          show-password-on="click"
          @change="saveAll(false)"
        />
        <a-input
          v-else
          v-model="formState[entry.key]"
          placeholder="留空则使用编译期值"
          @change="saveAll(false)"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.settingpage {
  padding: 8px 0 40px;
}
.secrets-intro {
  flex: 1;
  color: var(--color-text-2);
  font-size: 13px;
  line-height: 1.7;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--color-fill-2);
  border: 1px solid var(--color-border-2);
}
.secrets-intro code {
  background: var(--color-fill-3);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--color-text-1);
}
.secrets-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.secrets-saved-at {
  font-size: 12px;
  color: rgb(var(--primary-6));
  padding-left: 6px;
  border-left: 1px solid var(--color-border-2);
}
.secrets-entry-label {
  color: var(--color-text-1);
}
.secrets-entry-key {
  display: block;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  color: var(--color-text-3);
  margin-top: 2px;
}
</style>
