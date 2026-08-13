# Premissi ja sen aukot

README kertoo mitä rakennetaan. Tämä dokumentti kertoo mihin väite nojaa, ja missä
kohtaa se voi olla väärässä. Jos joku tarttuu tähän projektiin, tämä on se tiedosto
joka pitää lukea ennen kuin mitään lisätään.

## Väitteen rakenne

1. Käyttäytymisen muutos edellyttää, että risteyskohta havaitaan ajoissa.
2. Risteyskohdan havaitseminen edellyttää toimivaa mallia omasta käyttäytymisestä.
3. Itsemallin tarkkuus on mitattavissa ennusteiden kalibraationa.
4. Mitattava asia on harjoiteltavissa.
5. Siksi: harjoittele kalibraatiota, ja havaitseminen paranee.

Kohta 5 on hypoteesi. Kohdat 1–4 ovat kohtuullisen hyvin tuettuja. **Kausaalinuoli
kalibraatiosta käyttäytymiseen on tämän projektin avoin kysymys**, eikä sitä pidä
esittää käyttäjälle varmuutena.

## Mihin tämä nojaa

**Dual-process-mallit riippuvuudessa** (Wiers, Stacy; Bechara). Automaattinen,
opittu järjestelmä ohjaa käyttöä paljolti harkitsevan järjestelmän ohi. Seuraus
suunnittelulle: tieto ja palaute eivät riitä, koska ne osoitetaan järjestelmälle
joka ei tee päätöstä.

**Abstinence violation effect** (Marlatt & Gordon). Yksi lipsahdus laukaisee
suhteettoman romahduksen, kun ihminen on sitoutunut ehdottomaan raittiuteen ja
tulkitsee lipsahduksen identiteetin epäonnistumiseksi. Seuraus: katkeava
putkilaskuri on aktiivisesti haitallinen mekanismi.

**Häpeä ja retkahdus** (Dearing, Stuewig & Tangney). Häpeäalttius ennustaa
päihdeongelmien vaikeutumista; syyllisyys ei samalla tavalla. Ero on olennainen:
"tein huonon teon" on työstettävissä, "olen epäonnistunut" ei. Seuraus: mikään
merkkijono käyttöliittymässä ei saa arvottaa päivää.

**Hot–cold empathy gap** (Loewenstein). Viileässä tilassa ihminen aliarvioi
systemaattisesti sen, miten kiihtynyt tila muuttaa hänen valintojaan. Seuraus:
rauhallisena tehty sitoumus ei kanna risteykseen — mutta rauhallisena jätetty
*viesti* voi kantaa.

**Käyttäytymistaloustiede ja korvaavuus** (Bickel, Higgins). Vahvisteen kulutus
laskee kun korvaava vahviste on halpa ja lähellä. Seuraus: vaihtoehdon pitää olla
valittu etukäteen ja tarjolla kolmessa sekunnissa, muuten se häviää alkoholille
aina.

**Ennusteiden pisteytys** (Brier 1950; Murphy 1973). Kalibraatio on mitattava
suure, ja se hajoaa osiin joilla on erillinen tulkinta. Seuraus: itsetuntemukselle
saadaan mittari, joka ei ole kyselylomake.

## Missä tämä voi olla väärässä

**Kalibraatio voi parantua ilman että käyttäytyminen muuttuu.** Ihminen voi tulla
erinomaiseksi ennustajaksi omasta juomisestaan ja juoda täsmälleen yhtä paljon.
Silloin sovellus on tuottanut tarkan ennustajan eikä mitään muuta. Tämä on
todennäköisin epäonnistumistapa, ja se pitää mitata: seuraa erottelukyvyn ja
perustason kehitystä rinnakkain.

**Ennustaminen voi muuttua sitoumukseksi.** Jos käyttäjä alkaa lukea "20 %"
lupauksena itselleen, koko häpeättömyys valuu pois ja mekanismi kääntyy tavalliseksi
tavoitteenasetteluksi. Sanamuodot ("arvaa rehellisesti, älä tavoitteen mukaan")
suojaavat tältä heikosti. Tämä pitää testata oikeilla käyttäjillä.

**Itseään toteuttava ennuste.** "Ennustin 80 %, joten voin yhtä hyvin juoda." Riski
on todellinen. Vastalääkkeenä sovellus ei pisteytä yksittäistä päivää lainkaan,
vaan ainoastaan pidemmän jakson kalibraation — yksittäisen päivän "oikeaan
osumisella" ei saa mitään.

**Mittaamisesta voi tulla sama selviytymiskeino kuin ennenkin.** Kritiikki
tavallista seurantaa kohtaan pätee tähänkin: myös kalibraation harjoittelu voi olla
tapa tuntea hallintaa tekemättä mitään. Suora vastalääke puuttuu.

**Ihminen ei jaksa ennustaa joka aamu.** Kierros vaatii kaksi kosketusta päivässä.
Ilman muistutuksia se katkeaa, ja katkennut kierros ei tuota mitään dataa.

## Mitä pitäisi mitata jos tätä testataan

- Erottelukyky ajan funktiona — nouseeko itsemalli oikeasti.
- Perustaso ajan funktiona — muuttuuko käyttäytyminen ollenkaan.
- Hetkessä huomaamisen osuus — paraneeko havaitseminen.
- Sokeiden pisteiden määrä — kaventuuko se.
- Keskeyttäminen — kuinka moni jättää kierroksen kesken ja missä kohtaa.

Kiinnostavin yksittäinen tulos olisi, näkyykö erottelukyvyn nousu **ennen**
perustason laskua. Se olisi heikko mutta aito näyttö nuolen suunnasta. Jos
perustaso ei liiku lainkaan vaikka erottelukyky nousee kuukausia, hypoteesi on
kumottu ja se pitää sanoa ääneen.
