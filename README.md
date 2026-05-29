# AutoDistroKidBimz

Extensao Chrome MV3 para marcar todas as faixas como instrumentais no formulario de upload em `https://distrokid.com/new/`.

## Estado atual

- Manifest V3 carregavel como extensao sem build.
- Popup com quantidade de musicas, padrao `12`.
- A extensao ajusta `#howManySongsOnThisAlbum` para a quantidade escolhida.
- Depois marca, para cada faixa, o radio:
  - `#js-instrumental-radio-button-N`
  - `input.distroInstrumental[track="N"][value="1"]`
  - `input[name^="instrumental_"][track="N"][value="1"]`
  - texto equivalente: `Esta musica e instrumental e nao possui letras`.
- A extensao nao preenche titulos, compositores, creditos, uploads ou botao final.
- A extensao nao usa fallback generico `input[type="radio"][track="N"][value="1"]`, para nao clicar em radios como `Letras explicitas`.

## Como testar

1. Abra `chrome://extensions`.
2. Ative `Modo do desenvolvedor`.
3. Clique em `Carregar sem compactacao`.
4. Selecione esta pasta: `C:\Repo local\automacao-distrokid`.
5. Abra `https://distrokid.com/new/`.
6. Clique no icone da extensao.
7. Deixe `12` ou ajuste a quantidade de musicas.
8. Clique em `Marcar instrumentais`.

## Observacoes

Se alguma faixa nao existir no DOM ainda, a extensao mostra quais numeros nao encontrou.
