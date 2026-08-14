/**
 * Something to read while the clock runs.
 *
 * Staring at a countdown is a poor task for an impatient mind, and going for a
 * walk is not always available. This is the alternative: short lines, one at a
 * time, that give attention somewhere to go without leaving the wait.
 *
 * Two rules govern the wording, and both matter:
 *
 * 1. Every line describes *alcohol*, never the reader. "Alkoholi lyhentää
 *    REM-unta" is information; "juomisesi pilaa unesi" is a verdict, and a
 *    verdict delivered at 23:00 to someone holding out is a dose of shame — one
 *    of the best-documented drivers of the behaviour this app exists to help
 *    with. No line may use "sinä" about drinking.
 *
 * 2. Recovery and mechanism lines are mixed in deliberately. A pure harm list
 *    read during a craving is demoralising, and demoralised is the state in
 *    which people drink. Roughly a third of the corpus points forward.
 *
 * On accuracy: these are established, broadly uncontested findings, stated
 * without invented precision. Where something is a clinical rule of thumb rather
 * than a measured constant, the wording says so. The corpus is deliberately
 * conservative in size — seventy lines that hold up beat two hundred with
 * numbers nobody can source. Adding more is a matter of appending to the array;
 * ids must stay stable, because they are what the rotation remembers.
 */

export type FactCategory =
  | 'sleep'
  | 'mind'
  | 'body'
  | 'tolerance'
  | 'craving'
  | 'social'
  | 'recovery'
  | 'measure'
  /** Where a claim comes from, including where it is contested. */
  | 'research'
  /** The optional useless-knowledge corpus in `trivia.ts`. */
  | 'trivia';

export interface Fact {
  /** Stable forever: the rotation stores exposure against it. */
  id: string;
  text: string;
  category: FactCategory;
}

export const CATEGORY_LABELS: Record<FactCategory, string> = {
  sleep: 'Uni',
  mind: 'Aivot ja mieli',
  body: 'Keho',
  tolerance: 'Sietokyky ja vieroitus',
  craving: 'Himon mekaniikka',
  social: 'Toimintakyky',
  recovery: 'Mitä palautuu',
  measure: 'Määrät ja mittarit',
  research: 'Mistä tiedetään',
  trivia: 'Turhaa tietoa',
};

export const FACTS: Fact[] = [
  // Uni ---------------------------------------------------------------------
  { id: 'sleep-1', category: 'sleep', text: 'Alkoholi nopeuttaa nukahtamista mutta lyhentää REM-unta. Uni kevenee loppuyöstä.' },
  { id: 'sleep-2', category: 'sleep', text: 'Yön jälkipuolisko rikkoutuu, kun elimistö käsittelee alkoholin. Heräilyä tulee lisää, vaikka sitä ei aamulla muistaisi.' },
  { id: 'sleep-3', category: 'sleep', text: 'Alkoholi rentouttaa nielun lihaksia. Se lisää kuorsausta ja hengityskatkoja.' },
  { id: 'sleep-4', category: 'sleep', text: 'Nukahtamiseen käytetty alkoholi menettää tehonsa nopeasti. Muutamassa viikossa sama annos ei enää auta nukahtamaan.' },
  { id: 'sleep-5', category: 'sleep', text: 'Krapula-aamun väsymys ei johdu vain nestehukasta. Suuri osa siitä on katkonaista unta.' },
  { id: 'sleep-6', category: 'sleep', text: 'Alkoholi siirtää sisäistä kelloa. Nukkumaanmenoaika venyy huomaamatta.' },

  // Aivot ja mieli ----------------------------------------------------------
  { id: 'mind-1', category: 'mind', text: 'Alkoholi voimistaa rauhoittavaa GABA-järjestelmää ja vaimentaa kiihdyttävää glutamaattia. Aivot vastaavat säätämällä molempia toiseen suuntaan.' },
  { id: 'mind-2', category: 'mind', text: 'Se vastasäätö on syy siihen, miksi seuraavana päivänä olo on kireämpi kuin ennen juomista. Aivot ovat yhä säädetty alkoholia vastaan, jota ei enää ole.' },
  { id: 'mind-3', category: 'mind', text: 'Ahdistus voi olla krapulassa suurempi kuin lähtötilanteessa. Ilmiö on niin tavallinen, että sillä on oma nimensä.' },
  { id: 'mind-4', category: 'mind', text: 'Sammuminen ei ole tajuttomuutta vaan muistin tallennuksen katkos. Ihminen toimii ja puhuu, mutta hippokampus ei kirjaa mitään.' },
  { id: 'mind-5', category: 'mind', text: 'Runsas käyttö pienentää aivojen tilavuutta. Osa muutoksesta korjaantuu, kun käyttö loppuu.' },
  { id: 'mind-6', category: 'mind', text: 'Alkoholi ei poista ahdistusta. Se siirtää sitä muutaman tunnin päähän, usein suurempana.' },
  { id: 'mind-7', category: 'mind', text: 'Masennuslääkkeiden teho heikkenee alkoholin kanssa. Sama koskee useimpia mielialalääkkeitä.' },
  { id: 'mind-8', category: 'mind', text: 'Arviointikyky heikkenee ennen kuin ihminen huomaa sen itse. Tunne omasta selvyydestä ei ole luotettava mittari.' },
  { id: 'mind-9', category: 'mind', text: 'Alkoholi kaventaa tarkkaavaisuutta: huomio kiinnittyy siihen mikä on lähellä ja nyt, ja seuraukset katoavat näkyvistä.' },

  // Keho --------------------------------------------------------------------
  { id: 'body-1', category: 'body', text: 'Maksa käsittelee alkoholia melko vakionopeudella, noin annoksen tunnissa. Kahvi, suihku tai lenkki eivät nopeuta sitä.' },
  { id: 'body-2', category: 'body', text: 'Rasvamaksa voi kehittyä muutamassa viikossa runsasta käyttöä. Se myös korjaantuu vastaavassa ajassa, jos käyttö loppuu.' },
  { id: 'body-3', category: 'body', text: 'Alkoholi kohottaa verenpainetta. Vaikutus näkyy jo tasoilla, joita moni pitää tavanomaisina.' },
  { id: 'body-4', category: 'body', text: 'Kansainvälinen syöväntutkimuslaitos IARC luokittelee alkoholin ryhmän 1 karsinogeeniksi — samaan luokkaan kuin tupakan ja asbestin.' },
  { id: 'body-5', category: 'body', text: 'Yhteys on osoitettu ainakin suun, nielun, ruokatorven, maksan, paksusuolen ja rintasyövän riskiin.' },
  { id: 'body-6', category: 'body', text: 'Rintasyövän riski kasvaa jo pienillä määrillä. Kynnysarvoa, jonka alapuolella riskiä ei olisi, ei ole löytynyt.' },
  { id: 'body-7', category: 'body', text: 'Alkoholi laajentaa ihon verisuonia. Se tuntuu lämmöltä, mutta lisää lämmönhukkaa — kylmässä yhdistelmä on vaarallinen.' },
  { id: 'body-8', category: 'body', text: 'Alkoholi estää vasopressiinin toimintaa, jolloin munuaiset poistavat nestettä enemmän kuin pitäisi.' },
  { id: 'body-9', category: 'body', text: 'Alkoholi ärsyttää mahalaukun limakalvoa ja lisää närästystä ja refluksia.' },
  { id: 'body-10', category: 'body', text: 'Haima on alkoholille erityisen herkkä. Haimatulehdus on kivulias ja voi olla henkeä uhkaava.' },
  { id: 'body-11', category: 'body', text: 'Alkoholi häiritsee B-vitamiinien, erityisesti tiamiinin, imeytymistä.' },
  { id: 'body-12', category: 'body', text: 'Vakava tiamiinin puute voi johtaa Wernicken enkefalopatiaan. Se on hätätilanne ja vaatii välitöntä hoitoa.' },
  { id: 'body-13', category: 'body', text: 'Runsaan juomisen jälkeen sydämen rytmihäiriöt ovat tavallisia. Ilmiöllä on oma nimensä lääketieteessä.' },
  { id: 'body-14', category: 'body', text: 'Alkoholi nostaa veren triglyseridipitoisuutta.' },
  { id: 'body-15', category: 'body', text: 'Alkoholi heikentää immuunipuolustusta. Vaikutus näkyy jo yhden runsaan illan jälkeen.' },
  { id: 'body-16', category: 'body', text: 'Alkoholi ja parasetamoli yhdessä rasittavat maksaa. Yhdistelmää kannattaa välttää.' },
  { id: 'body-17', category: 'body', text: 'Rauhoittavat lääkkeet ja alkoholi lamaavat molemmat hengitystä. Yhdistelmä on yksi tavallisimmista kuolemaan johtaneista.' },
  { id: 'body-18', category: 'body', text: 'Energiajuoma ei vähennä humalaa. Se peittää väsymyksen, jolloin juomista jatketaan pidempään.' },
  { id: 'body-19', category: 'body', text: 'Alkoholi laskee testosteronia ja häiritsee kuukautiskiertoa.' },
  { id: 'body-20', category: 'body', text: 'Raskausaikana turvallista määrää ei ole osoitettu.' },
  { id: 'body-21', category: 'body', text: 'Alkoholi voi laukaista migreenikohtauksen ja pahentaa sitä.' },
  { id: 'body-22', category: 'body', text: 'Kestävyyskunto ja palautuminen heikkenevät mitattavasti jo muutaman annoksen jälkeen.' },

  // Sietokyky ja vieroitus --------------------------------------------------
  { id: 'tol-1', category: 'tolerance', text: 'Sietokyvyn kasvu ei kerro paremmasta kestävyydestä. Se kertoo, että aivot ovat säätäneet itsensä uudelleen.' },
  { id: 'tol-2', category: 'tolerance', text: 'Kun sietokyky on kasvanut, saman vaikutuksen saamiseksi tarvitaan enemmän. Elimistön kuormitus kasvaa samassa tahdissa, vaikka humala tuntuu pienemmältä.' },
  { id: 'tol-3', category: 'tolerance', text: 'Päivittäisen runsaan käytön äkillinen lopettaminen voi aiheuttaa kouristuksia. Vieroitus kuuluu silloin lääkärille.' },
  { id: 'tol-4', category: 'tolerance', text: 'Delirium tremens on hengenvaarallinen vieroitustila. Se ei ole harvinaisuus päivittäin runsaasti juovilla.' },
  { id: 'tol-5', category: 'tolerance', text: 'Vieroitusoireet alkavat tyypillisesti 6–24 tunnin kuluessa viimeisestä annoksesta.' },
  { id: 'tol-6', category: 'tolerance', text: 'Jos käsi vapisee aamulla ja juominen helpottaa sitä, kyse on vieroituksesta. Se on syy hakeutua lääkäriin, ei jatkaa omin päin.' },
  { id: 'tol-7', category: 'tolerance', text: 'Aamujuominen ei ole määrän merkki vaan riippuvuuden merkki. Se on yksi selkeimmistä.' },

  // Himon mekaniikka --------------------------------------------------------
  { id: 'crav-1', category: 'craving', text: 'Riippuvuus ei ole tahdonvoiman puutetta. Se on oppimista: aivot ovat oppineet, että tietty tilanne johtaa palkintoon.' },
  { id: 'crav-2', category: 'craving', text: 'Vihje voi laukaista himon ilman että sitä tunnistaa. Kellonaika, paikka, ääni, ihminen, tuoksu.' },
  { id: 'crav-3', category: 'craving', text: 'Himo on aalto. Se nousee, käy huipussa ja laskee. Se ei kasva loputtomiin, vaikka huipulla tuntuu siltä.' },
  { id: 'crav-4', category: 'craving', text: 'Kliinisenä nyrkkisääntönä yksittäinen himo laantuu useimmiten noin kahdessakymmenessä minuutissa.' },
  { id: 'crav-5', category: 'craving', text: 'Palkkiojärjestelmä säätyy ajan mittaan: sama määrä tuottaa vähemmän mielihyvää ja enemmän pakkoa.' },
  { id: 'crav-6', category: 'craving', text: 'Retkahdusta edeltää yleensä sarja pieniä päätöksiä, joista yksikään ei tuntunut päätökseltä.' },
  { id: 'crav-7', category: 'craving', text: 'Yksi lipsahdus ei kumoa mitään. Ajatus "kaikki on nyt pilalla" on tunnetuin yksittäinen syy siihen, että lipsahduksesta tulee pidempi jakso.' },
  { id: 'crav-8', category: 'craving', text: 'Himon voimakkuus ja sen kesto eivät liity toisiinsa. Kova himo ei kestä pidempään kuin heikko.' },
  { id: 'crav-9', category: 'craving', text: 'Odottaminen ei vaadi päätöstä lopettaa. Se vaatii vain päätöksen odottaa, ja sen voi perua koska tahansa.' },
  { id: 'crav-10', category: 'craving', text: 'Välittömän palkinnon vetovoima laskee jyrkästi, kun sen ja tämän hetken väliin tulee viivettä. Siksi kymmenen minuuttia muuttaa valintaa enemmän kuin sen pituus antaisi olettaa.' },
  { id: 'crav-11', category: 'craving', text: 'Kehon tilan muuttaminen vaikuttaa nopeammin kuin ajattelun muuttaminen. Kylmä vesi kasvoille, ulkoilma, portaat.' },
  { id: 'crav-12', category: 'craving', text: 'Himon nimeäminen ääneen tai kirjoittamalla laskee sen voimakkuutta mitattavasti.' },
  { id: 'crav-13', category: 'craving', text: 'Himo tuntuu käskyltä, mutta se on ehdotus. Ero on siinä, että ehdotukseen voi olla vastaamatta.' },

  // Toimintakyky ------------------------------------------------------------
  { id: 'soc-1', category: 'social', text: 'Alkoholi vaikuttaa arviointikykyyn ennen kuin se vaikuttaa puheeseen tai kävelyyn.' },
  { id: 'soc-2', category: 'social', text: 'Alkoholi on osallisena huomattavassa osassa väkivaltarikoksia ja tapaturmia.' },
  { id: 'soc-3', category: 'social', text: 'Krapula heikentää työsuoritusta mitattavasti myös silloin, kun veressä ei ole enää alkoholia.' },
  { id: 'soc-4', category: 'social', text: 'Illan runsas juominen voi tarkoittaa promilleja vielä aamulla. Ratti ja alkoholi eivät eroa toisistaan yön aikana niin nopeasti kuin kuvitellaan.' },
  { id: 'soc-5', category: 'social', text: 'Alkoholi heikentää kykyä lukea toisen ilmeitä. Väärinymmärrykset lisääntyvät juuri kun kynnys reagoida niihin laskee.' },

  // Mitä palautuu -----------------------------------------------------------
  { id: 'rec-1', category: 'recovery', text: 'Unen laatu alkaa yleensä korjaantua jo ensimmäisten viikkojen aikana.' },
  { id: 'rec-2', category: 'recovery', text: 'Verenpaine laskee tyypillisesti muutamassa viikossa.' },
  { id: 'rec-3', category: 'recovery', text: 'Maksa-arvot alkavat korjaantua viikoissa, jos vaurio ei ole vielä pysyvä.' },
  { id: 'rec-4', category: 'recovery', text: 'Ahdistuksen perustaso laskee usein selvästi ensimmäisen kuukauden aikana, kun vastasäätö purkautuu.' },
  { id: 'rec-5', category: 'recovery', text: 'Makuaisti ja ruokahalu palautuvat. Moni huomaa sen ennen kuin mitään muuta.' },
  { id: 'rec-6', category: 'recovery', text: 'Iho ja nesteytys kohentuvat usein näkyvästi muutamassa viikossa.' },
  { id: 'rec-7', category: 'recovery', text: 'Rahaa säästyy, mutta useimmat mainitsevat ensimmäisenä aamut.' },
  { id: 'rec-8', category: 'recovery', text: 'Aivojen tilavuudessa nähdään palautumista jo kuukausien kuluessa.' },
  { id: 'rec-9', category: 'recovery', text: 'Yksikin väliin jäänyt kerta on todellinen. Vaikutukset eivät edellytä lopullista päätöstä.' },

  // Määrät ja mittarit ------------------------------------------------------
  { id: 'meas-1', category: 'measure', text: 'Yksi annos on 12 grammaa puhdasta alkoholia: pullo keskiolutta, 12 senttiä viiniä tai 4 senttiä viinaa.' },
  { id: 'meas-2', category: 'measure', text: 'Suomessa riskikäytön rajana on pidetty miehillä 14 ja naisilla 7 annosta viikossa. Se ei ole turvaraja vaan piste, jonka jälkeen haitat kasvavat selvästi.' },
  { id: 'meas-3', category: 'measure', text: '"Kohtuukäyttö" ei ole lääketieteellinen käsite. Se on tapa verrata itseään muihin.' },
  { id: 'meas-4', category: 'measure', text: 'Toleranssi vääristää oman arvion: mitä enemmän juo, sitä vähemmältä oma käyttö tuntuu.' },
  { id: 'meas-5', category: 'measure', text: 'Muistikuva juodusta määrästä on järjestelmällisesti pienempi kuin todellinen määrä. Ero kasvaa illan mittaan.' },
  { id: 'meas-6', category: 'measure', text: 'Kotona kaadettu annos on lähes aina suurempi kuin ravintola-annos.' },
  { id: 'meas-7', category: 'measure', text: 'Leveä lasi saa saman määrän näyttämään pienemmältä kuin kapea. Kaadettu määrä kasvaa lasin muodon mukaan.' },
  { id: 'meas-8', category: 'measure', text: 'Alkoholi jakautuu kehon nesteisiin. Sama annos tuottaa pienikokoiselle korkeamman pitoisuuden.' },
  { id: 'meas-9', category: 'measure', text: 'Promillet nousevat nopeammin tyhjään vatsaan. Ruoka hidastaa imeytymistä muttei vähennä kokonaismäärää.' },
  { id: 'meas-10', category: 'measure', text: 'Kuohuva alkoholi imeytyy tavallista nopeammin.' },

  // Lisää: uni
  { id: 'sleep-7', category: 'sleep', text: 'Alkoholi lisää unenaikaista hikoilua ja sydämen sykettä. Keho tekee yötä töitä samalla kun sen pitäisi levätä.' },
  { id: 'sleep-8', category: 'sleep', text: 'Syke pysyy koholla tuntikausia viimeisen annoksen jälkeen. Palautuminen unen aikana jää vajaaksi.' },
  { id: 'sleep-9', category: 'sleep', text: 'Unessa nähdyt unet vähenevät alkoholin jälkeen ja palaavat rytäkällä, kun juominen loppuu. Vilkkaat unet ovat merkki REM-unen palautumisesta.' },
  { id: 'sleep-10', category: 'sleep', text: 'Torkahtaminen sohvalle illalla ei ole rentoutumista vaan sedaatiota. Ne tuntuvat samalta mutta palauttavat eri tavalla.' },

  // Lisää: aivot ja mieli
  { id: 'mind-10', category: 'mind', text: 'Alkoholi heikentää uuden oppimista vielä seuraavana päivänä, vaikka olo tuntuisi normaalilta.' },
  { id: 'mind-11', category: 'mind', text: 'Ensimmäisen annoksen piristävä vaikutus tulee nousevasta pitoisuudesta. Laskevalla käyrällä sama aine vaimentaa.' },
  { id: 'mind-12', category: 'mind', text: 'Siksi toinen annos tuntuu tarpeelliselta: se palauttaa nousevan käyrän hetkeksi. Sama toistuu joka kerta.' },
  { id: 'mind-13', category: 'mind', text: 'Alkoholi kaventaa kykyä kuvitella tulevaa. Huominen tuntuu kaukaisemmalta kuin se on.' },
  { id: 'mind-14', category: 'mind', text: 'Unettomuus ja ahdistus ruokkivat toisiaan, ja alkoholi pahentaa molempia pidemmällä aikavälillä vaikka helpottaa kumpaakin hetkeksi.' },
  { id: 'mind-15', category: 'mind', text: 'Krapula-ahdistus on voimakkaimmillaan noin vuorokauden kuluttua, ei heti aamulla.' },

  // Lisää: keho
  { id: 'body-23', category: 'body', text: 'Alkoholi häiritsee verensokerin säätelyä. Yöllinen matala verensokeri voi herättää hikisenä ja sydän hakaten.' },
  { id: 'body-24', category: 'body', text: 'Alkoholi kuivattaa myös silmiä ja limakalvoja, ei vain suuta.' },
  { id: 'body-25', category: 'body', text: 'Suoliston mikrobisto muuttuu runsaan käytön myötä ja alkaa päästää läpi aineita, joiden ei pitäisi päästä.' },
  { id: 'body-26', category: 'body', text: 'Alkoholi lisää virtsahapon määrää ja voi laukaista kihtikohtauksen.' },
  { id: 'body-27', category: 'body', text: 'Luuston uusiutuminen hidastuu runsaassa käytössä. Murtumat paranevat hitaammin.' },
  { id: 'body-28', category: 'body', text: 'Alkoholi laskee kynnystä kaatua ja samalla kykyä suojata itseään kaatuessa.' },
  { id: 'body-29', category: 'body', text: 'Punoitus kasvoilla juotaessa voi kertoa siitä, että elimistö käsittelee asetaldehydiä hitaasti. Silloin syöpäriski on tavallista korkeampi.' },
  { id: 'body-30', category: 'body', text: 'Asetaldehydi on se väliaine, joka aiheuttaa suurimman osan krapulan oireista — ja myös suurimman osan solutason vahingosta.' },

  // Lisää: sietokyky ja vieroitus
  { id: 'tol-8', category: 'tolerance', text: 'Sietokyky laskee tauon aikana. Vanha tuttu määrä on paluun jälkeen aiempaa vaarallisempi.' },
  { id: 'tol-9', category: 'tolerance', text: 'Vieroitusoireet voivat voimistua kerta kerralta. Ilmiötä kutsutaan kindlingiksi, ja se tekee jokaisesta seuraavasta vieroituksesta riskialttiimman.' },
  { id: 'tol-10', category: 'tolerance', text: 'Levottomuus, hikoilu ja pahoinvointi aamulla ovat vieroitusta, eivät krapulaa, jos ne helpottavat juomalla.' },

  // Lisää: himon mekaniikka
  { id: 'crav-14', category: 'craving', text: 'Himo voimistuu hetkeksi kun sitä vastustaa. Se on aallon nousu, ei merkki siitä että vastustaminen epäonnistuu.' },
  { id: 'crav-15', category: 'craving', text: 'Ajatus "vain yksi" on riippuvuuden vanhin lause. Se ei ole valhe vaan tarjous, jonka hinta jätetään mainitsematta.' },
  { id: 'crav-16', category: 'craving', text: 'Nälkä, väsymys ja yksinäisyys laskevat kynnystä enemmän kuin mikään yksittäinen vihje.' },
  { id: 'crav-17', category: 'craving', text: 'Himon voimakkuus laskee, kun sitä katsoo kuin säätä: se on tässä, se menee ohi, sitä ei tarvitse ratkaista.' },
  { id: 'crav-18', category: 'craving', text: 'Vihjeiden poistaminen ympäriltä on tehokkaampaa kuin niiden vastustaminen. Vastustaminen kuluttaa, poissaolo ei.' },
  { id: 'crav-19', category: 'craving', text: 'Toistuvasti vastustettu vihje menettää voimaansa hitaasti. Se ei tunnu miltään ensimmäisillä kerroilla.' },

  // Lisää: toimintakyky
  { id: 'soc-6', category: 'social', text: 'Alkoholi kaventaa näkökenttää ja hidastaa reaktioaikaa jo tasoilla, joilla ihminen tuntee itsensä selväksi.' },
  { id: 'soc-7', category: 'social', text: 'Valvominen vaikuttaa suorituskykyyn samankaltaisesti kuin alkoholi. Yhdessä ne ovat enemmän kuin osiensa summa.' },
  { id: 'soc-8', category: 'social', text: 'Alkoholi ei tee ujosta rohkeaa. Se poistaa hetkeksi kyvyn välittää seurauksista, mikä on eri asia.' },

  // Lisää: mitä palautuu
  { id: 'rec-10', category: 'recovery', text: 'Leposyke laskee usein muutamassa viikossa.' },
  { id: 'rec-11', category: 'recovery', text: 'Vatsan ja suoliston oireet rauhoittuvat tavallisesti nopeasti.' },
  { id: 'rec-12', category: 'recovery', text: 'Uni muuttuu ensin sekavammaksi ja sitten selvästi paremmaksi. Ensimmäisten öiden levottomuus on ohimenevää.' },
  { id: 'rec-13', category: 'recovery', text: 'Mieliala heilahtelee ensimmäisinä viikkoina. Se tasaantuu, kun palkkiojärjestelmä säätyy takaisin.' },
  { id: 'rec-14', category: 'recovery', text: 'Kyky tuntea mielihyvää tavallisista asioista palaa vähitellen. Se on hitainta mutta myös merkittävintä.' },

  /*
   * Mistä tiedetään.
   *
   * These name their source, and two of them state the case against the
   * headline. An app that only quoted the strongest available claim would be
   * doing to the reader what the tabloids did to this study — and a reader who
   * later discovers the caveat elsewhere has reason to distrust everything else
   * here. The whole picture is also simply more interesting than the slogan.
   */
  { id: 'res-1', category: 'research', text: 'Väite "mikään määrä ei ole turvallista" tulee Lancetin GBD 2016 -tutkimuksesta vuodelta 2018. Se kokosi 694 kulutusaineistoa ja 592 riskitutkimusta 195 maasta.' },
  { id: 'res-2', category: 'research', text: 'Sen keskeinen tulos: terveyshaitat minimoiva kulutustaso on nolla. Käyrällä ei ole kynnystä, jonka alapuolella riski lakkaisi kasvamasta.' },
  { id: 'res-3', category: 'research', text: 'Sama tutkimus arvioi alkoholin osuudeksi 2,8 miljoonaa kuolemaa vuonna 2016. Se oli maailman seitsemänneksi suurin kuolemien riskitekijä.' },
  { id: 'res-4', category: 'research', text: 'Alkoholiin liittyi 6,8 prosenttia miesten ja 2,2 prosenttia naisten kuolemista maailmanlaajuisesti vuonna 2016.' },
  { id: 'res-5', category: 'research', text: '15–49-vuotiailla alkoholi oli suurin yksittäinen kuolemanriskin tekijä. Miesten kuolemista siinä ikäryhmässä noin 12 prosenttia liittyi alkoholiin.' },
  { id: 'res-6', category: 'research', text: 'Suojaava vaikutus löytyi vain sepelvaltimotaudille, ja pienimmillään riski oli noin 0,9 annoksen kohdalla päivässä. Syöpäriskin kasvu kumosi hyödyn kokonaisuudessa.' },
  { id: 'res-7', category: 'research', text: 'Absoluuttisina lukuina: sadastatuhannesta raittiista noin 914 sairastuu vuodessa johonkin 23:sta alkoholiin liittyvästä ongelmasta. Yhden päivittäisen annoksen juovista 918.' },
  { id: 'res-8', category: 'research', text: 'Kahdella annoksella päivässä luku on 977 ja viidellä 1252 sadastatuhannesta. Riski ei kasva tasaisesti vaan kiihtyen.' },
  { id: 'res-9', category: 'research', text: 'Ero raittiin ja yhden päivittäisen annoksen välillä on neljä tapausta sadassatuhannessa vuodessa. Se on todellinen mutta pieni — ja juuri siksi luku kannattaa tietää oikein.' },
  { id: 'res-10', category: 'research', text: 'Tilastotieteilijä David Spiegelhalter huomautti, ettei alkuperäinen tutkimus julkaissut absoluuttisia riskejä lainkaan, jolloin lukija ei voinut arvioida suuruusluokkaa.' },
  { id: 'res-11', category: 'research', text: 'Sama kriitikko muistutti: "Ei ole turvallista tasoa ajaa autoa, mutta hallitus ei silti kehota välttämään ajamista."' },
  { id: 'res-12', category: 'research', text: 'Saman tutkimusryhmän vuoden 2022 päivitys tarkensi tulosta iän mukaan: 15–39-vuotiailla haitat minimoiva taso on käytännössä nolla, yli 40-vuotiailla se voi olla hieman nollan yläpuolella.' },
  { id: 'res-13', category: 'research', text: '"Ei turvallista tasoa" tarkoittaa, ettei käyrältä löydy kynnystä. Se ei tarkoita, että yksi annos olisi vaarallinen. Molemmat ovat totta yhtä aikaa.' },
  { id: 'res-14', category: 'research', text: 'Alkoholin luokittelu ryhmän 1 karsinogeeniksi on vuodelta 1988. Karsinogeeneille ei yleensä määritellä turvallista alarajaa, ja siitä "ei turvallista määrää" osittain seuraa.' },
  { id: 'res-15', category: 'research', text: 'Vanhat tutkimukset, joissa kohtuukäyttö näytti suojaavalta, kärsivät usein siitä että raittiiden joukossa oli terveytensä vuoksi lopettaneita. Ilmiöllä on nimi: abstainer bias.' },
];
