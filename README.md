# AutoDistroKidBimz

Extensao Chrome MV3 para automatizar o formulario de upload de musicas em `https://distrokid.com/new/`.

## O que ela faz

Ao clicar em **Preencher tudo**, a extensao executa 4 fases em sequencia:

1. **Quantidade de musicas** — ajusta o seletor para o numero informado no popup (padrao: 12).
2. **Instrumental** — marca todas as faixas como instrumentais.
3. **IA** — abre o modal de divulgacao de IA para cada faixa e seleciona _Musica (composta por IA)_ + _O audio completo_, depois salva.
4. **Compositor** — preenche o nome do compositor na faixa 1 e copia para todas as cancoes do album.

---

## Atencao: nome do compositor

Esta extensao esta configurada com o nome **Guilherme Bim Bimzao**.

Se voce baixou este repositorio e quer usar com o seu proprio nome, edite o arquivo `content/distrokid-fill.js` e localize a funcao `fase4Compositor`. Voce vai encontrar estas 3 linhas:

```js
setNativeInputValue(firstInput, "Guilherme");  // Nome proprio
setNativeInputValue(middleInput, "Bim");        // Nome do meio
setNativeInputValue(lastInput,  "Bimzao");      // Apelido
```

Troque os valores entre aspas pelo seu nome e salve o arquivo. Nenhuma outra alteracao e necessaria.

---

## Como instalar

1. Baixe ou clone este repositorio.
2. Abra `chrome://extensions`.
3. Ative **Modo do desenvolvedor** (canto superior direito).
4. Clique em **Carregar sem compactacao**.
5. Selecione a pasta do repositorio.
6. A extensao aparece com a versao atual — pronto.

## Como usar

1. Abra `https://distrokid.com/new/`.
2. Clique no icone da extensao na barra do Chrome.
3. Informe a quantidade de musicas do album.
4. Clique em **Preencher tudo** e acompanhe o progresso no canto inferior direito da pagina.
