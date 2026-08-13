# Sobriety

**Et yritä lopettaa juomista. Yrität tulla tarkaksi ennustajaksi omasta käytöksestäsi.**

Tämä on juomapäiväkirja, joka ei laske raittiita päiviä, ei aseta tavoitteita eikä
kerro sinulle miten meni. Se tekee yhden asian: pyytää sinua aamulla arvaamaan,
juotko tänään — ja pisteyttää illalla *arvauksen*, ei päivää.

Raittius, jos se tulee, tulee sivutuotteena siitä että itsemalli tarkentuu tarpeeksi
hyväksi, että risteyskohta näkyy ennen kuin siitä on kuljettu ohi.

---

## Miksi tavallinen seuranta ei toimi

Ihminen kirjaa kaiken, saa palautetta, ja jatkaa juomista. Se ei ole
motivaatiopula. Se on suunnitteluvirhe, ja se toistuu käytännössä jokaisessa alan
sovelluksessa.

**1. Palaute puhuu väärälle järjestelmälle.** Riippuvuus toimii pääosin
automaattisen, opitun järjestelmän kautta. Kirjaaminen ja graafit puhuvat
harkitsevalle järjestelmälle — sille osalle, joka on jo vakuuttunut. "Tiedän että
juon liikaa" ei ole se puuttuva palanen. Tieto ei ole koskaan ollut se puuttuva
palanen.

**2. Mittaamisesta tulee itse selviytymiskeino.** Kirjaaminen antaa hallinnan
tunteen. Hallinnan tunne laskee sitä ahdistusta, joka olisi pakottanut muutokseen.
Sovellus asettuu muutoksen tielle *korvaamalla* sen.

**3. Palaute on arvio, ja arvio on häpeää.** "Ylitit tavoitteesi" on pieni annos
häpeää joka ilta. Häpeä on yksi parhaiten dokumentoiduista retkahduksen
laukaisijoista. Sovellus tuottaa päivittäin sitä ainetta, jota vastaan se väittää
taistelevansa.

**4. Putkilaskuri tekee retkahduksesta katastrofin.** Marlattin *abstinence
violation effect*: kun 84 päivän putki katkeaa yhdestä lasillisesta, romahdus ei
ole yksi lasillinen vaan koko viikonloppu. Laskuri ei mittaa romahdusta — se
rakentaa sen.

**5. Juominen ei ole ongelma vaan ratkaisu.** Se ratkaisee jotain: unta,
sosiaalista jännitystä, työpäivän loppumattomuutta, tyhjää iltaa, tunnetta jota ei
halua tuntea. Ratkaisun poistaminen ilman että tehtävä hoidetaan jotenkin muuten
ei ole suunnitelma, se on toive.

**6. Päätös on tehty kauan ennen ensimmäistä lasillista.** Kirjaus tallentaa
juoman. Valinta tapahtui ehkä 90 minuuttia aiemmin hetkessä, joka ei tuntunut
miltään. Sitä hetkeä ei ole missään datassa.

**7. Aamun minä ei tavoita illan minää.** Loewensteinin *hot–cold empathy gap*:
rauhallinen ihminen ei pysty edes kuvittelemaan himon voimakkuutta, saati
neuvottelemaan sen kanssa. Tavoitteen asettaa maanantaiaamun ihminen. Paikalla on
perjantai-illan ihminen, joka ei tunne häntä.

Tarkennus rehellisyyden vuoksi: psykologia **on** kuvannut nämä kaikki. Marlatt,
dual-process-mallit, viivediskonttaus, käyttäytymistaloustiede. Uutta ei ole
mekanismi vaan se, että työkalut rakennetaan yhä sen mallin varaan, jonka tutkimus
on jo hylännyt.

## Mitä tämä tekee toisin

**Ennuste, ei kirjaus.** Aamulla annat luvun: kuinka todennäköisesti juot tänään.
Illalla kerrot mitä tapahtui. Sovellus pisteyttää ennusteen tarkkuuden.

Tämä kääntää koko kannustinrakenteen ympäri:

- **Peli, jonka voi voittaa juomapäivänäkin.** Ennustit 85 %, joit — täydet pisteet.
  Ennustit 10 %, joit — siinä on tietoa itsestäsi, jota sinulla ei ollut aamulla.
- **Häpeä poistuu rakenteesta, ei sanavalinnoista.** Sovellus ei voi paheksua
  juomista, koska juominen ei ole sen mittari. Mikään merkkijono käyttöliittymässä
  ei arvota päivää.
- **Se vaatii juuri sitä, mikä riippuvuudessa rapautuu.** Oman käytöksen tarkka
  ennustaminen edellyttää toimivaa itsemallia. Kalibraation harjoittelu *on*
  itsetuntemuksen harjoittelua — ei siitä puhumista.
- **Se siirtää katseen eteenpäin.** Kirjaus katsoo taaksepäin tapahtumaan, jolle ei
  voi enää mitään. Ennuste katsoo hetkeen, jossa voi vielä toimia.

### Kolme lukua yhden putkilaskurin sijaan

Pisteytys on Brier-pistemäärä ja sen Murphy-hajotelma, joka sattuu jakautumaan
kolmeen osaan joilla on suora inhimillinen merkitys:

```
Brier = kalibrointivirhe − erottelukyky + perustason vaihtelu
```

| Luku | Mitä se sanoo | Suunta |
|---|---|---|
| **Erottelukyky** | Erotatko riskipäivät muista jo aamulla | ylös |
| **Kalibrointivirhe** | Kun sanot 70 %, tapahtuuko se 70 % ajasta | alas |
| **Ennustetaito** | Kertovatko ennusteesi enemmän kuin pelkkä keskiarvosi | ylös |

Erottelukyky on tässä se kiinnostava. Ihminen joka antaa joka päivälle "50 %" saa
nollan — se on itsemallin puuttumisen allekirjoitus. Kun luku alkaa nousta, ihminen
on alkanut nähdä päivissä eron etukäteen. Se on mitattavissa, ja se tapahtuu ennen
kuin juomisessa näkyy mitään.

### Muut suunnitteluratkaisut

**Sokeiden pisteiden etsintä.** Kun risteys tulee vastaan aikaikkunassa, jota et
merkinnyt aamulla, se kirjataan yllätykseksi. Kolmen toiston jälkeen sovellus
kertoo: "torstai-iltana tulee risteys, jota et näe tulevaksi." Se on
kalibrointivirheraportti, ei syytös.

**Tehtävälista on avoin.** Kahdeksan valmista tehtävää on kehittäjän arvaus siitä,
mihin juoma otetaan. Jos arvaus ei osu, käyttäjä kirjaa iltansa lähimmän väärän
otsikon alle — ja sen jälkeen jokainen luku lasketaan kategorian yli, jota hänellä
ei ole. Siksi omia tehtäviä voi lisätä sekä rauhassa Valmistelussa että kesken
risteyksen, ja ne ovat mukana analyysissä täsmälleen samoin kuin valmiit. Samalla
nimellä lisääminen käyttää olemassa olevaa tehtävää uuden sijaan, jottei saman
asian historia jakaudu kahdelle tunnisteelle. Käytöstä poisto on arkistointi, ei
poisto: vanhat päivät säilyvät luettavina.

**Risteys, ei juoma, on kirjattava tapahtuma.** Yksikkö on hetki jossa päivä
haarautuu. Neljä vaihtoehtoa — *join*, *siirsin*, *tein jotain muuta*, *ohitin* —
kirjataan täsmälleen samalla tavalla. Sovellus jolle pitää valehdella lakkaa
saamasta dataa juuri silloin kun data on tärkeintä.

**Hetkessä huomaaminen erotellaan jälkikäteen muistamisesta.** Huomaaminen on
harjoiteltavissa tavalla, jolla juomatta jättäminen ei ole: himoa ei voi päättää
pois, mutta niiden kymmenen sekunnin havaitsemisessa voi kehittyä. Siksi ne kaksi
eivät koskaan mene samaan lukuun.

**Kylmä minä kirjoittaa kuumalle minälle.** Rauhallisena kirjoitat tai nauhoitat
viestin itsellesi. Risteyksessä sovellus antaa sen takaisin. Se ei koskaan generoi
tekstiä puolestasi — sovelluksen neuvolla ei ole risteyksessä mitään painoarvoa,
sinun omalla äänelläsi on.

**Vaihtoehto tarjotaan valmiiksi valittuna.** Alkoholi on risteyksessä äärimmäisen
halpa: nopea, luotettava, ei vaadi päätöstä. Kilpailijan pitää olla yhtä lähellä.
Siksi vaihtoehtoja ei keksitä risteyksessä vaan rauhassa etukäteen, ja risteyksessä
näytetään yksi nimetty vaihtoehto oman onnistumishistoriasi kanssa.

**Päivä ei vaihdu keskiyöllä vaan klo 05.** Ilta joka jatkuu puolenyön yli on
yksi ilta, ja kalenterirajaan katkaistuna sen jälkipuolisko päätyisi päivälle
jolle ei tehty ennustetta — jolloin illan ennuste jäisi kokonaan pisteyttämättä.
Raja on säädettävissä Tiedot-välilehdellä.

**Sessio ei kelpaa pisteytysyksiköksi, vaikka se on luontevampi kokemuksena.**
Kalibrointi vaatii yksikön joka on olemassa myös silloin kun mitään ei tapahdu.
Sessio on määritelmällisesti juomisjakso: jokaisen session toteuma olisi "join",
perustaso 100 %, erottelukyky nolla. Yksikköä joka syntyy vasta ennustettavasta
tapahtumasta ei voi ennustaa. Päivänsisäinen rakenne on risteyksissä, ei
yksikössä.

**Ainoa putkilaskuri mittaa mukanaoloa.** Se katkeaa vain väliin jätetystä
päivästä. Juominen ei katkaise sitä — ei koskaan.

## Tekniikka

Local-first PWA. Ei tiliä, ei palvelinta, ei verkkokutsuja missään koodissa. Data
on selaimen IndexedDB:ssä ja lähtee laitteelta vain kun viet sen itse JSON-tiedostona.
Tämä on arkkitehtuurirajoite, ei ensimmäisen vaiheen oikaisu: tämä on
arkaluontoisimpia terveysdatoja mitä ihminen voi tuottaa, ja arkkitehtuurissa
pidetty lupaus on enemmän arvoinen kuin tietosuojaselosteessa pidetty.

```
src/core/          puhdas logiikka, ei riippuvuuksia UI:hin — täysin testattu
  types.ts         domain-malli
  forecast.ts      Brier, Murphy-hajotelma, kalibrointi, mukanaoloputki
  windows.ts       sokeat pisteet, funktiokuorma, huomaamisaste
  substitution.ts  vaihtoehtojen ranking (Laplace-silotus + Wilson-alaraja)
  day.ts           päivän elinkaari, paikalliset päivämäärät
src/storage/db.ts  IndexedDB, vienti/tuonti/poisto
src/ui/            näkymät
app.html           Vite-sisääntulo (ei index.html — ks. Julkaisu)
index.html         julkaistu käännös, generoitu — älä muokkaa käsin
assets/            julkaistun käännöksen tiedostot, generoitu
```

```bash
npm install
npm run dev        # kehityspalvelin
npm test           # 107 testiä ydinlogiikalle
npm run build      # typecheck + käännös + synkkaus repon juureen
```

## Julkaisu

Sivusto on osoitteessa https://kokoajat.github.io/Sobriety-/ ja se julkaistaan
**repon juuresta**, ei erillisestä käännösvaiheesta. Siksi juuren `index.html` ja
`assets/` ovat versionhallinnassa: ne *ovat* julkaistu sivusto.

Tämä on epätavallista ja syy on kertomisen arvoinen. GitHub Pages ei käännä
mitään — se tarjoilee valitun lähteen sellaisenaan. Jos Viten sisääntulo olisi
juuren `index.html`:nä, Pages tarjoilisi sen kääntämättä, selain kohtaisi
`<script src="/src/main.tsx">`-rivin jota se ei osaa suorittaa, ja sivu jäisi
tyhjäksi. Siksi sisääntulo on `app.html` eikä `index.html`.

Puhtaampi ratkaisu olisi asettaa Pagesin lähteeksi *GitHub Actions*, jolloin
`.github/workflows/deploy.yml` julkaisisi `dist/`-hakemiston eikä käännöstä
tarvitsisi committoida. Se workflow on olemassa ja toimii. Vaihto vaatii kuitenkin
repositorion asetuksen (Settings → Pages → Source), eikä sitä pysty tekemään
koodista. Jos vaihdat sen, voit poistaa juuresta `index.html`:n, `assets/`:n ja
`scripts/sync-build.mjs`:n sekä palauttaa `app.html`:n nimeksi `index.html`.

**Muistisääntö:** älä koskaan muokkaa juuren `index.html`:ää tai `assets/`:ia
käsin. Aja `npm run build` ja committaa sen tulos. CI kääntää uudelleen ja kaatuu,
jos committoitu käännös ei vastaa lähdekoodia.

## Tilanne

Toimiva MVP. Ydinlogiikka on testattu ja käyttöliittymä on käytettävissä koko
kierrokseen: aamun ennuste → risteys → illan sulkeminen → kalibrointinäkymä.

Seuraavaksi ilmeiset: paikalliset muistutukset ennusteelle ja illan sulkemiselle
(ilman niitä kierros katkeaa), risteysilmoitus ennustettuun ikkunaan,
service worker offline-käyttöön, ja kalibroinnin kehityskäyrä ajassa.

## Mikä tämä ei ole

Tämä ei ole hoitoa eikä korvaa sitä. Malli on suunnitteluhypoteesi, joka nojaa
oikeaan tutkimukseen mutta jota ei ole kliinisesti testattu — pidä sitä sellaisena.

Jos juot päivittäin ja runsaasti, **äkillinen lopettaminen voi olla
hengenvaarallista**: vieroitusoireet voivat johtaa kouristuksiin ja deliriumiin.
Vieroitus kuuluu silloin lääkärille, ei sovellukselle.

Päivystysapu 112 · Päihdeneuvonta 0800 900 45 (maksuton, nimetön, ympäri
vuorokauden)
