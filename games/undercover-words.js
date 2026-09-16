/* 谁是卧底 · 家庭与双语精选词库 (130+ 组经典词对) */
const UNDERCOVER_WORD_POOLS = {
  // 1. 亲子生活与美食经典 (40 组)
  life_food: {
    name: '🍽️ 亲子生活美食',
    desc: '贴近家庭生活，简单易描述，全家老少上手即玩',
    pairs: [
      { c: '牛奶', u: '豆浆' },
      { c: '饺子', u: '包子' },
      { c: '可乐', u: '雪碧' },
      { c: '苹果', u: '梨' },
      { c: '橘子', u: '橙子' },
      { c: '汉堡', u: '披萨' },
      { c: '烤肉', u: '火锅' },
      { c: '牙刷', u: '马桶刷' },
      { c: '纸巾', u: '湿纸巾' },
      { c: '脸盆', u: '水桶' },
      { c: '枕头', u: '抱枕' },
      { c: '拖把', u: '扫把' },
      { c: '雨伞', u: '雨衣' },
      { c: '眼镜', u: '墨镜' },
      { c: '面条', u: '米线' },
      { c: '方便面', u: '挂面' },
      { c: '煎蛋', u: '荷包蛋' },
      { c: '冰淇淋', u: '冰棍' },
      { c: '饼干', u: '薯片' },
      { c: '蛋糕', u: '面包' },
      { c: '奶茶', u: '咖啡' },
      { c: '番茄酱', u: '辣椒酱' },
      { c: '洗发水', u: '沐浴露' },
      { c: '筷子', u: '刀叉' },
      { c: '铅笔', u: '圆珠笔' },
      { c: '橡皮', u: '涂改带' },
      { c: '剪刀', u: '指甲剪' },
      { c: '冰箱', u: '空调' },
      { c: '电视', u: '投影仪' },
      { c: '手机', u: 'iPad' },
      { c: '书包', u: '钱包' },
      { c: '跑鞋', u: '拖鞋' },
      { c: '围巾', u: '手套' },
      { c: '梳子', u: '镜子' },
      { c: '帽子', u: '头盔' },
      { c: '闹钟', u: '手表' },
      { c: '钥匙', u: '锁' },
      { c: '自行车', u: '滑板车' },
      { c: '地铁', u: '公交车' },
      { c: '飞机', u: '高铁' }
    ]
  },

  // 2. 自然、动物与童趣常识 (35 组)
  nature_animals: {
    name: '🌿 自然动物常识',
    desc: '丰富孩子自然认知，生动可爱，激发想象力',
    pairs: [
      { c: '蝴蝶', u: '蜜蜂' },
      { c: '企鹅', u: '鸭子' },
      { c: '海豚', u: '海狮' },
      { c: '兔子', u: '仓鼠' },
      { c: '老虎', u: '狮子' },
      { c: '猫咪', u: '狗狗' },
      { c: '太阳', u: '月亮' },
      { c: '森林', u: '公园' },
      { c: '暴雨', u: '台风' },
      { c: '闪电', u: '打雷' },
      { c: '玫瑰', u: '向日葵' },
      { c: '恐龙', u: '鳄鱼' },
      { c: '熊猫', u: '考拉' },
      { c: '蜘蛛', u: '蚂蚁' },
      { c: '金鱼', u: '鲤鱼' },
      { c: '斑马', u: '长颈鹿' },
      { c: '鹦鹉', u: '八哥' },
      { c: '鸽子', u: '麻雀' },
      { c: '雪人', u: '冰雕' },
      { c: '彩虹', u: '晚霞' },
      { c: '泥土', u: '沙子' },
      { c: '爬山', u: '徒步' },
      { c: '游泳', u: '潜水' },
      { c: '露营', u: '野餐' },
      { c: '风筝', u: '气球' },
      { c: '仙人掌', u: '芦荟' },
      { c: '瀑布', u: '喷泉' },
      { c: '北极熊', u: '企鹅' },
      { c: '猴子', u: '猩猩' },
      { c: '蜗牛', u: '乌龟' },
      { c: '荷花', u: '睡莲' },
      { c: '星星', u: '萤火虫' },
      { c: '温泉', u: '泳池' },
      { c: '篝火', u: '火把' },
      { c: '晴天', u: '阴天' }
    ]
  },

  // 3. 少儿双语口语实战库 (35 组)
  bilingual_esl: {
    name: '🇬🇧 少儿双语口语',
    desc: '中英双语标注，附带简单英语句式提示，边玩边练口语描述',
    isBilingual: true,
    pairs: [
      { c: 'Cat (猫咪)', u: 'Dog (狗狗)', hint: 'It has four legs and soft fur...' },
      { c: 'Apple (苹果)', u: 'Tomato (番茄)', hint: 'It is round and red, sweet or juicy...' },
      { c: 'Bicycle (自行车)', u: 'Motorcycle (摩托车)', hint: 'It has two wheels on the road...' },
      { c: 'Sun (太阳)', u: 'Moon (月亮)', hint: 'It shines in the sky and brings light...' },
      { c: 'Car (小轿车)', u: 'Bus (公交车)', hint: 'People ride inside it to travel...' },
      { c: 'Book (书本)', u: 'Notebook (笔记本)', hint: 'It has pages made of paper to read or write...' },
      { c: 'Rabbit (小兔子)', u: 'Hamster (小仓鼠)', hint: 'A cute small pet with soft ears and fur...' },
      { c: 'Pizza (披萨)', u: 'Hamburger (汉堡包)', hint: 'Delicious fast food enjoyed with cheese or bread...' },
      { c: 'Sea (大海)', u: 'Swimming Pool (游泳池)', hint: 'A big place full of water where you can swim...' },
      { c: 'Lion (狮子)', u: 'Tiger (老虎)', hint: 'A brave wild animal king in the forest or jungle...' },
      { c: 'Milk (牛奶)', u: 'Soy Milk (豆浆)', hint: 'A healthy white drink for breakfast...' },
      { c: 'Ice Cream (冰淇淋)', u: 'Cake (甜蛋糕)', hint: 'A sweet dessert eaten at birthday parties or summer...' },
      { c: 'Hat (圆顶帽)', u: 'Cap (鸭舌帽)', hint: 'You wear it on your head when going outside...' },
      { c: 'Pen (钢笔)', u: 'Pencil (铅笔)', hint: 'You hold it in your fingers to write homework...' },
      { c: 'Bread (面包)', u: 'Cookie (曲奇饼干)', hint: 'Baked snack made from flour, good for breakfast...' },
      { c: 'Tree (大树)', u: 'Flower (花朵)', hint: 'Growing in soil with green leaves and branches...' },
      { c: 'Fish (游鱼)', u: 'Bird (小鸟)', hint: 'An animal that moves freely in nature...' },
      { c: 'Train (火车)', u: 'Subway (地铁)', hint: 'A long vehicle running on metal tracks...' },
      { c: 'Doctor (医生)', u: 'Nurse (护士)', hint: 'A kind person working in a hospital to help patients...' },
      { c: 'Teacher (老师)', u: 'Student (学生)', hint: 'Someone you meet every weekday in school...' },
      { c: 'Clock (大挂钟)', u: 'Watch (手表)', hint: 'It tells you the exact time of day...' },
      { c: 'Guitar (木吉他)', u: 'Piano (大钢琴)', hint: 'A musical instrument that plays beautiful melodies...' },
      { c: 'Shirt (长袖衬衫)', u: 'T-shirt (短袖T恤)', hint: 'Clothes you wear on your upper body every day...' },
      { c: 'Rain (下雨)', u: 'Snow (下雪)', hint: 'Water falling from white or grey clouds above...' },
      { c: 'Football (足球)', u: 'Basketball (篮球)', hint: 'A popular ball sport played with teammates...' },
      { c: 'Summer (夏天)', u: 'Winter (冬天)', hint: 'A season with very special weather and clothes...' },
      { c: 'Bed (大床)', u: 'Sofa (沙发)', hint: 'Comfortable furniture where you lie down to rest...' },
      { c: 'King (国王)', u: 'Queen (王后)', hint: 'A noble royal leader wearing a golden crown...' },
      { c: 'Mountain (高山)', u: 'Hill (小山丘)', hint: 'High land rising above the ground in nature...' },
      { c: 'River (河流)', u: 'Lake (湖泊)', hint: 'Calm or flowing natural water on Earth...' },
      { c: 'Shoes (运动鞋)', u: 'Socks (棉袜子)', hint: 'Things you wear on your feet before walking outside...' },
      { c: 'Cup (水杯)', u: 'Bowl (瓷碗)', hint: 'An everyday dish used during breakfast or dinner...' },
      { c: 'Elephant (大象)', u: 'Giraffe (长颈鹿)', hint: 'A huge impressive animal you see in the zoo...' },
      { c: 'Star (星星)', u: 'Diamond (钻石)', hint: 'Sparkling and shining like bright little lights...' },
      { c: 'Door (大门)', u: 'Window (窗户)', hint: 'A part of a room that can be opened or closed...' }
    ]
  },

  // 4. 角色反差与爆笑幽默 (20 组)
  humor_roles: {
    name: '🎭 趣味反差搞笑',
    desc: '反差强烈，斗智斗勇，充满戏剧性欢笑',
    pairs: [
      { c: '孙悟空', u: '猪八戒' },
      { c: '班主任', u: '辅导员' },
      { c: '同学', u: '同桌' },
      { c: '保安', u: '保镖' },
      { c: '警察', u: '小偷' },
      { c: '奥特曼', u: '怪兽' },
      { c: '情人节', u: '光棍节' },
      { c: '灰姑娘', u: '白雪公主' },
      { c: '爸爸', u: '妈妈' },
      { c: '哥哥', u: '弟弟' },
      { c: '鼠目寸光', u: '井底之蛙' },
      { c: '语无伦次', u: '词不达意' },
      { c: '喜羊羊', u: '灰太狼' },
      { c: '汤姆猫', u: '杰瑞鼠' },
      { c: '皇帝', u: '大臣' },
      { c: '超人', u: '蝙蝠侠' },
      { c: '举一反三', u: '触类旁通' },
      { c: '盲人摸象', u: '刻舟求剑' },
      { c: '零花钱', u: '压岁钱' },
      { c: '暑假作业', u: '寒假作业' }
    ]
  }
};

// 导出或挂载至全局
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UNDERCOVER_WORD_POOLS;
} else if (typeof window !== 'undefined') {
  window.UNDERCOVER_WORD_POOLS = UNDERCOVER_WORD_POOLS;
}
