# Le Ceneri di Valdombra

Un gioco di ruolo tattico a turni su griglia esagonale, ambientato in una valle fantasy dove i morti hanno ricominciato a camminare.
È scritto in HTML5 e JavaScript puro, senza librerie: gira in qualsiasi browser e diventa un'app Android con Capacitor.

![Icona](www/icon.png)

## Il gioco

- **Una campagna di circa 10 ore**: 40 capitoli divisi in 5 atti, con dialoghi, colpi di scena e un finale.
- **Combattimento ispirato a XCOM**: due azioni per eroe, probabilità di colpire, copertura direzionale, colpi critici sui nemici scoperti, guardia e linea di tiro.
- **Cinque eroi**: Aldric il cavaliere, Lyra l'arciera e Seraphine la maga, a cui si uniscono durante la storia Oriana la sacerdotessa e Brokk il guardiano nanico.
- **Missioni diverse**: sconfiggere tutti i nemici, abbattere un capo, resistere fino all'alba contro ondate di rinforzi, fuggire verso il bordo della mappa, proteggere un alleato.
- **Crescita dei personaggi**: 15 livelli, 50 abilità (due scelte per ognuno dei cinque gradi di ogni eroe) e oltre 40 oggetti tra armi, armature e amuleti.
- **Una mappa del mondo da esplorare** con 50 luoghi: i capitoli della storia, scontri ripetibili per fare esperienza e luoghi segreti con oggetti unici.
- **Ambienti e atmosfera**: prati, paludi, cripte, miniere, forge, passi innevati e la Piana di Cenere, con giorno, tramonto, notte, pioggia, neve e cenere.
- **Musica e suoni generati in tempo reale** con la Web Audio API.
- **Salvataggio automatico** nel browser o nel telefono.
- Pensato per **smartphone, sia in verticale sia in orizzontale**, e funziona anche su computer.

## Giocare subito

Apri `www/index.html` in un browser. Non serve installare nulla.

Per servirlo in locale (utile per provarlo dal telefono sulla stessa rete Wi-Fi):

```bash
npm start
```

Per pubblicarlo su GitHub Pages: in **Settings → Pages** scegli **Source: GitHub Actions**, poi avvia a mano il workflow **Gioca nel browser** dalla scheda **Actions**.

## Scaricare l'APK per Android

Ogni volta che carichi una modifica sul ramo `main`, GitHub Actions compila automaticamente l'app.

1. Apri la scheda **Actions** del repository e scegli l'ultima esecuzione di **APK Android**.
2. In fondo alla pagina, sotto **Artifacts**, scarica `ceneri-di-valdombra-apk`.
3. Dentro lo zip c'è `ceneri-di-valdombra-debug.apk`: copialo sul telefono e aprilo. Android ti chiederà di consentire l'installazione da origini sconosciute.

### Creare una release

Se crei un tag che inizia con `v`, il workflow allega l'APK a una release pubblica:

```bash
git tag v1.0.0
git push origin v1.0.0
```

### APK firmato per il Play Store (facoltativo)

L'APK di debug va benissimo per provare il gioco. Per un APK definitivo, firmato con la tua chiave:

1. Crea una chiave (una volta sola, e conservala con cura):
   ```bash
   keytool -genkeypair -v -keystore valdombra.jks -alias valdombra -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Convertila in testo: `base64 -w0 valdombra.jks` (su macOS: `base64 -i valdombra.jks`).
3. In **Settings → Secrets and variables → Actions** aggiungi questi segreti:
   - `ANDROID_KEYSTORE_BASE64`: il testo del punto 2
   - `ANDROID_KEYSTORE_PASSWORD`: la password del keystore
   - `ANDROID_KEY_ALIAS`: `valdombra`, o l'alias che hai scelto
   - `ANDROID_KEY_PASSWORD`: la password della chiave

Da quel momento il workflow produce anche `ceneri-di-valdombra.apk`, firmato. Per il Play Store servirà poi un bundle AAB (`./gradlew bundleRelease`), che si può aggiungere allo stesso workflow.

## Compilare l'APK sul tuo computer

Servono Node.js 22, JDK 21 e Android Studio (o l'Android SDK).

```bash
npm install
npm run android:init     # crea la cartella android/, le icone e lo schermo intero
npm run android:build    # APK di debug in android/app/build/outputs/apk/debug/
npm run android:open     # oppure apri il progetto in Android Studio
```

Dopo ogni modifica al gioco basta `npm run android:sync`.

## Struttura del progetto

```
www/                      il gioco (è tutto qui dentro)
  index.html              interfaccia e finestre
  css/style.css           stile, layout verticale e orizzontale
  fonts/                  caratteri IM Fell English (licenza OFL)
  js/data.js              terreni, classi di eroi e nemici
  js/story.js             i 40 capitoli: testi, dialoghi, obiettivi, nemici
  js/world.js             mappa del mondo, oggetti, abilità, salvataggi, generazione delle mappe
  js/audio.js             musica generativa ed effetti sonori
  js/engine.js            regole del combattimento e intelligenza dei nemici
  js/ui.js                comandi e pannello della battaglia
  js/campaign.js          storia, accampamento, diario, mappa del mondo
  js/terrain.js           disegno del terreno e degli ambienti
  js/miniatures.js        le miniature di eroi e nemici
  js/battle-render.js     luci, meteo, effetti e ciclo di disegno
assets/                   icona e schermata iniziale dell'app
native/android/           attività Android a schermo intero
scripts/prepare-android.mjs   versione e impostazioni dell'app
.github/workflows/        compilazione dell'APK e pubblicazione su Pages
```

### Modificare la storia

Ogni capitolo in `www/js/story.js` è un oggetto come questo:

```js
{node:'corvara', title:'La Notte di Corvara', level:2, biome:'villaggio', time:'notte',
 obj:{type:'survive', turns:6, waves:{2:['goblin','goblin'], 4:['orc']}},
 foes:['goblin','goblin','gArcher','shaman'], chestItem:'rapido', reward:['lama'],
 brief:["Testo prima della battaglia…"],
 talk:[['Aldric',"Una battuta…"], ['Lyra',"La risposta…"]],
 debrief:["Testo dopo la vittoria…"],
 after:[['Seraphine',"Dialogo dopo la battaglia…"]]}
```

- `obj.type` può essere `kill`, `survive`, `escape` o `protect` (con `npc` e `npcName`).
- `waves` indica quali nemici arrivano all'inizio di quale turno.
- `biome` sceglie terreno e aspetto della mappa, `time` l'ora (`giorno`, `alba`, `tramonto`, `notte`), `weather` il meteo (`pioggia`, `neve`, `cenere`).
- Le mappe sono generate a partire dal bioma; quelle disegnate a mano sono in `HANDMADE`.

## Licenza

Codice e contenuti © kain986. I caratteri IM Fell sono distribuiti con licenza SIL Open Font License (vedi `www/fonts/OFL.txt`).
