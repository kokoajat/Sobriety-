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

Valintaruudusta saa mukaan myös **turhan tiedon korpuksen**: 312 riviä
ällistyttävää ja hyödytöntä — enemmän kuin alkoholirivejä. Se on oletuksena pois päältä ja omassa
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

**Rivi vaihtuu vain napauttamalla.** Aiemmin se vaihtui yhdeksän sekunnin välein,
ja se oli väärin juuri siihen tilanteeseen, jota varten paneeli on olemassa:
lukunopeus vaihtelee, osa riveistä on kaksi kertaa toisia pidempiä, ja kesken
lauseen katoava rivi on huonompi kuin ei riviä lainkaan — se muuttaa lukemisen
perässä pysymiseksi, mikä on kymmenen minuutin odotuksen vastakohta. Mikään ei ole
enää aikataulussa: rivi pysyy niin kauan kuin sitä katsotaan, ja seuraava tulee
täsmälleen silloin kun sitä pyydetään.

Ohje on **laatikon yläpuolella**, koska ohje selitettävän asian alapuolella
luetaan vasta sen hämmennyksen jälkeen, jonka se oli tarkoitettu estämään.

#### Näyttö pysyy auki

Odotuksen ajaksi otetaan Wake Lock. Puhelin joka sammuu 30 sekunnin kohdalla on
todennäköisin tapa jolla tämä sovellus jää kesken: ruutu pimenee, hetki jää
yksin himon kanssa, ja palaaminen vaatii tietoisen teon juuri silloin kun
tietoiset teot ovat vähissä.

Lukko otetaan uudelleen aina kun sovellus palaa etualalle — selain pudottaa sen
piiloon mennessä eikä palauta itse — ja vapautetaan kun odotus päättyy. Jos
selain ei tue rajapintaa, virhe niellään: odotus toimii silti, eikä kirkkautta
koskeva ilmoitus ole sen arvoinen.

#### Kuvat

Neljälläkymmenelläseitsemällä rivillä on piirros, eli tasan kymmenellä
prosentilla korpuksesta: sykkivät sydämet, kennoston kuusikulmiot,
Saturnus kellumassa, valon matka Auringosta, veden laajeneminen jäätyessä,
taitosten kaksinkertaistuminen, Kuun loittoneminen — ja alkoholipuolella unen
rakenne, maksan käsittelynopeus ja GBD-tutkimuksen riskiluvut pylväinä.

Piirros lisätään vain sinne, missä kuva tekee työn jota lause ei tee: käyrän
muoto, kaksi kokoa rinnakkain, jokin joka liikkuu. Jo valmiiksi selvän rivin
kuvittaminen asettaisi koristeen lukijan ja tekstin väliin, ja klo 23 se on
haitta.

Testi vahtii osuutta **molemmista suunnista**: yli kahdeksan ja alle kolmentoista
prosentin. Alaraja siksi, ettei ominaisuus näivety kuriositeetiksi; yläraja
siksi, että piirros lakkaa merkitsemästä "katso tätä" jos se on joka rivillä.
Yhtäkään kohtausta ei käytetä kahdesti — toistuva piirros luetaan virheeksi.

Sovelluksen kannalta tärkein niistä on **himon aalto**: nousu, huippu ja lasku,
piste kulkemassa sitä pitkin. Se on koko premissi yhtenä muotona.

Riskikuvaajan pylväät alkavat todellisesta nollasta. Akselin katkaiseminen
yhdeksänsataan tekisi neljän tapauksen erosta sadassatuhannessa näyttävän
jyrkänteen — juuri sen lukuvirheen, jonka viereiset rivit ovat olemassa
korjatakseen.

Kaikki on inline-SVG:tä ja CSS-animaatiota: kuvatiedosto tarkoittaisi
verkkokutsua, joita tässä sovelluksessa ei tehdä. Animaatiot kunnioittavat
prefers-reduced-motion.

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

Mukaan lasketaan **vain ne kerrat, joina himo meni ohi ennen kuin aika loppui.**
Tämä rajaus on koko luvun oikeellisuus. `close` kattaa `waitedMs`:n tavoitteeseen,
jottei taskussa unohtunut puhelin kirjaudu kolmen tunnin tahdonvoimana — mutta
sivuvaikutuksena jokainen kellon soiton *jälkeen* vastattu kerta tallentuu tasan
tavoitteen mittaisena. Se on normaali kulku: odotat, aika loppuu, vastaat. Kun ne
laskettiin mukaan, sovellus kertoi "himo on mennyt ohi 10 minuutissa" kenelle
tahansa, joka vastasi vasta lopuksi — eli raportoi oman asetuksensa takaisin
löydöksenä käyttäjästä. Loppuun asti kestäneestä odotuksesta tiedetään vain, että
himo kesti *vähintään* tavoitteen verran. Se on alaraja, ei kesto, joten se
jätetään pois eikä sekoiteta mukaan.

## Kolme asiaa, jotka on rakennettu neurotieteestä eikä intuitiosta

Nämä eivät ole tietoiskurivejä vaan mekanismeja. Jokainen on jäljitettävissä
yhteen löydökseen, ja jokainen muuttaa sitä mitä sovellus *tekee*, ei vain sitä
mitä se sanoo.

### 1. Paikan vaihtaminen on ensimmäinen keino, ei viimeinen

Odotuksen aikana on kolme keinoa: **Vaihda paikkaa**, Luettavaa, Rauhoittumiskeino.
Järjestys rivillä on väite näytöstä, ja siksi ensimmäinen on se, jolla näyttöä on
eniten.

Robins (1975) seurasi Vietnamista palanneita: noin viidennes oli täyttänyt
heroiiniriippuvuuden kriteerit palveluksessa, mutta noin 5 % retkahti ensimmäisen
vuoden aikana kotona ja noin 12 % kolmessa vuodessa. Mikään hoito ei ole päässyt
lähelle noita lukuja. Ihmiset eivät muuttuneet — ympäristö, jossa vihjeet olivat,
katosi.

Kaksi mekanismia selittää sen:

- **Bouton:** ekstinktio ei poista alkuperäistä assosiaatiota vaan rakentaa
  kilpailevan — ja kilpaileva on kontekstisidonnainen, alkuperäinen ei ole. Uusi
  oppiminen on siis vahvimmillaan uudessa paikassa.
- **Everitt & Robbins:** toistuva käyttö siirtää ohjauksen dorsolateraaliseen
  striatumiin, ja käyttäytyminen laukeaa vihjeestä ilman että päätöstä tehdään.
  "En tiedä miksi kaadoin sen, en edes päättänyt" kuvaa tätä täsmällisesti.
  Vihjeen poistaminen on helpompaa kuin sen voittaminen väittelyssä.

Jokainen siirto näyttää mekanisminsa (`why`-kenttä). Syy on käytännöllinen: siirto
jonka ymmärtää, tehdään ensi viikolla ilman sovellusta.

### 2. Kysymys "missä olet" esitetään odotuksen aikana, ei ennen sitä

Tämä on koko muutoksen suunnitteluratkaisu. Painikkeen painamisen jälkeen
kysytään yksi asia — mitä juoma tekisi — ja toinen kysymys siihen kohtaan olisi
ollut todellinen kustannus: lomake himon alussa on nopein tapa saada sovellus
jättämään avaamatta.

Mutta odotus on kymmenen minuuttia tarkoituksella tyhjää aikaa. Napautus siinä ei
viivytä mitään, ja se antaa heti vastineen: näytettävät siirrot ovat niitä, jotka
sopivat siihen huoneeseen, jossa käyttäjä oikeasti on. **Kysy myöhään, vastaa
heti** — se on ainoa syy, jolla kysymykseen on varaa.

Kysymyksen voi ohittaa, jolloin näkyvät yleiset siirrot. Vastaus tallentuu
episodiin, ja historia näyttää **missä nämä hetket ovat olleet** — ainoa luku
tässä sovelluksessa, joka osoittaa johonkin, minkä voi fyysisesti muuttaa. Huone
ei ole henkilökohtainen epäonnistuminen, ja siksi sen näyttäminen on turvallista.
Osuuksia paikoittain ei lasketa: `MIN_SAMPLE` per solu on määrä, jota lähes kukaan
ei saavuta, eikä prosenttia jota ei voi laskea rehellisesti pidä vihjata olevan.

### 3. Sängyssä on eri tilanne, ja se hoidetaan unilääketieteellä

`Nukahtaa`-tarve esivalitsee tilanteeksi sängyn — ainoa tarve, joka kartoittuu
paikkaan luotettavasti. Siellä ohjeet ovat unettomuuden hoidosta (CBT-I) eivätkä
rauhoittumisvinkkejä, ja ensimmäinen niistä on tarkoituksella epäintuitiivinen:
**nouse sängystä.** Sänky menettää tehonsa, jos siinä valvotaan.

Syy, miksi uni ansaitsee oman polkunsa: Browerin työn mukaan alkuvaiheen
unettomuus **ennustaa retkahdusta itsenäisesti** muista tekijöistä. Se on
mitattava, hoidettava ja se osuu juuri siihen perusteluun, jolla paluu useimmin
selitetään — "en saa muuten unta".

### Ja yksi sivu: "Mitä odottaa"

Etusivulta löytyvä aikataulu siitä, mitä tutkimuksissa on havaittu: vieroituksen
aikaikkuna ja kindling, REM-rebound, harmaan aineen palautuminen (Durazzo ym.
2015), anhedoniavaihe (Koob, Volkow ym. 2007), unettomuus, ja se rivi jota
sovellukset eivät kerro:

> **Vihjeen laukaisema himo voi olla voimakkaimmillaan noin kahden kuukauden
> kohdalla.** Osastopotilailla mitattuna korkein päivänä 60, ei päivänä 7.
> Taustalla jyskyttävä himo laskee ajan myötä, äkillinen vihjeestä lähtevä ei
> välttämättä. Ne ovat eri ilmiöitä.

Tämä on syy siihen, ettei sovellus lupaa, että joka päivä on edellistä helpompi.
Se lupaus pettäisi juuri sinä päivänä, jona sitä eniten tarvitaan — ja sovelluksella,
joka on luvannut tasaista paranemista, ei ole silloin mitään sanottavaa.

Jokainen sivun kohta kantaa lähteensä **ja varauksensa samassa laatikossa**.
Löydös ilman rajaansa on se, miten tutkimuksesta tulee iskulause. Mitään ei
personoida: ei "olet nyt tässä" -merkkiä eikä päivälaskuria, jotka tekisivät
fysiologian kuvauksesta edistymispalkin, josta voi jäädä jälkeen.

## Turvaseula, kerran

Ensimmäisellä avauksella sovellus kysyy viisi kysymystä. Se on ainoa kohta, jossa
sovellus kysyy juomisesta yleisesti eikä tästä hetkestä — ja se on siellä yhtä
asiaa varten: **sovellus ei muuten pysty erottamaan perjantai-illan kahta olutta
fyysisestä riippuvuudesta.** Jälkimmäiselle kymmenen minuutin odotus ei ole oikea
interventio, ja äkillinen lopettaminen voi tappaa. Ennen seulaa ainoa tapa kuulla
se oli se, että sattui osumaan oikea tietoiskurivi.

**Kysymykset 1–3 ovat AUDIT-C** — AUDIT:n kolme kulutuskysymystä (Saunders ym.
1993), itsenäisenä seulana validoitu (Bush ym. 1998). Kukin 0–4 pistettä, summa
0–12. Raja-arvo on tässä ≥3 kaikille, vaikka kirjallisuus käyttää ≥4 miehille ja
≥3 naisille: matalamman rajan hinta on keskustelu jota joku ei tarvinnut, korkeamman
hinta on joku joka olisi tarvinnut.

**Kysymykset 4–5 eivät kuulu AUDIT-C:hen**, ja ne on merkitty sellaisiksi sekä
koodissa (`beyondAuditC`) että käyttöliittymässä. Syy: AUDIT-C mittaa *kulutusta*,
ja se vaara jonka takia koko seula tehdään on *fyysinen riippuvuus*. Ne eivät ole
sama asia. Siksi päivittäisyys ja aamuoireet kysytään erikseen, ja **kumpi tahansa
niistä ohittaa minkä tahansa AUDIT-C-summan.** Ylimpään luokkaan ei pääse
juomamäärällä, vain riippuvuuden merkillä.

Ristiriita muun sovelluksen kanssa on todellinen — tämä on mittari sovelluksessa,
jonka ensimmäinen sääntö on ettei se mittaa käyttäjää. Se ratkeaa rajaamalla, ei
kieltämällä:

- Pisteitä ei näytetä koskaan, ei tuloksessa eikä myöhemmin. Luku josta kerrotaan
  on luku jota aletaan parantaa.
- Mitään ei lasketa uudelleen, seurata ajassa tai esittää edistymisenä.
- Vastaus kuvaa **työkalua, ei ihmistä**. "Tämä ei ole oikea työkalu tähän yksin"
  on väite sovelluksesta.
- Matala tulos ei kehu. Kehu vähemmästä juomisesta on sama vipu kuin häpeä
  enemmästä, toisin päin osoitettuna.

Seulan voi ohittaa yhdellä napautuksella joka ruudulla, ja ohitus muistetaan.
Portti himosovelluksen ovella olisi pahempi kuin seulan puuttuminen.

**Apua**-linkki on pysyvästi etusivulla — ei vain silloin kun seula on hälyttänyt.
Linkki joka ilmestyy vasta kun sovellus on päättänyt että olet pulassa, on linkki
jota kukaan ei halua painaa. Sen takaa löytyvät numerot ja vieroitusvaroitus
riippumatta siitä, mitä seulaan vastasi tai vastasiko lainkaan.

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
  trivia.ts        312 riviä turhaa tietoa, valinnainen
src/ui/factFigures.tsx  10 inline-SVG-kohtausta, osa animoituja
  breathing.ts     hengitysvaihe kuluneesta ajasta, ympyrän koko
  techniques.ts    9 rauhoittumiskeinoa, kukin näyttöasteineen
  rotation.ts      kierrätys: koko pakka ennen toistoa, ei kiinteää järjestystä
  stats.ts         rehelliset tunnusluvut, NaN alle viiden havainnon
  demands.ts       tarpeiden nimet, omat tarpeet
  screening.ts     AUDIT-C + kaksi riippuvuuskysymystä, kerran, ei seurantaa
  situations.ts    kuusi tilannetta ja niiden siirrot, mekanismi mukana
  timeline.ts      "Mitä odottaa": vaiheet, lähteet ja varaukset
src/storage/db.ts  IndexedDB, vienti/tuonti/poisto
src/ui/            näkymät: yksi ruutu kerrallaan, ei välilehtipalkkia
app.html           Vite-sisääntulo (ei index.html — ks. Julkaisu)
index.html         julkaistu käännös, generoitu — älä muokkaa käsin
```

```bash
npm install
npm run dev        # kehityspalvelin
npm test           # 161 testiä ydinlogiikalle
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
