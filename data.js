/* دادهٔ ثابت جهان بازی (بدون منطق) */

export const SAVE_KEY = "aryon.medieval.v2";
export const TICK_MS = 3000;
export const RES = { food:"غذا", wood:"چوب", stone:"سنگ", gold:"طلا" };
export const RES_ICON = { food:"🌾", wood:"🪵", stone:"🪨", gold:"🪙" };


/* مختصات تقریبی (طول و عرض جغرافیایی) */
export const CITIES = {
  tehran:{n:"تهران",ll:[51.4,35.7],sp:"gold",d:"پایتخت پرجمعیت در دامنهٔ البرز؛ چهارراه تجارت شمال و جنوب."},
  isfahan:{n:"اصفهان",ll:[51.67,32.65],sp:"stone",d:"شهر پل‌ها و میدان‌ها؛ استادان سنگ‌تراش و کاشی‌کار."},
  mashhad:{n:"مشهد",ll:[59.6,36.3],sp:"gold",d:"شهری زیارتی در شرق با کاروان‌های پرشمار."},
  tabriz:{n:"تبریز",ll:[46.3,38.08],sp:"gold",d:"بازار سرپوشیده و دروازهٔ شمال‌غرب."},
  shiraz:{n:"شیراز",ll:[52.53,29.6],sp:"food",d:"باغ‌ها و تاکستان‌های پارس؛ مرکز شعر و فرهنگ."},
  ahvaz:{n:"اهواز",ll:[48.67,31.32],sp:"food",d:"دشت حاصلخیز خوزستان کنار رود کارون."},
  kerman:{n:"کرمان",ll:[57.08,30.28],sp:"stone",d:"کوه‌ها و معادن جنوب‌شرق؛ فرش و پسته."},
  kermanshah:{n:"کرمانشاه",ll:[47.06,34.31],sp:"food",d:"گذرگاه زاگرس و دشت‌های گندم."},
  rasht:{n:"رشت",ll:[49.59,37.28],sp:"food",d:"شهر باران و برنج در کرانهٔ خزر."},
  bandar:{n:"بندرعباس",ll:[56.27,27.19],sp:"gold",d:"بندر تنگهٔ هرمز؛ دروازهٔ دریا."},
  yazd:{n:"یزد",ll:[54.37,31.9],sp:"stone",d:"شهر بادگیرها و خشت در حاشیهٔ کویر."},
  qom:{n:"قم",ll:[50.88,34.64],sp:"gold",d:"شهر دینی و مسیر کاروان‌ها میان تهران و جنوب."},
  hamedan:{n:"همدان",ll:[48.5,34.8],sp:"stone",d:"شهری کهن در دامن الوند."},
  urmia:{n:"ارومیه",ll:[45.07,37.55],sp:"food",d:"باغ‌های کنار دریاچه و مرز غربی."},
  sari:{n:"ساری",ll:[53.06,36.56],sp:"wood",d:"دشت مازندران و جنگل‌های انبوه."},
  zahedan:{n:"زاهدان",ll:[60.86,29.5],sp:"stone",d:"پاسگاه دوردست جنوب‌شرق."},
  bushehr:{n:"بوشهر",ll:[50.84,28.92],sp:"gold",d:"بندر قدیمی خلیج فارس و تجارت دریایی."},
  ardabil:{n:"اردبیل",ll:[48.3,38.25],sp:"wood",d:"سرزمین سرد و کوهستانی در دامن سبلان."},
  zanjan:{n:"زنجان",ll:[48.48,36.68],sp:"stone",d:"شهر چاقوسازان و گذرگاه شمال‌غرب."},
  birjand:{n:"بیرجند",ll:[59.22,32.87],sp:"food",d:"شهر زعفران و انار در خراسان جنوبی."}
};
export const ROADS = [["tehran","qom"],["tehran","sari"],["tehran","zanjan"],["tehran","rasht"],["qom","isfahan"],["qom","hamedan"],["hamedan","kermanshah"],["hamedan","zanjan"],["zanjan","tabriz"],["zanjan","rasht"],["tabriz","urmia"],["tabriz","ardabil"],["ardabil","rasht"],["isfahan","yazd"],["isfahan","shiraz"],["isfahan","ahvaz"],["ahvaz","kermanshah"],["ahvaz","bushehr"],["bushehr","shiraz"],["shiraz","bandar"],["shiraz","kerman"],["kerman","yazd"],["kerman","bandar"],["kerman","zahedan"],["yazd","birjand"],["birjand","mashhad"],["birjand","zahedan"],["sari","mashhad"]];
export const OUTLINE = [[44,39.4],[45.5,38.9],[46.5,38.85],[48,38.45],[48.9,38.4],[49.4,37.5],[50.3,37],[51.5,36.8],[53.9,37.3],[55.5,38],[56.5,38.2],[58,37.6],[59.3,37.4],[60.3,36.6],[61.2,36.6],[60.8,34.5],[60.5,33.6],[60.9,31.5],[61.8,31.2],[61.7,29.8],[60.8,29.8],[61.4,28.9],[62.7,28.2],[62.8,26.6],[61.6,25.2],[58,25.6],[57.3,26.9],[56.3,27.1],[54.7,26.5],[52.5,27.6],[51.3,28.4],[50.2,30.1],[48.9,30.2],[48.5,29.9],[47.7,31],[47.7,32.4],[46.1,33],[45.4,34.4],[45.9,35.2],[45.4,36],[44.3,37.2],[44.2,38.3]];
export const CASPIAN = [[49.2,38.4],[50.3,37],[51.5,36.8],[53.9,37.3],[54,38.6],[53.2,40],[52,41],[51,40.5],[50.2,39.5]];
export const CAPITAL = "tehran";

/* آموزش مرحله‌ای ویلیام */
export const STEPS = [
  { t:"درود بر تو، فرمانروای جوان! من ویلیام، مشاور قلعه‌ات هستم. بیا گام‌به‌گام امپراتوری‌ات را بسازیم.", done:null },
  { t:"ابتدا روی یکی از شهرهای نقشه بزن تا اطلاعاتش را ببینی. قلعهٔ تو در تهران است (نقطهٔ قرمز).", done:"select" },
  { t:"آفرین! حالا به تب «قلعه» برو و یک «چوب‌بری» بساز. بدون چوب، هیچ ساختمانی بالا نمی‌رود.", done:"build:lumber" },
  { t:"عالی! منابع هر چند ثانیه خودکار جمع می‌شوند. حالا «مزرعه» را ارتقا بده تا غذای بیشتری بیاید.", done:"upgrade:farm" },
  { t:"اکنون به قلمرو بیندیش: شهری با حاشیهٔ سبز را که به قلعه‌ات راه دارد انتخاب کن و «تصرف» کن.", done:"claim" },
  { t:"تبریک! هر شهر تصرف‌شده در هر دور، منبع تخصصی‌اش را برایت می‌آورد. حالا پیش برو؛ همه‌چیز در دست توست. بازی خودکار ذخیره می‌شود.", done:null }
];


export const MAX_LEVEL = 5;
/* هر ساختمان یک تعریف دادهٔ مستقل دارد؛ out = منبع تولیدی، base = هزینهٔ سطح ۱، growth = ضریب رشد هزینه */
export const BUILDINGS = {
  castle:   { name:"قلعه",       icon:"🏰", desc:"سقف سطح سایر ساختمان‌ها را بالا می‌برد و دفاع پایه می‌دهد.", base:{wood:80,stone:60,gold:40}, growth:1.9 },
  farm:     { name:"مزرعه",      icon:"🌾", out:"food",  per:3, desc:"غذا تولید می‌کند.",   base:{wood:40}, growth:1.7 },
  lumber:   { name:"چوب‌بری",    icon:"🪓", out:"wood",  per:3, desc:"چوب تولید می‌کند.",   base:{food:30,gold:10}, growth:1.7 },
  quarry:   { name:"معدن سنگ",   icon:"⛏️", out:"stone", per:2, desc:"سنگ تولید می‌کند.",   base:{wood:30,food:20,gold:10}, growth:1.7 },
  market:   { name:"بازار",      icon:"🏛️", out:"gold",  per:2, desc:"با تجارت طلا می‌آورد.", base:{wood:40,stone:30,gold:20}, growth:1.7 },
  storehouse:{ name:"انبار",     icon:"📦", desc:"سقف ذخیرهٔ هر منبع را ۲۰۰ واحد بالا می‌برد.", base:{wood:50,stone:20}, growth:1.6 },
  barracks: { name:"سربازخانه",  icon:"⚔️", desc:"هر سطح ۵ سرباز به پادگان قلعه می‌افزاید.", base:{wood:60,stone:40,gold:30}, growth:1.7 },
  tower:    { name:"برج دیده‌بانی", icon:"🗼", desc:"هر سطح ۸ امتیاز دفاع می‌دهد.", base:{stone:60,wood:30,gold:20}, growth:1.7 }
};
/* زمین هر شهر: [نوع, ارزش راهبردی ۱ تا ۳]. مختصات و خطوط، تقریبی هستند و با دادهٔ جغرافیایی رسمی تطبیق داده نشده‌اند. */
export const TERRAIN = {tehran:["plain",3],isfahan:["plain",3],mashhad:["plain",3],tabriz:["mountain",2],shiraz:["plain",3],ahvaz:["plain",2],kerman:["desert",2],kermanshah:["mountain",2],rasht:["forest",2],bandar:["coast",3],yazd:["desert",2],qom:["desert",1],hamedan:["mountain",2],urmia:["mountain",2],sari:["forest",2],zahedan:["desert",1],bushehr:["coast",2],ardabil:["mountain",1],zanjan:["mountain",1],birjand:["desert",1]};
export const TERRAIN_LABEL = {plain:"دشت",mountain:"کوهستان",forest:"جنگل",desert:"کویر",coast:"ساحل"};
/* پیامد زمین: ضریب هزینهٔ تصرف */
export const TERRAIN_CLAIM_MULT = {plain:1,mountain:1.25,forest:1.1,desert:1.3,coast:1.05};
