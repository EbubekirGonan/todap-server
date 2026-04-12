'use strict';
const db = require('../db');

const baslik = 'TOPLUMSAL DAYANIŞMA İÇİN PSİKOLOGLAR DERNEĞİ TÜZÜĞÜ';

const icerik = `
<h2>Derneğin Adı ve Merkezi</h2>
<p><strong>Madde 1</strong></p>
<p>Derneğin Adı: "Toplumsal Dayanışma için Psikologlar Derneği"dir. Dernek adının kısaltılması "TODAP" olarak kullanılacaktır.</p>
<p>Derneğin merkezi İstanbul'dadır.</p>
<p>Dernek, yasalara uygun biçimde yurt içinde ve yurt dışında şube ve temsilcilikler açabilir.</p>

<h2>Derneğin Amacı ve Bu Amacı Gerçekleştirmek İçin Dernekçe Sürdürülecek Çalışma Konuları ve Biçimleri İle Faaliyet Alanı</h2>
<p><strong>Madde 2</strong></p>
<p>Derneğin amacı psikologlar ve psikoloji öğrencilerinin eşitlikçi, özgürlükçü ve dayanışmadan yana ilkeler çerçevesinde örgütlenmesini sağlayarak psikoloji teori ve pratiğinin eleştirisi ve alternatiflerinin düşünülmesi ve üretilmesi yönünde çalışmalar yapmaktır. TODAP, emekten yana, toplumcu ve her türlü ayrımcılığa karşı olarak bir araya gelen psikologları ve psikoloji öğrencilerini çatısı altında toplamayı hedefler. Faaliyetlerini üç eksen üzerine kurar: emek, eleştirel psikoloji ve toplumsal dayanışma.</p>
<p>TODAP'ın emek eksenli çalışmaları, psikologların üretim ilişkileri içerisindeki toplumsal konumunu tanımlamak, bunu görünür kılmak ve bu gerçeklikten yola çıkarak teori ve eylem üretmek üzerine kuruludur. Psikologların çoğunluğu ücretli işçi ya da kamu emekçisi olarak çalışmakta ve çalışma zorunluluğuna yaklaşmaktadır. Her geçen gün çalışmaya ve sermayeye daha bağımlı hale gelmekte; çalışma koşulları güvencesizleşmekte, işsizlikle daha çok karşılaşmaktadır. Emek eksenli çalışmaları; bu duruma dair bir kavrayış geliştirilmesi ve mevcut, güvencesiz ve esnek çalışma koşullarına ve çalışma hayatında yaşanan hak ihlallerine karşı mücadele etmek, çalışma ve sermayeye bağımlılıktan kurtularak, alternatif çalışma düzenlerinin yaratılmasını hedeflemek üzerine kurulmaktadır.</p>
<p>Psikolojinin, içinde ortaya çıktığı ve geliştiği tarihsel koşullar ve güç ilişkileriyle sıkı sıkıya bağlı, ideolojik varsayımlar üzerine kurulduğu görülmektedir. TODAP, ikinci eksenini psikoloji bilgisi ve pratiğinin eleştirisi üzerine kurar ve bundan yola çıkarak yapılacak olan alternatif teori ve pratik üretimini önemser. Bunu disiplinlerarası bir yaklaşımla yapar.</p>
<p>Dünyanın yaşanabilir bir yer olması, psikoloji bilgisinin ve meslek icrasının bütünlüklü ve toplumdan, doğadan ve tüm canlılardan yana olabilmesi için toplumsal dayanışma ekseni TODAP için olmazsa olmaz koşuldur. Bu eksen çerçevesinde psikologların toplumun ezilen kesimleriyle dayanışma içine girmesiyle, bir yandan güç ilişkilerinin dönüştürülmesi bir yandan da psikolojinin dönüşmesi ve dönüştüren bir bilgi ve meslek alanı haline gelmesi hedeflenmektedir. TODAP aynı zamanda hak mücadelelerinin desteklenmesini, toplumsal ve bireysel iyilik halini yaratma çabası içerisinde önemli bir bileşen olarak görür.</p>
<p>Bu üç eksene ek olarak dernek, psikologların ve psikoloji öğrencilerinin öğrenim görürken veya alanda çalışırken karşılaştıkları hak ihlalleriyle, psikologların ve psikolojinin sebep olduğu hak ihlalleri, eşitsizlik ve ayrımcılığı ve gündeme taşır. Lisans eğitiminin psikolog unvanıyla istihdam edilmek için yeterli ve aynı zamanda nitelikli, erişilebilir ve anadilde olması için çalışır ve alanda çalışmak için gerekli kılınan eğitimlerin herkes için erişilebilir olması için çabalar. Bunların yanı sıra, bir sağlık hakkı olarak tanıdığı psikolojik hizmetin eşit, ücretsiz ve anadilde verilmesi için mücadele eder. TODAP bu görüşler ışığında kazanılmış hakları korur, onlara gelebilecek saldırılara karşı mücadele eder, bu hakların ve henüz kazanılmamış olanların savunuculuğunu yapar.</p>

<h2>Derneğin Çalışma Konuları ve Biçimleri ve Faaliyetleri</h2>
<p><strong>Madde 3</strong></p>
<p>Dernek ikinci maddede belirtilen amaçları doğrultusunda aşağıda belirtilen çalışmaları yapar ve faaliyetleri yürütür:</p>
<ul>
<li>Psikologların, psikoloji öğrencilerinin, akademisyenlerin ve diğer psikolojik destek ve hizmet alanı çalışanlarının talep, ihtiyaç ve sorunları üzerine birlikte düşünme alanları yaratarak araştırmalar yapar, toplantı ve etkinlikler düzenler, bu çalışmaların sonucunda raporlar yayınlar, uygulama ve eylem önerilerinde bulunur, bu önerilerin hayata geçmesi için çabalar ve bu konularda kamuoyu oluşturur.</li>
<li>Demokratik, toplumcu, etik değerler ve dayanışma temelinde oluşturulmuş emekten ve toplumdan yana bir Psikologlar Meslek Yasası'nın çıkması için çeşitli çalışmalar yürütür.</li>
<li>Psikologluk mesleğinin icrasında, psikoloji bilgisinin üretilmesi ve kullanılmasında ayrımcılık karşıtlığı, mesleği ve psikoloji bilgisini kötüye kullanmama ilkelerini gözetir.</li>
<li>Psikologların ve psikoloji öğrencilerinin eğitim ve çalışma hayatlarında karşılaştıkları sorunlara karşı mücadele eder.</li>
<li>Psikologların ve psikoloji öğrencilerinin sendikal ve toplumsal örgütlenmelerini destekler ve bu tip örgütlenmelerle dayanışma içinde olur.</li>
<li>Psikologların mesleki bilgi ve becerilerini geliştirici faaliyetleri eşitlik ilkesi çerçevesinde, ücretsiz olarak gerçekleştirir.</li>
<li>Psikoloji lisans ve lisansüstü eğitimiyle ilgili sorunları, tüm bileşenlerin ihtiyaç ve taleplerini dikkate alarak tespit eder ve bunların çözümüne yönelik çalışmalar yürütür.</li>
<li>Toplumsal olayları psikopolitik açıdan düşünür; toplumun hak kaybına uğrayan, ezilen kesimleriyle dayanışma faaliyetleri, söyleşiler, eğitimler, psikolojik destek çalışmaları sürdürür.</li>
<li>Dernek amaçları çerçevesinde dijital ya da basılı olarak bülten, gazete, dergi, kitap gibi yayınlar çıkarır.</li>
<li>Yasal izinlerinin alınması şartıyla ayni ve nakdi yardım toplama faaliyetlerinde bulunur, yurt içinden ve yurt dışından bağışları kabul eder.</li>
<li>Dernek amaçlarını gerçekleştirmek için iktisadi ve ticari işletmeler kurar; lokal açar, sosyal ve kültürel tesisler kurar.</li>
<li>Belirli konularda komisyon ve çalışma grupları oluşturabilir. Sabit bir komisyon olarak Kadın Komisyonu bulunur.</li>
<li>Belirli bir konuya dair sorumluluk alan birimler oluşturur.</li>
<li>Şube ve/veya temsilciliklerin açılma koşullarının oluşmadığı durumlarda yerel inisiyatifler kurar.</li>
<li>Amaçları doğrultusunda platform, girişim, meslek odası ve birliği, vakıf, federasyon vb. oluşumlar kurabilir ya da kurulu olanlara üye olabilir.</li>
<li>Gerekli görülen il ve ilçe, bölge ve yurt dışında şube ve temsilcilikler açar.</li>
</ul>

<h2>Derneğin Çalışma İlkeleri</h2>
<p><strong>Madde 4</strong></p>
<p>TODAP;</p>
<ul>
<li>Kendi iç işleyişinde çoğulculuk, katılımcı demokrasi ve yatay örgütlenme ilkelerini gözeterek çalışır.</li>
<li>Her kademede seçimle belirlenmiş görevlilerin yer almasını ve bütün görevlilerin üyelerin çoğunluğu tarafından geri alınabilmesini savunur.</li>
<li>Üyelerin eleştiri ve öneri haklarını kullanmalarını, karar süreçlerine katılımlarını özendirir.</li>
<li>Bireysel katılımın önünü açmak için yapılan önerilere itiraz olmadığı takdirde önerinin uygulanması için çaba harcar. Yapılan öneriye iki türlü itiraz alanı sunar:<br><br><strong>a. İlkesel İtiraz:</strong> Derneğin amaçlarına, ilkelerine ve işleyişine aykırı olduğu düşünülerek yapılan itiraz biçimidir. İlkesel itiraz kabul edildiğinde öneri iptal edilir ve uygulamaya konulmaz.<br><br><strong>b. Muhalefet Şerhi:</strong> Derneğin amaç, ilke ve işleyişi dışında daha çok uygulamaya dönük yapılan itiraz biçimidir. Kabul edilen bir öneriye muhalefet şerhi konduğunda öneri uygulamaya geçirilir ancak şerh raporlanır.</li>
<li>Farklı fikirlerin ortaya atılması durumunda farklılıkların ortaklaşması yönünde çaba harcar.</li>
<li>Her türlü ayrımcılık, önyargı ve baskı nedeniyle eşitsiz konumda olan üyelerini teşvik etmek amacıyla özendirici ve koruyucu tedbirler alır.</li>
</ul>

<h2>Dernek Üyeliği</h2>
<p><strong>Madde 5</strong></p>
<p>Derneğin amacını benimseyen psikologlar ve psikoloji lisans öğrencileri derneğe üye olabilir.</p>

<p><strong>Madde 6</strong></p>
<p>Derneğin asil genel merkez üyeliği, asil şube üyeliği ve fahri üyelik olmak üzere 3 tür üyeliği vardır.</p>
<ul>
<li><strong>Asil Genel Merkez Üyeliği:</strong> Üye olma koşullarını taşıyan ve Genel Merkez Yönetim Kurulu'nca üyeliğe kabul edilen gerçek ve tüzel kişilerdir.</li>
<li><strong>Asil Şube Üyeliği:</strong> Üye olma koşullarını taşıyan ve Şube Yönetim Kurulu'nca üyeliğe kabul edilen gerçek ve tüzel kişilerdir.</li>
<li><strong>Fahri Üyelik:</strong> Derneğe üye olma koşulları taşımayan ancak dernek amacına bağlı olarak birlikte çalışılan, derneğe maddi ya da manevi destek sağlayan gerçek ve tüzel kişilere fahri üyelik verilebilir.</li>
</ul>

<h2>Üye Olma</h2>
<p><strong>Madde 7</strong></p>
<p>Fiil ehliyetine sahip bulunan ve derneğin amaç ve ilkelerini benimseyerek bu doğrultuda çalışmayı kabul eden ve Mevzuatın öngördüğü koşullarını taşıyan her gerçek ve tüzel kişi bu derneğe üye olma hakkına sahiptir. Ancak, yabancı gerçek kişilerin üye olabilmesi için Türkiye'de yerleşme hakkına sahip olması da gerekir.</p>
<p>Üyelik başvurusu için Genel Merkez ya da Şube Yönetim Kurulu'na yazılı bildirimde bulunulur ve yönetim tarafından 30 gün içinde üyelik talebine cevap verilmesi zorunludur. Üyelik talebi gerekçe gösterilmeden reddedilemez. Başvurusu kabul edilen üye, üyelik defterine kaydedilir.</p>
<p>Şubelere yapılacak üyelik talepleri Şube Yönetim Kurulu tarafından karara bağlanır ve söz konusu karar en geç 30 gün içinde Genel Merkez'e bildirilir.</p>
<p>Onursal üyelik, dernek asil üyelerinden üçünün önerisiyle ve Genel Merkez Genel Kurulu kararıyla verilir.</p>

<h2>Üyelikten Ayrılma</h2>
<p><strong>Madde 8</strong></p>
<p>Her üye, kendi isteği ile üyesi bulunduğu Şube ya da Genel Merkez Yönetim Kurulu'na yazılı olarak bildirme koşuluyla dernek üyeliğinden istifa etme hakkına sahiptir.</p>

<h2>Üyelikten Çıkarılma</h2>
<p><strong>Madde 9</strong></p>
<p>Dernek tüzük hükümlerine ve dernek ilkelerine kısmen ya da tamamen uyulmaması, Genel Kurul ve Yönetim Kurulu kararlarına uyulmaması durumunda, üye Yönetim Kurulu Kararı ile üyelikten çıkarılabilir. Kadına yönelik ayrımcılık, şiddet ve/veya taciz davranışı Kadın Etik Kurulu tarafından, LGBTİ bir bireye karşı ayrımcılık, şiddet ve/veya taciz davranışı LGBTİ Etik Kurulu tarafından, psikoloji alanında bir etik ihlal yaptığı Etik Kurulu tespit edilip ilgili kurulca üyelikten çıkarılmasına karar verilen üye, Yönetim Kurulu tarafından üyelikten çıkarılır.</p>
<p>Dernek üyeliğinden çıkarılan ilgililer, kararın tebliğinden itibaren 30 gün içinde ilk Genel Kurulu'nda görüşülmek üzere itiraz edebilirler.</p>

<h2>Üyelik Aidatı</h2>
<p><strong>Madde 10</strong></p>
<p>Her üye derneğe yıllık aidat ödemekle yükümlüdür. Aidat miktarı iki yılda bir yapılacak Genel Kurul toplantısında belirlenir. Belirlenen aidat miktarının tamamının ait olduğu yılın sonuna kadar ödenmesi zorunludur. Üyelerden giriş aidatı alınmaz.</p>

<h2>Üyelik Yükümlülükleri</h2>
<p><strong>Madde 11</strong></p>
<p>Üyelerin yükümlülükleri şunlardır:</p>
<ul>
<li>Dernek amaçları doğrultusunda faaliyetlere katılmak ve faaliyetlerin hazırlanmasına katkıda bulunmak,</li>
<li>Genel Kurul toplantılarına katılmak,</li>
<li>Yetkili kurullarca verilecek görevleri yerine getirmek,</li>
<li>Yıllık aidat miktarını ait olduğu yılın sonuna kadar ödemek.</li>
</ul>

<h2>Dernek Organları</h2>
<p><strong>Madde 12</strong></p>
<p>Derneğin organları şunlardır:</p>
<ul>
<li>Genel Kurul</li>
<li>Genel Merkez Yönetim Kurulu</li>
<li>Genel Merkez Denetleme Kurulu</li>
<li>Kadın Etik Kurulu</li>
<li>LGBTİ Etik Kurulu</li>
<li>Etik Kurulu</li>
<li>Şube Genel Kurulu</li>
<li>Şube Yönetim Kurulu</li>
<li>Şube Denetleme Kurulu</li>
</ul>

<h2>Genel Kurul</h2>
<p><strong>Madde 13</strong></p>
<p>Genel Kurul, derneğin en yetkili organıdır. Genel Kurul, Genel Merkez Yönetim ve Denetim Kurulları ile Genel Merkez Üyeleri ve biri Şube Başkanı olmak üzere şube üyeleri arasından seçilen delegeler ve onursal üyelerden oluşur. Fahri üyeler oy kullanamazlar.</p>

<p><strong>Madde 14</strong></p>
<p>Genel Kurul, iki yılda bir, Kasım ayı içerisinde Genel Merkez Yönetim Kurulu'nun tespit ve ilan edeceği tarihte olağan olarak toplanır.</p>

<p><strong>Madde 15</strong></p>
<p>Genel Kurul, toplam delege sayısının yarısının bir fazla katılımı ile yapılır. Birinci toplantıda yeterli çoğunluk sağlanmadığı takdirde, ikinci toplantı yeter sayısına bakılmadan katılan üyeler ile yapılır. İkinci toplantı, ilk toplantı tarihinden en az yedi gün sonra en fazla altmış gün içinde gerçekleştirilir.</p>
<p>Tüzük değişikliği ya da dernek feshi durumlarında yeter sayısı tüm üyelerin 2/3'ü kadardır.</p>
<p>Üyeler Genel Kurula en az 15 gün önceden günü, saati, yeri ve gündemi yazı veya elektronik posta yoluyla bildirilmek sureti ile toplantıya çağırılır.</p>

<p><strong>Madde 16–19</strong></p>
<p>Genel Kurul toplantıları, çağrıda belirtilen gün, saat ve yerde yapılır. Toplantı yönetimi Genel Kurul başkanına aittir. Yazmanlar toplantı tutanağını düzenler ve başkanla birlikte imzalar. Bütün üyelerin yazılı katılımıyla alınan kararlar geçerlidir; ancak bu karar olağan toplantı yerine geçmez.</p>

<h2>Genel Kurulun Görev ve Yetkileri</h2>
<p><strong>Madde 20</strong></p>
<ul>
<li>Başkanlık Divanı üyelerini seçmek,</li>
<li>Dernek Genel Yönetim Kurulu, Denetim Kurulu ve Kadın Kurulu üyelerini seçmek,</li>
<li>Dernek Tüzüğünü değiştirmek,</li>
<li>Seçilen organların çalışma raporlarını incelemek ve aklamak,</li>
<li>Bütçeyi görüşüp kabul etmek,</li>
<li>Taşınır ve taşınmaz malların alım/satımında Yönetim Kuruluna yetki vermek,</li>
<li>Şube açılmasına karar vermek,</li>
<li>Uluslararası faaliyette bulunması veya yurt dışı kuruluşlara üye olmasına karar vermek,</li>
<li>Dernekten çıkarılan üyelerin itirazlarını incelemek,</li>
<li>Derneğin feshine karar vermek.</li>
</ul>

<h2>Yönetim Kurulu</h2>
<p><strong>Madde 21</strong></p>
<p>Yönetim Kurulu 7 asil ve 7 yedek üyeden oluşur. Yönetim Kurulu; Genel Başkan, Genel Başkan Yardımcısı, Genel Sekreter, Genel Sekreter Yardımcısı, Sayman ve iki üyeden oluşur. Görev süresi en fazla iki yıldır. Yönetim Kurulu üyeleri en fazla 2 dönem üst üste görev yapabilir.</p>

<p><strong>Madde 22</strong></p>
<p>Yönetim Kurulu en az ayda bir kez toplanır. Toplantı tüm dernek üyelerinin katılımına açıktır.</p>

<h2>Yönetim Kurulunun Görev ve Yetkileri</h2>
<p><strong>Madde 23</strong></p>
<ul>
<li>Resmi kurumlar karşısında derneği temsil eder.</li>
<li>Gelir ve gider hesaplarına ilişkin işlemleri yapar ve bütçeyi hazırlar.</li>
<li>Derneğin çalışmaları ile ilgili yönetmelikleri hazırlar.</li>
<li>Genel kurulun verdiği yetki ile taşınmaz mal satın alır, kiralar, ipotek ve ayni haklar tesis ettirir.</li>
<li>Şube açmaya ilişkin işlemlerin yürütülmesini sağlar ve şubeleri denetler.</li>
<li>Genel kurulda alınan kararları uygular.</li>
<li>Tüzük hükümlerine göre üye alımı, istifa ve üyelikten çıkarma kararlarını alır.</li>
<li>Mevzuatın kendisine verdiği diğer görevleri yapar.</li>
</ul>

<h2>Denetleme Kurulu</h2>
<p><strong>Madde 24</strong></p>
<p>Denetleme Kurulu 3 asil ve 3 yedek üyeden oluşur. Kurul üyeleri içlerinden bir üyeyi Denetleme Kurulu Başkanı olarak seçer.</p>

<p><strong>Madde 25</strong></p>
<p>Denetleme Kurulu, Genel Kurul'a karşı sorumludur. Yönetim Kurulu'nun işlerini, bütçelerini, gelir ve giderlerini Genel Kurulu adına en geç yılda bir denetler.</p>

<h2>Kadın Etik Kurulu</h2>
<p><strong>Madde 26</strong></p>
<p>Kadın Etik Kurulu 5 asil ve 5 yedek kadın üyeden oluşur. Üyeler Genel Kurulda, Kadın Komisyonuna üye olan kadın üyelerin aday olduğu ve kadın üyelerin oy kullandığı kapalı oylamayla belirlenir.</p>

<p><strong>Madde 27–28</strong></p>
<p>Kadın Etik Kurulu; dernek üyelerinden birinin ya da psikoloji alanı içerisindeki bir baskı, istismar, şiddet olayında tanık ya da mağdur olmuş herhangi birinin, kamusal veya özel alanda ortaya çıkan toplumsal cinsiyet temelli etik ihlali şikâyetinde bulunması üzerine toplanır. Toplantılar en az 5 asil üyenin katılımıyla yapılır. Kurul değerlendirmesi sonucunda şikayet edilen kişi dernek üyesiyse, Üyelikten Çıkarılma şartlarını karşıladığına kanaat getirip Yönetim Kurulu'ndan bu yönde talepte bulunabilir.</p>

<h2>LGBTİ Etik Kurulu</h2>
<p><strong>Madde 29</strong></p>
<p>LGBTİ Etik Kurulu 5 asil 5 yedek üyeden oluşmak üzere dernek üyeleri arasından seçilir. LGBTİ insan hakları savunuculuğu yapan üyelerin aday olduğu kapalı oylamayla belirlenir.</p>

<p><strong>Madde 30–31</strong></p>
<p>LGBTİ Etik Kurulu, LGBTİ bireylerin psikoloji alanında şiddet, taciz, ayrımcılık gibi homofobik/bifobik ve/veya transfobik tutum ve davranışlarla karşılaşma şikâyetinde bulunması üzerine toplanır. Toplantılar 5 asil üyenin katılımıyla yapılır. Kurul, gerekli gördüğünde Yönetim Kurulu'ndan üyelikten çıkarma talebinde bulunabilir.</p>

<h2>Etik Kurulu</h2>
<p><strong>Madde 32</strong></p>
<p>Etik Kurulu 5 asil 5 yedek üyeden oluşmak üzere Genel Kurulda dernek üyeleri arasından seçilir.</p>

<p><strong>Madde 33–34</strong></p>
<p>Etik Kurulu herhangi bir üyesinin çağrısı üzerine veya psikoloji alanında yaşanan bir etik ihlale dair şikayette bulunulması üzerine toplanır. Toplantılar 5 asil üyenin katılımıyla yapılır. Kurul, yaptığı değerlendirme sonucunda Yönetim Kurulu'ndan üyelikten çıkarma talebinde bulunabilir.</p>

<h2>Şubeler</h2>
<p><strong>Madde 35</strong></p>
<p>Dernekler yasası ve dernek tüzüğüne uygun biçimde gerekli koşulları taşıyan 12 dernek üyesi, şube kurmak için Genel Yönetim Kurulu'na başvurur. Yönetim Kurulu'nun verdiği yetki ile şube kurulur.</p>

<p><strong>Madde 36</strong></p>
<p>Çalışmaları dernekler yasası ve tüzük hükümlerine uygun olmayan Şube Yönetim Kurullarına, Yönetim Kurulunca Şubeyi en geç bir ay içinde Genel Kurula götürmek üzere talimat verilir.</p>

<p><strong>Madde 37–39</strong></p>
<p>Şube Genel Kurulu iki yılda bir toplanır ve şubenin en yetkili organıdır. Şube Yönetim Kurulu 5 asıl ve 5 yedek üyeden oluşur. Şube Denetleme Kurulu Şube Genel Kurulu tarafından seçilir.</p>

<h2>Temsilcilik Açma</h2>
<p><strong>Madde 40</strong></p>
<p>Dernek, gerekli gördüğü yerlerde yönetim kurulu kararıyla temsilcilik açabilir. Temsilcilik adresi mülkî idare amirliğine yazılı olarak bildirilir. Şubeler temsilcilik açamazlar.</p>

<h2>Mali Hükümler</h2>
<p><strong>Madde 41–42</strong></p>
<p>Derneğin gelir kaynakları: üye aidatları ile bağış ve yardımlardır. Dernek gelirleri Dernekler Yasası ve Yardım Toplama Yasası hükümlerine göre toplanır.</p>

<p><strong>Madde 43–47</strong></p>
<p>Dernekte işletme hesabı esasına göre defter tutulur. Yıllık brüt gelirin belirlenen haddi aşması halinde bilanço esasına geçilir. Dernek gelirlerinin tahsilinde "Alındı Belgesi" kullanılır. Giderler fatura, perakende satış fişi veya gider makbuzu gibi belgelerle yapılır.</p>

<p><strong>Madde 48</strong></p>
<p>Derneğin bir önceki yıla ait faaliyetleri ile gelir ve gider işlemlerine ilişkin "Dernek Beyannamesi" her takvim yılının ilk dört ayı içinde ilgili mülki idare amirliğine verilir.</p>

<h2>Bildirim Yükümlülüğü</h2>
<p><strong>Madde 49</strong></p>
<p>Genel Kurul sonuç bildirimi, taşınmaz mal bildirimi, yurtdışından yardım alma bildirimi, ortak proje bildirimi ve değişiklik bildirimleri ilgili mevzuat hükümlerine uygun biçimde mülki idare amirliğine yapılır.</p>

<h2>Derneğin İç Denetimi</h2>
<p><strong>Madde 50</strong></p>
<p>Dernekte genel kurul, yönetim kurulu veya denetim kurulu tarafından iç denetim yapılabileceği gibi, bağımsız denetim kuruluşlarına da denetim yaptırılabilir. Denetim kurulu tarafından en geç yılda bir defa derneğin denetimi gerçekleştirilir.</p>

<h2>Derneğin Borçlanma Usulleri</h2>
<p><strong>Madde 51</strong></p>
<p>Dernek amacını gerçekleştirmek için ihtiyaç duyulması halinde yönetim kurulu kararı ile borçlanma yapabilir. Ancak bu borçlanma, derneğin gelir kaynakları ile karşılanamayacak miktarlarda ve derneği ödeme güçlüğüne düşürecek nitelikte yapılamaz.</p>

<h2>Tüzüğün Ne Şekilde Değiştirileceği</h2>
<p><strong>Madde 52</strong></p>
<p>Tüzük değişikliği genel kurul kararı ile yapılabilir. Genel kurulda tüzük değişikliği yapılabilmesi için genel kurula katılma ve oy kullanma hakkı bulunan üyelerin 2/3 çoğunluğu aranır. Tüzük değişikliği için gerekli olan karar çoğunluğu toplantıya katılan ve oy kullanma hakkı bulunan üyelerin oylarının 2/3'üdür.</p>

<h2>Derneğin Feshi ve Mal Varlığının Tasfiye Şekli</h2>
<p><strong>Madde 53</strong></p>
<p>Genel kurul, her zaman derneğin feshine karar verebilir. Fesih kararının alınabilmesi için gerekli olan karar çoğunluğu toplantıya katılan ve oy kullanma hakkı bulunan üyelerin oylarının 2/3'üdür.</p>
<p>Genel kurulca fesih kararı verildiğinde, derneğin para, mal ve haklarının tasfiyesi son yönetim kurulu üyelerinden oluşan tasfiye kurulunca yapılır. Tasfiye işlemleri mülki idare amirliklerince verilecek süreler hariç üç ay içinde tamamlanır. Alacakların tahsil edilmesi ve borçların ödenmesinden sonra kalan tüm para, mal ve hakları, genel kurulda belirlenen yere devredilir.</p>

<h2>Hüküm Eksikliği</h2>
<p><strong>Madde 54</strong></p>
<p>Bu tüzükte belirtilmemiş hususlarda Dernekler Kanunu, Türk Medeni Kanunu ve bu kanunlara atfen çıkartılmış olan Dernekler Yönetmeliği ve ilgili diğer mevzuatın dernekler hakkındaki hükümleri uygulanır.</p>
<p><em>Bu tüzük 54 (elli dört) maddeden ibarettir.</em></p>
`.trim();

const existing = db.prepare('SELECT id FROM sabit_sayfalar WHERE kategori=?').get('tuzuk');
if (existing) {
  db.prepare('UPDATE sabit_sayfalar SET baslik=?,icerik=?,guncelleme=datetime(\'now\') WHERE kategori=?')
    .run(baslik, icerik, 'tuzuk');
  console.log('✓ tuzuk güncellendi.');
} else {
  db.prepare('INSERT INTO sabit_sayfalar (kategori,baslik,icerik) VALUES (?,?,?)')
    .run('tuzuk', baslik, icerik);
  console.log('✓ tuzuk eklendi.');
}
