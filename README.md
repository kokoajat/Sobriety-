# Kymmenen minuuttia

**Tämä ei mittaa sinua. Se on käytettävissä ne kymmenen minuuttia, kun tekee mieli.**

Yksi painike. Painat kun tekee mieli, sovellus kysyy yhden asian — *mitä se tekisi
juuri nyt* — ja pyytää odottamaan kymmenen minuuttia. Sillä aikaa se näyttää sen
konkreettisen asian, jonka olet itse rauhassa kirjoittanut juuri tähän tarpeeseen.

Ei putkea. Ei pisteitä. Ei päivittäistä velvoitetta. Ei mitään mistä voi jäädä
jälkeen.

---

## Miksi odottaminen ja ei mittaaminen

**Odottaminen on päätös, jonka pystyy tekemään.** "Lopeta juominen" on päätös
sellaisesta minästä, jota ei juuri nyt ole paikalla. "Odota kymmenen minuuttia" on
päätös seuraavista kymmenestä minuutista, ja sen voi perua koska tahansa. Viive on
myös ainoa vipu joka vaikuttaa välittömän palkinnon etuun: sen veto laskee kun
viive kasvaa. Siksi ajastin *on* käyttöliittymä eikä sen yksityiskohta.

**Kysyntä, ei syy.** Kysymys on mitä juoma *tekisi*, ei miksi tekee mieli. Syyn
selittäminen vaatii harkintaa jota siinä hetkessä ei ole käytettävissä — ja
tehtävään voi tarjota korvaajan, syyhyn ei.

**Tarjonta valmistellaan etukäteen.** Alkoholi on siinä hetkessä äärimmäisen halpa:
nopea, luotettava, ei vaadi päätöstä. Kilpailijan pitää olla yhtä lähellä. Siksi
sovellus ei koskaan kysy "mitä voisit tehdä sen sijaan?" kesken himon, vaan antaa
takaisin sen mitä rauhallinen sinä kirjoitti. Se ei myöskään generoi tekstiä
puolestasi: sovelluksen neuvolla ei ole siinä hetkessä painoarvoa, sinun omalla
lauseellasi on.

**Kaikki kolme lopputulosta näyttävät samalta.** *Meni ohi*, *hetki lisää* ja
*otin sen* ovat samankokoisia, samanvärisiä, yhtä kaukana peukalosta. Sovellus
jolle pitää valehdella lakkaa saamasta dataa juuri silloin kun data olisi
arvokasta — ja sovellus joka tekee yhdestä vastauksesta kiusallisen *on* sovellus
jolle valehdellaan.

**Mikään luku ei arvostele sinua.** Historiassa esitetyt luvut ovat *tarjonnan*
ominaisuuksia ("kävely on auttanut 4/5 kertaa") tai himon ominaisuuksia ("se on
mennyt ohi noin kuudessa minuutissa"). Kumpikaan ei ole pisteytys, josta voi olla
jäljessä.

**Alle viiden merkinnän osuuksia ei näytetä.** Kolmesta havainnosta laskettu
prosentti on huhu. `stats.ts` palauttaa silloin `NaN`, ja käyttöliittymä kirjoittaa
"liian vähän vielä" numeron sijaan. Tällä alueella väärä mutta itsevarma väite
omasta käyttäytymisestä on pahempi kuin ei väitettä lainkaan.

### Luettavaa odotuksen ajaksi

Kellon tuijottaminen on huono ainoa tekeminen kärsimättömälle mielelle, eikä
kävelylle pääse aina. Odotusnäytöllä voi siksi avata lyhyiden lauseiden virran:
yksi kerrallaan, vaihtuu itsestään yhdeksän sekunnin välein tai napauttamalla.
Kello kutistuu mutta ei katoa — luettava on häiriö odotuksen ajaksi, ei korvaaja
sille.

Sisältöä ohjaa kaksi sääntöä. **Jokainen rivi kuvaa alkoholia, ei lukijaa.**
"Alkoholi lyhentää REM-unta" on tietoa; "juomisesi pilaa unesi" olisi tuomio, ja
tuomio klo 23 sinnittelevälle ihmiselle on annos häpeää. Testi vahtii, ettei
yksikään rivi puhuttele lukijaa hänen omasta juomisestaan. **Ja joukossa on
toipumisfaktoja**, koska pelkkä haittalista himon aikana lannistaa — lannistunut
on se tila jossa juodaan. Noin kolmannes riveistä katsoo eteenpäin, ja sitäkin
vahtii testi.

Alkoholirivejä on 159, ja niistä 33 on omassa kategoriassaan **Mistä tiedetään**.
Ne nimeävät lähteen ja kertovat myös sen, missä väite on kiistelty. Mukana ovat
GBD 2016 ja sen 2022 tarkennus, Lancetin 600 000 juovan kynnysanalyysi, Kiinan
geneettinen koeasetelma joka romutti J-käyrän, 4,8 miljoonan ihmisen
meta-analyysi raittiiden vertailuvinoumasta, IARC:n syöpäarvio, Ranskan
dementia-aineisto, brittiläinen aivokuvantamiskohortti ja Million Women Study.

Jokaisen löydöksen vieressä kulkee sen oma varaus. Esimerkiksi "mikään määrä ei
ole turvallista" saa rinnalleen absoluuttiset luvut (914 vs. 918
sadastatuhannesta vuodessa) ja huomautuksen ettei kynnyksen puuttuminen tarkoita
yhden annoksen olevan vaarallinen. Pelkän vahvimman väitteen siteeraaminen
tekisi lukijalle saman minkä lehdistö teki näille tutkimuksille — ja lukija joka
löytää varauksen myöhemmin muualta saa syyn epäillä kaikkea muutakin täällä.

Tasapainotesti kaatui kun tutkimusrivit lisättiin: kolmisenkymmentä löydöstä
haitoista painoi eteenpäin katsovien osuuden neljänneksen alle. Sääntöä ei
löysätty vaan vastapainoa lisättiin. Himo johon vastataan pelkällä
vahinkoluettelolla tuottaa juuri sen tilan jossa juodaan, eikä haitoista
oikeassa oleminen ole siihen puolustus. Määrä on tarkoituksella maltillinen: sata joka pitää
paikkansa on parempi kuin kolmesataa, joissa on keksittyjä lukuja. Lisääminen on
rivin lisäämistä `facts.ts`:n taulukkoon — id:t eivät saa muuttua, koska kierrätys
muistaa ne.

Valintaruudusta saa mukaan myös **turhan tiedon korpuksen**: 151 riviä
ällistyttävää ja hyödytöntä. Se on oletuksena pois päältä ja omassa
tiedostossaan, koska sen tehtävä on eri: alkoholirivit kertovat, nämä vain
viihdyttävät. Himon aikana jälkimmäinen työ on yhtä oikeutettu kuin edellinen —
kärsimätön mieli jolle ei anneta mitään pureskeltavaa löytää jääkaapin.

Turhat tiedot on kirjoitettu itse eikä poimittu netin trivia-listoilta:
kopioiminen tarkoittaisi jonkun toisen lisenssiä ja jonkun toisen
faktantarkistusta, ja puolet netissä kiertävästä triviasta on väärin. Siellä
missä suosittu väite on myytti, rivi sanoo sen sijaan niin.

Kierrätys jakaa koko pakan ennen kuin mikään toistuu ja näyttää vähiten
hiljattain nähdyn ensin. **Kaikki yhtä vanhat ovat yhtä todennäköisiä**: tämä oli
alun perin väärin, koska kiinteän kokoisen ikkunan ottaminen pakan kärjestä
romahti tuoreella pakalla taulukon järjestykseksi, ja arpa osui ikuisesti samaan
kourallisen. Kiinteä järjestys muuttuisi tapetiksi jonka silmä ohittaa; puhdas
satunnaisuus näyttäisi saman rivin kahdesti samalla odotuksella.

Napauttaminen antaa uudelle riville täyden lukuajan. Jaettu ajastin olisi pitänyt
oman aikataulunsa riippumatta napautuksista, jolloin 8,5 sekunnin kohdalla
napautettu rivi olisi vaihtunut puolessa sekunnissa — mikä näyttää siltä että
sovellus ei kuuntele.

### Rauhoittumiskeinot

Odotusnäytöltä avautuu myös yhdeksän ohjattua keinoa. Hengitystekniikat piirtävät
ympyrän, joka kasvaa sisäänhengityksellä, pysähtyy pidätyksen ajaksi ja kutistuu
uloshengityksellä; painelukohdat piirtävät kaavakuvan kädestä, ranteesta tai
kasvoista, merkki oikeassa kohdassa. Loput ovat sanallisia: viisi aistia, jännitä
ja päästä, kylmä vesi.

**Näyttö merkitään näkyviin jokaiseen keinoon.** Ne eivät ole samanarvoisia, ja
tasavertaisena valikkona esittäminen väittäisi että ovat. Pidennetylle
uloshengitykselle on vahva näyttö akuutin vireystilan laskusta; akupainannalle
näyttö on ohut ja ristiriitainen, ja niin myös lukee. Se ei tee niistä
hyödyttömiä: hetkessä auttaa luotettavasti se, että käsille annetaan määrätty
tehtävä ja hengitys hidastuu, ja nimetyn kohdan painelu minuutin ajan tekee
molemmat. Sanamuoto pitäytyy siinä väitteessä eikä väitä pisteen vapauttavan
mitään.

Vaihe lasketaan kuluneesta ajasta eikä laskurista. Puhelimen näyttö nukahtaa ja
välilehti jäädytetään, ja mikä tahansa vaiheita eteenpäin laskeva ajastin ajautuu
minuutissa eri tahtiin kuin näkyvä ympyrä. Kuluneesta ajasta johdettu ei voi
ajautua.

### Se yksi luku joka on hyödyllinen

Kun merkintöjä on tarpeeksi, sovellus kertoo **kauanko himo on sinun omissa
merkinnöissäsi kestänyt** ennen kuin se meni ohi. Se muuttaa "kestä loputtomiin"
luvuksi, jonka olet jo useamman kerran voittanut. Mediaani, ei keskiarvo — yksi
poikkeuksellisen pitkä kerta ei saa siirtää tyypillistä tapausta.

## Mitä tämä ei ole

Tämä ei ole hoitoa eikä korvaa sitä. Malli on suunnitteluhypoteesi, joka nojaa
oikeaan tutkimukseen (viive ja himon aaltoluonne, korvaavien vahvisteiden
taloustiede, häpeän rooli retkahduksessa) mutta jota ei ole kliinisesti testattu.

Jos juot päivittäin ja runsaasti, **äkillinen lopettaminen voi olla
hengenvaarallista**: vieroitusoireet voivat johtaa kouristuksiin ja deliriumiin.
Vieroitus kuuluu silloin lääkärille, ei sovellukselle.

Päivystysapu 112 · Päihdeneuvonta 0800 900 45 (maksuton, nimetön, ympäri
vuorokauden)

## Tekniikka

Local-first PWA. Ei tiliä, ei palvelinta, ei verkkokutsuja missään koodissa. Data
on selaimen IndexedDB:ssä ja lähtee laitteelta vain kun viet sen itse
JSON-tiedostona. Arkkitehtuurirajoite, ei ensimmäisen vaiheen oikaisu.

Käynnissä oleva odotus elää tallennuksessa eikä komponentin tilassa: kymmenen
minuutin ajastimen kohdalla näytön lukittuminen ja välilehden karsiminen ovat
normaalitilanne, eivät reunatapaus. Sovelluksen avaaminen kesken himon palauttaa
laskurin, ei valikkoa.

```
src/core/          puhdas logiikka, ei riippuvuuksia UI:hin — testattu
  types.ts         domain-malli
  waiting.ts       odotuksen tila: jäljellä, edistymä, jatkaminen, sulkeminen
  facts.ts         159 riviä alkoholista, kategorioittain
  trivia.ts        151 riviä turhaa tietoa, valinnainen
  breathing.ts     hengitysvaihe kuluneesta ajasta, ympyrän koko
  techniques.ts    9 rauhoittumiskeinoa, kukin näyttöasteineen
  rotation.ts      kierrätys: koko pakka ennen toistoa, ei kiinteää järjestystä
  stats.ts         rehelliset tunnusluvut, NaN alle viiden havainnon
  demands.ts       tarpeiden nimet, omat tarpeet
src/storage/db.ts  IndexedDB, vienti/tuonti/poisto
src/ui/            näkymät: yksi ruutu kerrallaan, ei välilehtipalkkia
app.html           Vite-sisääntulo (ei index.html — ks. Julkaisu)
index.html         julkaistu käännös, generoitu — älä muokkaa käsin
```

```bash
npm install
npm run dev        # kehityspalvelin
npm test           # 94 testiä ydinlogiikalle
npm run build      # typecheck + käännös + synkkaus repon juureen
```

Tietokannan nimi on `kymmenen-minuuttia`. Tästä samasta reposta julkaistiin
aiemmin toinen, hyvin erilainen sovellus nimellä `sobriety`, ja joillakin
laitteilla sen data on yhä tallessa. Nimeä ei käytetä uudelleen: se olisi
tarkoittanut joko lukemista skeemasta jota tämä ei ymmärrä, tai jonkun historian
migraatiota malliin jota varten sitä ei koskaan kirjattu.

## Julkaisu

Sivusto on osoitteessa https://kokoajat.github.io/Sobriety-/ ja se julkaistaan
**repon juuresta**. Siksi juuren `index.html` ja `assets/` ovat versionhallinnassa:
ne *ovat* julkaistu sivusto.

GitHub Pages ei käännä mitään — se tarjoilee valitun lähteen sellaisenaan. Jos
Viten sisääntulo olisi juuren `index.html`:nä, Pages tarjoilisi sen kääntämättä ja
selain kohtaisi rivin `<script src="/src/main.tsx">`, jota se ei osaa suorittaa.
Siksi sisääntulo on `app.html`.

Puhtaampi ratkaisu olisi asettaa Pagesin lähteeksi *GitHub Actions*, jolloin
`.github/workflows/deploy.yml` julkaisisi `dist/`-hakemiston. Se workflow on
olemassa ja toimii, mutta vaihto vaatii repositorion asetuksen (Settings → Pages →
Source), eikä sitä pysty tekemään koodista.

**Älä koskaan muokkaa juuren `index.html`:ää tai `assets/`:ia käsin.** Aja
`npm run build` ja committaa sen tulos. CI kääntää uudelleen ja kaatuu, jos
committoitu käännös ei vastaa lähdekoodia.

## Aiempi versio

Tästä reposta julkaistiin ensin toinen sovellus samaan ongelmaan: **ennustepohjainen
itsetuntemustyökalu**, jossa käyttäjä arvioi aamulla juomisen todennäköisyyden ja
sovellus pisteytti ennusteen tarkkuuden Brier-pistemäärällä ja Murphy-hajotelmalla.
Se on kokonaisuudessaan tallella haarassa
[`archive/v0.1-ennustepohjainen`](https://github.com/kokoajat/Sobriety-/tree/archive/v0.1-ennustepohjainen),
123 testiä ja oma README mukaan lukien.

Se oli älyllisesti kiinnostavampi. Tämä versio lähtee siitä, mikä siinä oli
käytännössä heikointa: se vaati kaksi kirjausta päivässä ja esitti käyttäjälle
kalibrointimatematiikkaa hetkellä, jolloin tarvitaan yksi napautus.
