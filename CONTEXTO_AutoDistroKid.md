# CONTEXTO_MASTER — AutoDistroKidBimz Chrome Extension
> Última atualização: Maio 2026  
> Responsável: Guilherme (adm@r2jengenharia.com.br / Nuclear Gaming)  
> Status: Fase 0 CONCLUÍDA — Pronto para implementação MVP

## AJUSTE DE ESCOPO — IMPLEMENTACAO ATUAL

Escopo reduzido pelo usuario: a extensao NAO deve preencher titulo, compositor,
creditos, perfil, uploads ou confirmacoes.

A unica automacao atual deve ser:

1. Usar quantidade padrao `12` musicas.
2. Ajustar o select `#howManySongsOnThisAlbum` para essa quantidade quando necessario.
3. Para cada faixa `track="1"` ate `track="N"`, marcar o radio instrumental:

```html
<input
  id="js-instrumental-radio-button-1"
  type="radio"
  track="1"
  class="distroInstrumental"
  value="1"
>
```

Seletor base:

```javascript
[
  `#js-instrumental-radio-button-${i}`,
  `input.distroInstrumental[type="radio"][track="${i}"][value="1"]`,
  `input[type="radio"][track="${i}"][name^="instrumental_"][value="1"]`
]
```

Nao usar fallback generico `input[type="radio"][track="${i}"][value="1"]`,
pois ele pode acertar radios de outras secoes, como `Letras explicitas`.

---

## 1. VISÃO GERAL DO PROJETO

**Nome:** AutoDistroKidBimz  
**Tipo:** Chrome Extension (Manifest V3)  
**Objetivo:** Automatizar o preenchimento do formulário de upload de músicas na plataforma DistroKid (`/new/`), eliminando tarefas repetitivas no processo de distribuição de tracks geradas por IA (Suno AI) para os canais do usuário.

**Problema que resolve:**  
Cada upload no DistroKid exige preencher manualmente ~24 seções com dezenas de campos. Para canais com volume alto de lançamentos (TavernTrack, LouvorGlória, SPOOIKS PHONK), esse processo é lento, propenso a erros e repetitivo. A extensão preenche automaticamente os campos a partir de um perfil de configuração salvo por canal/artista.

**Usuário-alvo primário:** Guilherme (operador dos canais YouTube com Suno AI)  
**Escopo real de automação (definido em Maio 2026):** O usuário preenche a maior parte do formulário manualmente. A extensão automatiza **apenas os campos repetitivos e fixos** listados abaixo.

---

## 1.1 ESCOPO EXATO DE AUTOMAÇÃO — CAMPOS ALVO

A extensão executa **4 blocos de automação** na seguinte ordem:

### BLOCO 1 — Compositor
- Preencher campo Nome próprio → `Guilherme`
- Preencher campo Nome do Meio → `Bim`
- Preencher campo Apelido → `Bimzao`
- Clicar em **"Copia estes compositores para todas as canções neste álbum"**
- Aguardar modal SweetAlert2 → clicar em **"Executar"** (`button.swal2-confirm`)

### BLOCO 2 — Instrumental
- Para **cada faixa**: marcar radio `ref_64` → "Esta música é instrumental e não possui letras"

### BLOCO 3 — Créditos Apple Music: Intérprete/Sintetizador
- Clicar em "Adiciona créditos para cada música neste lançamento" (Apple Music)
- Selecionar **Função:** `Sintetizador`
- Preencher **Nome:** `Bimzao`
- Clicar `#copy-performer` → **"Copiar este intérprete para todas as faixas neste álbum"**
- Aguardar modal → clicar **"Executar"** (`button.swal2-confirm`)

### BLOCO 4 — Créditos Apple Music: Produtor
- Selecionar **Função:** `Produtor`
- Preencher **Nome:** `Bimzao`
- Clicar `#copy-producer` → **"Copiar este produtor para todas as faixas neste álbum"**
- Aguardar modal → clicar **"Executar"** (`button.swal2-confirm`)

---

---

## 2. CANAIS / ARTISTAS ALVO

| Canal YouTube | Artista DistroKid | Gênero Principal | Idioma | Observações |
|---|---|---|---|---|
| TavernTrack | (cadastrado na conta) | Folk/Medieval | English | Universo Kershton |
| Hard EDM | (cadastrado na conta) | Electronic | English | — |

> ⚠️ LouvorGlória e SPOOIKS PHONK **não estão cadastrados no DistroKid** por enquanto. Adicionar quando necessário.

Cada canal terá um **perfil de configuração** salvo na extensão com seus valores padrão.

---

## 3. MAPEAMENTO COMPLETO DE ELEMENTOS — DistroKid `/new/`

> Baseado em inspeção MCP direta da página em Maio 2026.

### SEÇÃO 1 — Plataformas de Distribuição (Checkboxes)

| ref | Plataforma | Estado padrão desejado |
|---|---|---|
| ref_10 | Spotify | ✅ marcado |
| ref_11 | Apple Music | ✅ marcado |
| ref_12 | iTunes | ✅ marcado |
| ref_13 | Instagram e Facebook | ✅ marcado |
| ref_14 | TikTok & ByteDance | ✅ marcado |
| ref_16 | YouTube Music | ✅ marcado |
| ref_17 | Amazon | ✅ marcado |
| ref_18 | Pandora | ✅ marcado |
| ref_19 | Deezer | ✅ marcado |
| ref_20 | Tidal | ✅ marcado |
| ref_21 | iHeartRadio | ✅ marcado |
| ref_22 | Qobuz | ✅ marcado |
| ref_23 | Saavn | ✅ marcado |
| ref_24 | Boomplay | ✅ marcado |
| ref_25 | Anghami | ✅ marcado |
| ref_26 | NetEase | ✅ marcado |
| ref_27 | Tencent | ✅ marcado |
| ref_28 | Claro Música | ✅ marcado |
| ref_29 | Joox | ✅ marcado |
| ref_30 | Kuack Media | ✅ marcado |
| ref_31 | Adaptr | ✅ marcado |
| ref_32 | Flo | ✅ marcado |
| ref_33 | MediaNet | ✅ marcado |
| ref_34 | Snapchat | ❌ desmarcado (padrão) |
| ref_35 | Roblox (beta) | ❌ desmarcado (padrão) |

**Estratégia de automação:** Verificar estado atual de cada checkbox e clicar apenas nos que divergem do perfil. Usar `element.checked` e `element.click()`.

---

### SEÇÃO 2 — Número de Músicas

| ref | Campo | Tipo | Opções |
|---|---|---|---|
| ref_36 | Número de músicas | `<select>` | 1 a 35 (inteiro) |

**Nota:** Definir no perfil. Para lançamentos únicos (singles Suno AI), valor padrão = `1`.

---

### SEÇÃO 3 — Monetização em Redes Sociais

| ref | Campo | Tipo | Custo |
|---|---|---|---|
| ref_37 | Pacote de Redes Sociais | checkbox | 4,95$/ano |

**Estratégia:** Configurável por perfil (on/off). Padrão sugerido: ✅ para SPOOIKS PHONK, opcional para outros.

---

### SEÇÃO 4 — Artista / Lançamento Anterior

| ref | Campo | Tipo | Opções |
|---|---|---|---|
| — | "Single já lançado anteriormente?" | radio | Não / Sim |
| ref_40 | Nome de artista/banda | `<select>` | Artistas cadastrados na conta |
| ref_41 | Novo artista | botão/link | — |

**Estratégia:** Selecionar artista pelo `value` do `<select>` (mapear value → nome de artista na primeira execução). "Lançamento anterior" = Não por padrão.

---

### SEÇÃO 5 — Presença em Plataformas (por artista)

#### YouTube Music
| ref | Campo | Tipo |
|---|---|---|
| ref_42 | Sim – agrupar com lançamentos existentes | radio |
| ref_44 | URL do canal no YouTube Music | textbox |

**Placeholder esperado:** `https://music.youtube.com/channel/...`

#### Instagram e Facebook
- Radios similares (Sim/Não). Já vinculadas na conta — sem input de URL visível.

**Estratégia:** Selecionar "Sim" e preencher URLs por perfil de artista. Armazenar a URL do canal YouTube Music por artista no perfil.

---

### SEÇÃO 6 — Data de Lançamento

| ref | Campo | Tipo | Formato |
|---|---|---|---|
| ref_45 | Data de lançamento | `type=date` | dd/mm/aaaa |

**Estratégia:** Calcular data via JS (ex: hoje + 7 dias). Configurável por perfil (dias de antecedência). Usar `input.valueAsDate` ou `input.value = "YYYY-MM-DD"`.

---

### SEÇÃO 7 — Editora Discográfica

| ref | Campo | Tipo |
|---|---|---|
| ref_47 | Editora discográfica | textbox |

**Valor padrão por perfil.** Ex: "TavernTrack Publishing", "Nuclear Gaming Records", etc.

---

### SEÇÃO 8 — Idioma

| ref | Campo | Tipo | Values relevantes |
|---|---|---|---|
| ref_48 | Língua | `<select>` | Portuguese=29, English=10, Spanish=33, Arabic=1, French=13... (46 opções) |

**Estratégia:** Valor numérico por perfil de canal.

---

### SEÇÃO 9 — Gênero

| ref | Campo | Tipo | Valores relevantes |
|---|---|---|---|
| ref_49 | Gênero principal | `<select>` | Pop=24, Hip Hop/Rap=16, Eletrônica=9, Rock=27, R&B/Soul=25 |
| ref_50 | Gênero secundário (opcional) | `<select>` | Mesmas opções (sem Banda Sonora/Clássica) |

**Estratégia:** Valores numéricos por perfil de canal.

---

### SEÇÃO 10 — Capa de Álbum

| ref | Campo | Tipo |
|---|---|---|
| ref_51 | Upload da capa | `type=file` |

**⚠️ LIMITAÇÃO MVP:** Upload de arquivo via `type=file` não pode ser automatizado por extensão Chrome por segurança do browser. A extensão abrirá o diálogo de seleção e exibirá um tooltip indicando que o usuário deve selecionar manualmente. Fase 2 pode explorar drag-and-drop via clipboard ou File System Access API.

---

### SEÇÃO 11 — Título da Faixa

| ref | Campo | Tipo |
|---|---|---|
| ref_82 | Título da faixa 1 | textbox |

**Estratégia:** Campo obrigatório — preenchido via input do popup da extensão antes de executar a automação. Não vem do perfil salvo (é único por track).

---

### SEÇÃO 12 — Artista Convidado no Título

| ref | Campo | Tipo | Value |
|---|---|---|---|
| ref_52 | Não incluir outros artistas | radio | 0 |
| ref_53 | Sim, adicionar artista convidado | radio | 1 |

**Padrão:** ref_52 (Não). Configurável por perfil.

---

### SEÇÃO 13 — Versão da Música

| ref | Campo | Tipo |
|---|---|---|
| ref_54 | Versão normal | radio |
| ref_55 | Radio Edit | radio |
| ref_56 | Outro | radio |

**Padrão:** ref_54 (normal). Configurável por perfil.

---

### SEÇÃO 14 — Upload do Áudio

| ref | Campo | Tipo | Formatos aceitos |
|---|---|---|---|
| ref_57 | "Já tens um código ISRC?" | link/toggle | — |
| ref_58 | Upload do ficheiro de áudio | `type=file` | WAV, MP3, M4A, FLAC, AIFF, WMA |

**⚠️ LIMITAÇÃO MVP:** Mesmo que capa — upload manual pelo usuário. A extensão clica para abrir o diálogo e aguarda.

---

### SEÇÃO 15 — Dolby Atmos

| ref | Campo | Tipo |
|---|---|---|
| ref_60 | Não | radio |
| ref_83 | Yes — I have a Dolby Atmos mix | radio |

**Padrão:** ref_60 (Não).

---

### SEÇÃO 16 — Compositor / Cover

| ref | Campo | Tipo | Opções |
|---|---|---|---|
| ref_84 | Compus esta música (original) | radio | — |
| ref_85 | Composta por outro artista (cover) | radio | — |
| ref_87 | Papel do compositor | `<select>` | Música=125, Letras=126, Música e letra=197 |
| ref_88 | Nome próprio | textbox | — |
| ref_89 | Nome do Meio | textbox | — |
| ref_90 | Apelido | textbox | — |
| ref_91 | + Adicionar outro compositor | botão | — |

**Padrão para Suno AI:** ref_84 (original). Compositor = nome do operador do canal. Papel = Música e letra (197).

**Nota importante:** Para músicas geradas por IA, verificar política vigente do DistroKid quanto à autoria. Atualmente aceita-se declarar o operador/editor como compositor.

---

### SEÇÃO 17 — Letras Explícitas

| ref | Campo | Tipo |
|---|---|---|
| ref_92 | Não | radio |
| ref_93 | Sim | radio |

**Padrão:** ref_92 (Não). Configurável por track ou perfil.

---

### SEÇÃO 18 — Versão para Rádio (Clean)

| ref | Campo | Tipo |
|---|---|---|
| ref_61 | Não — não inclui conteúdo explícito | radio |
| ref_62 | Sim — esta é a versão limpa | radio |

**Padrão:** ref_61. Vinculado à Seção 17.

---

### SEÇÃO 19 — Instrumental?

| ref | Campo | Tipo |
|---|---|---|
| ref_63 | Esta música possui letras | radio |
| ref_64 | Esta música é instrumental | radio |

**Padrão por perfil:** TavernTrack → frequentemente instrumental (ref_64). Outros → ref_63.

---

### SEÇÃO 20 — Gerado por IA?

| ref | Campo | Tipo |
|---|---|---|
| ref_66 | Não | radio |
| ref_67 | Sim | radio |

**⚠️ Decisão crítica de configuração:** Toda a operação usa Suno AI. Política do DistroKid permite distribuição de música gerada por IA desde que declarada. Configurável por perfil. Recomendado: ref_67 (Sim) para conformidade.

---

### SEÇÃO 21 — Início do Clipe de Pré-visualização

| ref | Campo | Tipo |
|---|---|---|
| ref_68 | Deixar que os serviços decidam | radio |
| ref_69 | Decidir quando começa a parte boa | radio |

**Padrão:** ref_68. Configurável.

---

### SEÇÃO 22 — Preço da Faixa (iTunes/Amazon)

| ref | Campo | Tipo | Opções |
|---|---|---|---|
| ref_70 | Preço da faixa (USD) | `<select>` | 0,69$ (Track Back), 0,99$ (Track Mid), 1,29$ (Track Front) |

**Padrão:** 0,99$ (Track Mid). Configurável por perfil.

---

### SEÇÃO 23 — Extras (Opcionais)

| ref | Campo | Tipo | Custo |
|---|---|---|---|
| ref_71 | Normalização de volume | checkbox | 2,99$ taxa única |
| ref_72 | Pacote de Redes Sociais (track-level) | checkbox | 4,95$/ano |
| — | Eternizar | checkbox | — |
| — | Pacote Descoberta | checkbox | — |
| — | Maximizador de Lojas | checkbox | — |
| — | DistroVid | checkbox | — |

**⚠️ Nota:** refs dos extras adicionais (Eternizar, Descoberta, etc.) não foram capturados — precisam de segunda inspeção MCP. Todos desativados por padrão no MVP.

---

### SEÇÃO 24 — Confirmações Legais (Obrigatórias)

| ref | Campo |
|---|---|
| ref_74 | Confirmação YouTube Music |
| ref_75 | Confirmação capitalização Apple Music |
| ref_76 | Confirmação sem bots/promoção falsa |
| ref_78 | Confirmação de autoria/gravação |
| ref_79 | Confirmação de não usar nome alheio |
| ref_80 | Li e concordo com o Acordo de Distribuição DistroKid |

**Estratégia:** Marcar todos automaticamente. O usuário deve revisar antes de submeter.

---

### SEÇÃO 25 — Botão Final

**"Continuar"** (submit) — aparece após seção de revisão ("Está tudo bem? 🎉").  
**Estratégia:** A extensão NÃO clica neste botão automaticamente. Exibe overlay de revisão e aguarda clique manual do usuário para garantir revisão humana final.

---

## 4. ARQUITETURA DA EXTENSÃO

### Stack
- **Manifest:** V3 (Chrome Extension)
- **Linguagem:** JavaScript puro (sem framework — manter leve)
- **Armazenamento:** `chrome.storage.sync` (perfis por canal, sincronizado entre dispositivos Chrome do usuário)
- **UI:** Popup HTML/CSS/JS
- **Content Script:** Injeta e controla o formulário DistroKid
- **Background:** Service Worker (MV3)

### Estrutura de Arquivos
```
AutoDistroKidBimz/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/
│   └── distrokid-fill.js      ← lógica de preenchimento
├── background/
│   └── service-worker.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── profiles/
    └── defaults.json          ← perfis padrão de exemplo
```

### Permissões necessárias (manifest.json)
```json
{
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["https://distrokid.com/*"]
}
```

---

## 5. MODELO DE DADOS — PERFIL DE CANAL

```json
{
  "profileId": "spooiks_phonk",
  "displayName": "SPOOIKS PHONK",
  "artist": {
    "selectValue": "VALOR_DO_SELECT_ref_40",
    "youtubeMusicUrl": "https://music.youtube.com/channel/UCxxxxxxx"
  },
  "release": {
    "daysAhead": 7,
    "label": "Spooiks Records",
    "language": 10,
    "genrePrimary": 16,
    "genreSecondary": 9,
    "price": "Track Mid"
  },
  "track": {
    "featuredArtist": false,
    "version": "normal",
    "isInstrumental": false,
    "isExplicit": false,
    "isAIGenerated": true,
    "dolbyAtmos": false,
    "previewStart": "auto"
  },
  "composer": {
    "firstName": "Guilherme",
    "middleName": "",
    "lastName": "[Sobrenome]",
    "role": 197
  },
  "extras": {
    "socialPack": true,
    "volumeNormalization": false
  },
  "platforms": {
    "snapchat": false,
    "roblox": false
  }
}
```

---

## 6. FLUXO DE OPERAÇÃO (UX)

```
[Usuário abre distrokid.com/new/]
        ↓
[Ícone da extensão aparece ativo na toolbar]
        ↓
[Usuário clica no ícone → abre Popup]
        ↓
[Popup mostra:]
  - Dropdown: "Selecionar perfil" (TavernTrack / LouvorGlória / SPOOIKS PHONK)
  - Campo obrigatório: "Título da faixa"
  - Campo opcional: "Número de músicas" (default: 1)
  - Toggle: "Confirmar antes de submeter" (sempre ON no MVP)
  - Botão: [🚀 Preencher Formulário]
        ↓
[Content script executa preenchimento campo a campo com delay entre ações]
        ↓
[Campos type=file: extensão clica para abrir diálogo → notifica usuário para selecionar manualmente]
        ↓
[Após preenchimento: overlay de revisão aparece na página]
  - Lista resumo de todos os campos preenchidos
  - Aviso: "Revise antes de clicar em Continuar"
  - Botão de fechar overlay
        ↓
[Usuário revisa → clica em "Continuar" manualmente]
```

---

## 7. ESTRATÉGIAS DE PREENCHIMENTO (Content Script)

### Inputs de Texto
```javascript
function fillText(ref, value) {
  const el = document.querySelector(`[data-ref="${ref}"]`); // ou seletor alternativo
  el.focus();
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}
```

### Selects
```javascript
function fillSelect(ref, value) {
  const el = document.querySelector(`[data-ref="${ref}"]`);
  el.value = value;
  el.dispatchEvent(new Event('change', { bubbles: true }));
}
```

### Radios
```javascript
function clickRadio(ref) {
  const el = document.querySelector(`[data-ref="${ref}"]`);
  if (!el.checked) el.click();
}
```

### Checkboxes
```javascript
function setCheckbox(ref, shouldBeChecked) {
  const el = document.querySelector(`[data-ref="${ref}"]`);
  if (el.checked !== shouldBeChecked) el.click();
}
```

### Delay entre ações
```javascript
const delay = ms => new Promise(res => setTimeout(res, ms));
// Usar await delay(150) entre cada ação para simular interação humana
// e dar tempo para o React/Vue da página processar os eventos
```

**⚠️ Nota técnica importante:** O DistroKid provavelmente usa React ou framework reativo. Só disparar `Event('input')` e `Event('change')` com `bubbles: true` pode não ser suficiente — pode ser necessário usar `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, value)` para contornar o controle de estado do React.

---

## 8. PENDÊNCIAS E PRÓXIMOS PASSOS

### Fase 0 — Contexto (ATUAL)
- [x] Mapeamento de elementos da página `/new/`
- [x] Definição de arquitetura
- [x] Modelo de dados de perfil
- [ ] Segunda inspeção MCP para capturar refs dos extras (Eternizar, Descoberta, etc.)
- [ ] Mapear `value` real do `<select>` ref_40 (artistas cadastrados na conta)
- [ ] Confirmar seletores reais dos elementos (data-ref, id, name, class)

### Fase 1 — MVP
- [ ] `manifest.json`
- [ ] Popup básico (seleção de perfil + título da faixa)
- [ ] Content script `distrokid-fill.js` com todas as seções
- [ ] `chrome.storage.sync` com 3 perfis padrão
- [ ] Tratamento de `type=file` (abrir diálogo + notificação)
- [ ] Overlay de revisão pós-preenchimento

### Fase 2 — Melhorias
- [ ] Gerenciador de perfis no popup (criar/editar/deletar)
- [ ] Histórico de lançamentos
- [ ] Integração com planilha de tracking de lançamentos (Google Sheets via API)
- [ ] Suporte a múltiplas faixas (ref_36 > 1)
- [ ] Upload automático de capa via File System Access API (experimental)
- [ ] Exportar/importar perfis em JSON

---

## 9. OBSERVAÇÕES TÉCNICAS CRÍTICAS

1. **Seletores reais:** Os `ref_XX` do mapeamento são identificadores usados na inspeção MCP, não necessariamente atributos reais do DOM. Antes de implementar, confirmar se os elementos têm `id`, `name`, `data-testid`, ou outro atributo estável via segunda inspeção.

2. **React state:** Eventos nativos podem não triggerar o estado interno do React. Estratégia recomendada: usar o setter nativo via prototype para simular entrada real.

3. **Renderização condicional:** Várias seções só aparecem após ações anteriores (ex: seção de compositor só aparece após selecionar "original"). O content script deve usar polling/MutationObserver para aguardar elementos ficarem disponíveis no DOM antes de interagir.

4. **Rate limiting / bot detection:** Adicionar delays aleatórios entre ações (100–300ms) para evitar detecção. Não há relato público de bloqueio do DistroKid para extensões, mas é boa prática.

5. **Política IA DistroKid:** Verificar periodicamente os termos do DistroKid quanto a músicas geradas por IA — o campo ref_66/ref_67 existe justamente para essa declaração obrigatória.

6. **Upload de arquivos:** `input[type=file]` não pode ter seu valor definido programaticamente por questões de segurança do browser. Alternativas: (a) abrir o diálogo via `.click()` e instruir o usuário; (b) explorar drag-and-drop com DataTransfer (funciona em alguns contextos); (c) File System Access API (requer permissão explícita do usuário).

---

## 11. MAPEAMENTO CONFIRMADO — BOTÕES DE CÓPIA E MODAL

### Botões "Copiar para todas as faixas"

| Bloco | ID do elemento | onclick | Label visível |
|---|---|---|---|
| Compositor | `#copy-composer` (presumido, mesmo padrão) | `copyCreditFromTrack(this, 'composer')` | "Copia estes compositores para todas as canções neste álbum" |
| Intérprete/Sintetizador | `#copy-performer` | `copyCreditFromTrack(this, 'performer')` | "Copiar este intérprete para todas as faixas neste álbum" |
| Produtor | `#copy-producer` | `copyCreditFromTrack(this, 'producer')` | "Copiar este produtor para todas as faixas neste álbum" |

### Modal de Confirmação (SweetAlert2)

Após cada clique nos botões de cópia, o DistroKid exibe um modal SweetAlert2.  
O botão de confirmação tem seletor estável:

```html
<button type="button" class="swal2-confirm swal2-styled" aria-label="Confirmar">
  Executar
</button>
```

**Seletor JS:** `document.querySelector('button.swal2-confirm')`  
**Estratégia:** Aguardar o modal aparecer no DOM (polling ou MutationObserver) antes de clicar, pois o SweetAlert2 renderiza com pequeno delay após animação.

```javascript
async function clickSwalConfirm() {
  // Aguarda o botão aparecer (até 3s)
  const btn = await waitForElement('button.swal2-confirm', 3000);
  if (btn) btn.click();
}

function waitForElement(selector, timeout = 3000) {
  return new Promise(resolve => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) { observer.disconnect(); resolve(el); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { observer.disconnect(); resolve(null); }, timeout);
  });
}
```

- DistroKid Upload Page: `https://distrokid.com/new/`
- Chrome Extension MV3 Docs: `https://developer.chrome.com/docs/extensions/mv3/`
- React input event override: Nativo prototype setter trick
- Suno AI: `https://suno.com`
- Canais: TavernTrack | LouvorGlória | SPOOIKS PHONK

---

*Documento gerado para uso interno. Próxima etapa: Fase 1 MVP — implementação do manifest + popup + content script.*
