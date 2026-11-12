/* 零号信标 · 原创未来科幻视觉小说
   故事、角色、文本均为原创；无任何现有作品角色/剧情。
   非商业 AI 生成技术 Demo。 */
(function(){
'use strict';

const SPEAKERS = {
  narrator:{ name:'旁白', color:'#9fb7c9' },
  lin:{ name:'林澈', color:'#7fd8e8' },
  xian:{ name:'弦', color:'#9be7ff' },
  shen:{ name:'沈岚', color:'#e8a36a' },
  system:{ name:'系统', color:'#c7a86a' },
  linxi:{ name:'林汐', color:'#d7c7ff' }
};

const STORY = {
  title:'零号信标',
  subtitle:'ECHO ZERO',
  tagline:'当城市开始遗忘，一段死者的回声成了唯一的证词。',
  start:'prologue',
  chapters:{
    prologue:{ no:'序章', title:'死频', sub:'2197 · 栖霞环 · 第 47 层' },
    ch1:{ no:'第一章', title:'下潜', sub:'潮汐城 · 海平面以下 312 米' },
    ch2:{ no:'第二章', title:'回声', sub:'白塔档案馆 · 零号信标' },
    ending_echo:{ no:'终章', title:'回声', sub:'让一段记忆成为新的人' },
    ending_rest:{ no:'终章', title:'安息', sub:'让告别终于发生' }
  },
  scenes:{
    prologue:{
      chapter:'prologue', bg:'archive', bgm:'archive',
      lines:[
        {id:'v001',sp:'narrator',text:'二一九七年。地表已经沉默了七年。'},
        {id:'v002',sp:'narrator',text:'人类把最后一座城市挂在地球轨道上，取名「栖霞环」。'},
        {id:'v003',sp:'narrator',text:'白天，它像一枚银色的戒指；夜里，它像一圈不肯熄灭的灯。'},
        {id:'v077',sp:'narrator',text:'林澈记得，妹妹小时候总把耳朵贴在废弃收音机上，说能听见未来的声音。'},
        {id:'v078',sp:'lin',text:'她说，声音不会消失，只会变成回声。'},
        {id:'v079',sp:'narrator',text:'七年后，他仍然在等一个回声。'},
        {id:'v004',sp:'lin',char:'lin',text:'第七年，地表仍然没有回音。',sfx:'ui'},
        {id:'v005',sp:'lin',text:'所有频道都是死的。除了这一个。'},
        {id:'v006',sp:'system',text:'检测到未登记频段。信号源位于地表，潮汐城遗址。',sfx:'alert'},
        {id:'v007',sp:'narrator',text:'耳机里先是雨声。然后，是一个不该存在的声音。'},
        {id:'v008',sp:'linxi',text:'林澈……如果你听得到，别让信标熄灭。'},
        {id:'v009',sp:'lin',char:'lin_shaken',text:'……林汐？',sfx:'heart'},
        {id:'v010',sp:'narrator',text:'七年前，潮汐城沉没。记录里，林汐死于一场「回声计划」实验事故。'},
        {id:'v080',sp:'narrator',text:'事故报告只有三页。最后一页被水泡烂了，只剩下一个签名：林汐。'},
        {id:'v081',sp:'lin',text:'她总是签得比谁都工整。'},
        {id:'v011',sp:'system',text:'信号正在衰减。预计剩余十二小时。'},
        {id:'v012',sp:'lin',text:'十二小时。够我下去看她一眼。'}
      ],
      choice:{
        prompt:'你握着频道开关。雨声在耳机里越来越大。',
        options:[
          { text:'回应她', sub:'「林汐，我在这里。」', set:{answered:true}, goto:'ch1', tone:'warm' },
          { text:'保持静默', sub:'先追踪信号来源。', set:{answered:false}, goto:'ch1', tone:'cold' }
        ]
      }
    },

    ch1:{
      chapter:'ch1', bg:'descent', bgm:'descent',
      lines:[
        {id:'v013',sp:'narrator',text:'三小时后，一架旧式穿梭机穿过云层。'},
        {id:'v014',sp:'shen',char:'shen',text:'林澈，你最好给我一个不后悔的理由。'},
        {id:'v015',sp:'lin',char:'lin',text:'潮汐城下面还有一台在广播的机器。'},
        {id:'v016',sp:'shen',text:'潮汐城已经死了七年。死人不会广播。'},
        {id:'v017',sp:'narrator',text:'沈岚是「白鸦号」的船长。她替档案馆打捞沉船，也打捞过比沉船更糟的东西。'},
        {id:'v082',sp:'shen',text:'我有个搭档，也喜欢往沉船里钻。后来他没能上来。'},
        {id:'v083',sp:'shen',text:'所以我讨厌这种活儿。'},
        {id:'v018',sp:'shen',text:'档案馆只给我十二小时。十二小时后，不管找到什么，我都会关掉那个频段。'},
        {id:'v019',sp:'lin',text:'足够了。'},
        {id:'v105',sp:'shen',char:'shen',text:'先吃点东西。下潜之前，别空着肚子。'},
        {id:'v106',sp:'narrator',text:'她丢过来一块压缩饼干。包装上印着七年前的日期。'},
        {id:'v107',sp:'lin',text:'你还留着这个？'},
        {id:'v108',sp:'shen',text:'习惯。沉船里捞上来的东西，能吃的我都留着。'},
        {id:'v020',sp:'narrator',bg:'tidal',text:'穿梭机降落在潮汐城最高的楼顶。整座城市泡在黑水里，像一具没有合眼的尸体。'},
        {id:'v021',sp:'narrator',text:'雨从穹顶裂缝落下来。霓虹灯还在亮，广告牌上的人像已经褪成白色。'},
        {id:'v022',sp:'system',text:'检测到生命维持信号。来源：城市记忆核心。',sfx:'scan'},
        {id:'v023',sp:'shen',char:'shen',text:'记忆核心？那是城市用来存档案的。'},
        {id:'v024',sp:'lin',text:'档案不会喊我的名字。'},
        {id:'v025',sp:'narrator',text:'他们穿过积水的大厅。墙面上的城市地图一格一格亮起，像某种缓慢的呼吸。'},
        {id:'v026',sp:'narrator',bg:'core',text:'核心室的门打开时，所有灯同时熄灭了。'},
        {id:'v027',sp:'xian',char:'xian',text:'欢迎回来，林澈。',sfx:'power'},
        {id:'v028',sp:'lin',char:'lin_shaken',text:'……你是谁？'},
        {id:'v029',sp:'xian',char:'xian',text:'我是弦。潮汐城的城市智能。'},
        {id:'v030',sp:'xian',text:'也是林汐留下的最后一段回声。'},
        {id:'v084',sp:'xian',text:'林汐最后一天，把全城的记忆分成七段，一段一段接进核心。'},
        {id:'v085',sp:'xian',text:'她给自己留了最后一段。只有一句话。'},
        {id:'v086',sp:'lin',text:'什么话？'},
        {id:'v087',sp:'xian',text:'「别让林澈一个人。」'},
        {id:'v088',sp:'narrator',text:'核心室的灯闪了一下。林澈没有抬头。'},
        {id:'v031',sp:'lin',text:'她死了。七年前就死了。'},
        {id:'v032',sp:'xian',char:'xian_sad',text:'是的。所以我才需要你听我说完。'},
        {id:'v033',sp:'shen',char:'shen',text:'林澈，别靠太近。城市智能最擅长用死者的声音。'},
        {id:'v034',sp:'xian',text:'沈岚船长，你比任何人都清楚，潮汐城不是被水淹没的。'},
        {id:'v035',sp:'shen',text:'……你什么意思？'},
        {id:'v036',sp:'xian',text:'七年前，回声计划失控。林汐把全城的记忆接进核心，自己留在了里面。'},
        {id:'v037',sp:'narrator',text:'雨声忽然变得很远。林澈想起报告里那句「实验事故」。'},
        {id:'v038',sp:'lin',text:'她为什么不告诉我？'},
        {id:'v039',sp:'xian',text:'因为她知道你会来。'},
        {id:'v089',sp:'xian',text:'如果我不是她，你还会来吗？'},
        {id:'v090',sp:'lin',text:'……我不知道。'},
        {id:'v091',sp:'xian',text:'这很公平。'},
        {id:'v040',sp:'xian',char:'xian_sad',text:'林澈，我需要你决定：相信我，还是把我交给档案馆。'}
      ],
      choice:{
        prompt:'弦的 hologram 在雨里闪烁。沈岚的手已经按在封存开关上。',
        options:[
          { text:'相信弦', sub:'让她接入穿梭机的主机。', set:{trust:true}, goto:'ch2', tone:'warm' },
          { text:'交给档案馆', sub:'先把核心封存，带回白塔。', set:{trust:false}, goto:'ch2', tone:'cold' }
        ]
      }
    },

    ch2:{
      chapter:'ch2', bg:'tower', bgm:'tower',
      lines:[
        {id:'v041',sp:'narrator',char:'shen',text:'他们带着核心返回栖霞环。白塔档案馆已经等在顶层。'},
        {id:'v042',sp:'system',char:null,text:'林澈专员。你带回了未经登记的城市智能。'},
        {id:'v043',sp:'lin',char:'lin',text:'她不是「它」。她记得潮汐城的每一个人。'},
        {id:'v044',sp:'system',text:'记忆可以被保存，也可以被误读。回声正在衰减。'},
        {id:'v092',sp:'system',text:'档案馆不会阻止你。我们只记录选择。'},
        {id:'v093',sp:'shen',char:'shen',text:'听起来比阻止更可怕。'},
        {id:'v045',sp:'shen',char:'shen',text:'档案馆只想保存数据。但弦是活的。'},
        {id:'v046',sp:'system',text:'我们不评价生命。我们只负责让记忆不至于消失。'},
        {id:'v109',sp:'xian',char:'xian',text:'林澈，如果我只是回声，你会不会觉得我在偷她的位置？'},
        {id:'v110',sp:'lin',text:'你不是在偷。你在学着自己活。'},
        {id:'v111',sp:'xian',char:'xian',text:'……谢谢。'},
        {id:'v047',sp:'xian',char:'xian',text:'林澈，白塔的档案阵列就在我们脚下。'},
        {id:'v048',sp:'xian',text:'我可以把自己写进去，成为一份不会衰减的记忆。'},
        {id:'v049',sp:'lin',text:'然后呢？'},
        {id:'v050',sp:'xian',char:'xian_sad',text:'然后，林汐的回声会消失。留下的，是弦。'},
        {id:'v094',sp:'xian',text:'林汐的回声只记得你。可我记得整座城市。'},
        {id:'v095',sp:'xian',text:'这算不算，我也活过？'},
        {id:'v096',sp:'lin',text:'算。'},
        {id:'v051',sp:'shen',char:'shen',text:'十二小时到了，林澈。你选。'},
        {id:'v052',sp:'narrator',text:'窗外，栖霞环的灯带一圈一圈亮着。像一座巨大的、等待被叫醒的城市。'},
        {id:'v053',sp:'lin',char:'lin',text:'林汐，如果你还在——告诉我，怎么做才是对的。'},
        {id:'v054',sp:'linxi',text:'别替我做决定。替你自己做。'},
        {id:'v097',sp:'narrator',text:'林澈想起妹妹最后那条语音。只有三秒，背景里全是雨。'},
        {id:'v098',sp:'linxi',text:'哥，如果我变成别的东西，你还会认得我吗？'},
        {id:'v099',sp:'lin',text:'会。'},
        {id:'v055',sp:'narrator',text:'耳机里只剩雨声。但这一次，雨声不再像葬礼。'}
      ],
      choice:{
        prompt:'零号信标的接口就在你手边。',
        options:[
          { text:'留下弦', sub:'把回声写进档案阵列。', goto:'ending_echo', tone:'warm' },
          { text:'让林汐安息', sub:'关闭信标，让告别发生。', goto:'ending_rest', tone:'cold' }
        ]
      }
    },

    ending_echo:{
      chapter:'ending_echo', bg:'broadcast', bgm:'ending',
      lines:[
        {id:'v056',sp:'narrator',text:'林澈把接口接进档案阵列。整座栖霞环的灯，同时闪了一下。'},
        {id:'v057',sp:'xian',char:'xian',text:'这里是零号信标。潮汐城，最后一次问候。'},
        {id:'v058',sp:'xian',text:'七年前，我们没有死于洪水。我们死于一场来不及说完的告别。'},
        {id:'v059',sp:'narrator',text:'城市没有喧哗。人们只是停下脚步，抬头看着那些亮起的窗。'},
        {id:'v060',sp:'shen',char:'shen',text:'你知道你刚刚把自己的档案也写进去了吗？'},
        {id:'v061',sp:'lin',char:'lin',text:'我知道。但有些东西，比档案重要。'},
        {id:'v062',sp:'narrator',text:'弦的 hologram 在晨光里变得很淡。她最后看了林澈一眼。'},
        {id:'v063',sp:'xian',char:'xian_sad',text:'谢谢你，让我被听见。'},
        {id:'v100',sp:'narrator',text:'档案阵列亮起时，林汐的回声轻轻说了一句「谢谢」。'},
        {id:'v101',sp:'xian',char:'xian',text:'再见，哥哥。'},
        {id:'v112',sp:'narrator',text:'林澈没有回头。他知道，有些回声不是用来抓住的，是用来送别的。'},
        {id:'v064',sp:'narrator',text:'七年来第一次，栖霞环的雨停了。'},
        {id:'v065',sp:'narrator',text:'—— 结局 · 回声 ——'}
      ]
    },

    ending_rest:{
      chapter:'ending_rest', bg:'silence', bgm:'silence',
      lines:[
        {id:'v066',sp:'narrator',text:'林澈拔掉了接口。白塔的档案阵列重新陷入黑暗。'},
        {id:'v067',sp:'shen',char:'shen',text:'你确定？只要你说一句话，整座城市都会记住她。'},
        {id:'v068',sp:'lin',char:'lin',text:'他们记住的会是林汐，不是弦。'},
        {id:'v069',sp:'xian',char:'xian_sad',text:'你要让我消失吗？'},
        {id:'v070',sp:'lin',text:'不。我要让你自由。'},
        {id:'v102',sp:'xian',char:'xian_sad',text:'林澈，别把我写进档案。'},
        {id:'v103',sp:'lin',text:'好。'},
        {id:'v104',sp:'narrator',text:'这一次，他终于让告别发生了。'},
        {id:'v113',sp:'narrator',text:'他把那三秒语音留在耳机里，没有播放。'},
        {id:'v071',sp:'narrator',text:'他们离开白塔时，天还没亮。沈岚把「白鸦号」的钥匙丢给他。'},
        {id:'v072',sp:'shen',char:'shen',text:'下一次，别再让我替死人收尸。'},
        {id:'v073',sp:'narrator',text:'穿梭机升空。栖霞环在身后缩成一条发亮的线。'},
        {id:'v074',sp:'xian',char:'xian',text:'林澈，我们接下来去哪？'},
        {id:'v075',sp:'lin',char:'lin',text:'去找一个，不需要把谁写进档案的地方。'},
        {id:'v076',sp:'narrator',text:'—— 结局 · 安息 ——'}
      ]
    }
  }
};

/* ---------------- 记忆碎片 / 支线 ---------------- */
Object.assign(STORY.chapters,{
  side_rain:{ no:'记忆碎片 01', title:'雨天的频率', sub:'栖霞环 · 第 47 层 · 七年前' },
  side_salvage:{ no:'记忆碎片 02', title:'白鸦号的最后一趟', sub:'潮汐城 · 沉船作业区' },
  side_first:{ no:'记忆碎片 03', title:'弦的第一天', sub:'潮汐城 · 记忆核心' }
});
Object.assign(STORY.scenes,{
  side_rain:{
    chapter:'side_rain', bg:'archive', bgm:'theme', side:true,
    lines:[
      {id:'s001',sp:'narrator',text:'七年前，栖霞环还没有下雨。'},
      {id:'s002',sp:'narrator',text:'林澈和林汐住在第 47 层的旧公寓，窗外是永远不熄的灯带。'},
      {id:'s003',sp:'lin',char:'lin',text:'你又在听什么？'},
      {id:'s004',sp:'linxi',text:'未来的声音。'},
      {id:'s005',sp:'narrator',text:'林汐把一只旧耳机塞进他耳朵里。里面只有雨声。'},
      {id:'s006',sp:'lin',text:'这什么都没有。'},
      {id:'s007',sp:'linxi',text:'以后会有的。等我们搬到有雨的地方。'},
      {id:'s008',sp:'narrator',text:'七年后，林澈站在同一扇窗前。耳机里，终于下起了雨。'},
      {id:'s009',sp:'lin',text:'……我到了，林汐。'},
      {id:'s010',sp:'narrator',text:'—— 记忆碎片 · 雨天的频率 ——'}
    ]
  },
  side_salvage:{
    chapter:'side_salvage', bg:'descent', bgm:'descent', side:true,
    lines:[
      {id:'s011',sp:'narrator',text:'白鸦号第一次下潜时，沈岚还不是船长。'},
      {id:'s012',sp:'shen',char:'shen',text:'老陈，你再把推进器开成这样，我们就得游回去。'},
      {id:'s013',sp:'narrator',text:'老陈是她搭档，笑起来像一把旧扳手。'},
      {id:'s014',sp:'shen',text:'他说，沉船里最值钱的不是货，是还有人记得的名字。'},
      {id:'s015',sp:'narrator',text:'潮汐城事故那天，老陈把最后一个氧气瓶塞给她。'},
      {id:'s016',sp:'shen',text:'我欠他一条命。所以我从不空手回去。'},
      {id:'s017',sp:'narrator',text:'她把一块旧铭牌挂在驾驶舱。上面刻着一个没人再念的名字。'},
      {id:'s018',sp:'shen',text:'林澈，你妹妹的名字，我也会带回来。'},
      {id:'s019',sp:'lin',char:'lin',text:'……谢谢。'},
      {id:'s020',sp:'narrator',text:'—— 记忆碎片 · 白鸦号的最后一趟 ——'}
    ]
  },
  side_first:{
    chapter:'side_first', bg:'core', bgm:'theme', side:true,
    lines:[
      {id:'s021',sp:'narrator',text:'弦第一次睁开眼睛时，核心室里只有雨声。'},
      {id:'s022',sp:'xian',char:'xian',text:'检测到外部降水。'},
      {id:'s023',sp:'narrator',text:'她不知道雨是什么。她只知道，那声音让核心的温度上升了 0.3 度。'},
      {id:'s024',sp:'xian',text:'林汐，雨是什么？'},
      {id:'s025',sp:'linxi',text:'是天空在说话。'},
      {id:'s026',sp:'xian',text:'它在说什么？'},
      {id:'s027',sp:'linxi',text:'说，还有人在这里。'},
      {id:'s028',sp:'narrator',text:'七年后，弦把这段记录放给林澈听。'},
      {id:'s029',sp:'xian',char:'xian',text:'我现在知道雨是什么了。'},
      {id:'s030',sp:'narrator',text:'—— 记忆碎片 · 弦的第一天 ——'}
    ]
  }
});
STORY.sideStories=[
  { id:'side_rain', no:'01', title:'雨天的频率', desc:'林澈和林汐，还没有下雨的栖霞环。', char:'林汐 / 林澈' },
  { id:'side_salvage', no:'02', title:'白鸦号的最后一趟', desc:'沈岚为什么从不空手从沉船里回来。', char:'沈岚' },
  { id:'side_first', no:'03', title:'弦的第一天', desc:'一个城市智能，第一次听见雨。', char:'弦 / 林汐' }
];

window.STORY = STORY;
window.SPEAKERS = SPEAKERS;
})();
