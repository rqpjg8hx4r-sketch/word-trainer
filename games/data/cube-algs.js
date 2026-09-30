/**
 * Comprehensive Rubik's Cube Algorithm Database
 * Full 3x3 CFOP (57 OLL, 21 PLL, 24 Key F2L) & 2x2 (7 OLL, 2 PLL)
 */

(function (global) {
  const CUBE_ALGS_DATA = {
    // ----------------------------------------------------
    // 3阶 PLL (21 Cases)
    // ----------------------------------------------------
    pll: [
{
        id: "Ua",
        name: "Ua (三棱逆时针换)",
        category: "三棱换",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "M2 U' M U2 M' U' M2",
        setupRelation: "做 Ub 即可得到此形态",
        algs: [
          { name: "⭐ 顺手推荐", exp: "M2 U M U2 M' U M2", note: "M层双手极速顺手" },
          { name: "Top 1 (纯RU)", exp: "R U' R U R U R U' R' U' R2", note: "SpeedCubeDB Top 1 · 纯RU右手免翻" },
          { name: "Top 2 (备选)", exp: "y2 R2 U R U R' U' R' U' R' U R'", note: "单手/免M层" },
          { name: "Top 3 (备选)", exp: "M2 U M U2 M' U M2", note: "M层经典流派" }
        ],
        note: "顶层四角归位，后棱已归位，前、左、右三棱逆时针置换。与 Ub 互为逆公式。"
      },
      {
        id: "Ub",
        name: "Ub (三棱顺时针换)",
        category: "三棱换",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "M2 U M U2 M' U M2",
        setupRelation: "做 Ua 即可得到此形态",
        algs: [
          { name: "⭐ 顺手推荐", exp: "M2 U' M U2 M' U' M2", note: "M层经典极速" },
          { name: "Top 1 (纯RU)", exp: "R2 U R U R' U' R' U' R' U R'", note: "SpeedCubeDB Top 1 · 纯RU无M层" },
          { name: "Top 2 (备选)", exp: "y2 R' U R' U' R' U' R' U R U R2", note: "后起手" },
          { name: "Top 3 (备选)", exp: "M2 U' M U2 M' U' M2", note: "主流高频" }
        ],
        note: "顶层四角归位，后棱已归位，前、左、右三棱顺时针置换。与 Ua 互为逆公式。"
      },
      {
        id: "Aa",
        name: "Aa (三角逆时针换)",
        category: "三角换",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "x R' U R' D2 R U' R' D2 R2 x'",
        setupRelation: "做 Ab 即可得到此形态",
        algs: [
          { name: "⭐ 顺手推荐", exp: "x R2 D2 R' U' R D2 R' U R' x'", note: "经典手感流畅" },
          { name: "Top 1 (SpeedCubeDB)", exp: "x R' U R' D2 R U' R' D2 R2 x'", note: "主流右手快速指法" },
          { name: "Top 2 (免转体)", exp: "R' F R' B2 R F' R' B2 R2", note: "免大翻转体" },
          { name: "Top 3 (备选)", exp: "y' x' R2 D2 R' U' R D2 R' U R' x", note: "后视角变换" }
        ],
        note: "顶层仅三个角块置换，四棱已归位。后方两角同色，左前角不动。与 Ab 互为逆公式。"
      },
      {
        id: "Ab",
        name: "Ab (三角顺时针换)",
        category: "三角换",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "x R2 D2 R' U' R D2 R' U R' x'",
        setupRelation: "做 Aa 即可得到此形态",
        algs: [
          { name: "⭐ 顺手推荐", exp: "x R' U R' D2 R U' R' D2 R2 x'", note: "右起顺手推荐" },
          { name: "Top 1 (SpeedCubeDB)", exp: "x R2 D2 R' U' R D2 R' U R' x'", note: "主流高赞" },
          { name: "Top 2 (免转体)", exp: "R2 B2 R' F' R B2 R' F R'", note: "免转体双手" },
          { name: "Top 3 (备选)", exp: "y x' R U' R D2 R' U R D2 R2 x", note: "侧视角" }
        ],
        note: "后方两角同色，右前角不动，其余三个角块顺时针置换。与 Aa 互为逆公式。"
      },
      {
        id: "Ja",
        name: "Ja (左手 J 邻角邻棱换)",
        category: "邻角邻棱换",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "R U R' F' R U R' U' R' F R2 U' R'",
        setupRelation: "做 Jb 即可得到此形态 (Jb 与 Ja 互为逆公式)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "y' L' U' L F L' U' L U L F' L2 U L U", note: "左手镜面对称，手感极佳" },
          { name: "Top 1 (纯RU右手机)", exp: "x R2 F R F' R U2 r' F r U2 x'", note: "SpeedCubeDB Top 1 · 纯右手不换手" },
          { name: "Top 2 (经典)", exp: "y' L' U' L F L' U' L U L F' L2 U L U", note: "对称易记" },
          { name: "Top 3 (备选)", exp: "z U' R D' R2 U R' U' R2 U D R' z'", note: "转体少步" }
        ],
        note: "右侧已连成 1x1x3 完整长条，左侧邻角邻棱互换。与 Jb 互为逆公式。"
      },
      {
        id: "Jb",
        name: "Jb (右手 J 邻角邻棱换)",
        category: "邻角邻棱换",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "y' L' U' L F L' U' L U L F' L2 U L U",
        setupRelation: "做 Ja 即可得到此形态",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R U R' F' R U R' U' R' F R2 U' R'", note: "手速最快公式之一，极速连贯" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R U R' F' R U R' U' R' F R2 U' R'", note: "主流高赞" },
          { name: "Top 2 (变种)", exp: "R U2 R' U' R U2 L' U R' U' L", note: "纯RU+L" },
          { name: "Top 3 (备选)", exp: "y2 L U2 L' U' L U2 R' U L' U' R", note: "左手变种" }
        ],
        note: "左侧已连成 1x1x3 完整长条，右侧邻角邻棱互换。与 T-Perm 结构高度相似。"
      },
      {
        id: "Ra",
        name: "Ra (邻角邻棱换 A)",
        category: "邻角邻棱换",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "R' U2 R U2 R' F R U R' U' R' F' R2 U'",
        setupRelation: "做 Rb 即可得到此形态",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R U' R' U' R U R D R' U' R D' R' U2 R'", note: "下起手，指法顺滑" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R U' R' U' R U R D R' U' R D' R' U2 R'", note: "主流高赞" },
          { name: "Top 2 (F起手法)", exp: "R U R' F' R U2 R' U2 R' F R U R U2 R'", note: "免D层操作" },
          { name: "Top 3 (备选)", exp: "y' R2 F R U R U' R' F' R U2 R' U2 R", note: "纯前右手" }
        ],
        note: "左侧车灯，前棱与右角交换。与 Rb 互为逆公式，注意下起手手势。"
      },
      {
        id: "Rb",
        name: "Rb (邻角邻棱换 B)",
        category: "邻角邻棱换",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "R U' R' U' R U R D R' U' R D' R' U2 R'",
        setupRelation: "做 Ra 即可得到此形态",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R' U2 R U2 R' F R U R' U' R' F' R2 U'", note: "上起手，连贯少停顿" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R' U2 R U2 R' F R U R' U' R' F' R2 U'", note: "全球高赞主流" },
          { name: "Top 2 (D层手法)", exp: "R' U R U' R' D' R U' R' D R U R' U2 R", note: "上起手D层" },
          { name: "Top 3 (备选)", exp: "y' R2 F' R' U' R' U R F R' U2 R U2 R'", note: "免D层变种" }
        ],
        note: "后方车灯，前棱与左角交换。上起手顺手推荐。"
      },
      {
        id: "Ga",
        name: "Ga (G-Perm 1)",
        category: "G-Perm",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "R' U' R U D' R2 U R' U R U' R U' R2 D",
        setupRelation: "做 Gb 即可得到此形态",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R2 U R' U R' U' R U' R2 U' D R' U R D'", note: "下起手，指法节奏感强" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R2 U R' U R' U' R U' R2 D U' R' U R D'", note: "主流高赞" },
          { name: "Top 2 (小u层手法)", exp: "R2 u R' U R' U' R u' R2 y' R' U R", note: "双层u指法" },
          { name: "Top 3 (备选)", exp: "F2 D' L P' ...", note: "变体备选" }
        ],
        note: "左侧车灯，前两块连牢，右棱角顺换。与 Gb 互为逆公式。"
      },
      {
        id: "Gb",
        name: "Gb (G-Perm 2)",
        category: "G-Perm",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "R2 U R' U R' U' R U' R2 U' D R' U R D'",
        setupRelation: "做 Ga 即可得到此形态",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R' U' R U D' R2 U R' U R U' R U' R2 D", note: "下起手连贯顺滑" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R' U' R U D' R2 U R' U R U' R U' R2 D", note: "高赞主流解法" },
          { name: "Top 2 (双层u)", exp: "F' U' F R2 u R' U R U' R u' R2", note: "双层指法" },
          { name: "Top 3 (备选)", exp: "y R' d' F R2 u R' U R U' R u' R2", note: "转体快速" }
        ],
        note: "左侧车灯，后两块连牢。与 Ga 互为逆公式。"
      },
      {
        id: "Gc",
        name: "Gc (G-Perm 3)",
        category: "G-Perm",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "R U R' U' D R2 U R U' R' U R' U R2 D'",
        setupRelation: "做 Gd 即可得到此形态",
        algs: [
          { name: "⭐ 顺手推荐", exp: "y2 R2 F2 R U2 R U2 R' F R U R' U' R' F R2", note: "上起手，纯前右手爆发" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R2 U' R U' R U R' U R2 D' U R U' R' D", note: "高赞常规手法" },
          { name: "Top 2 (双层u)", exp: "R2 u' R U' R U R' u R2 y R U' R'", note: "双层u指法" },
          { name: "Top 3 (备选)", exp: "y2 R2 F2 R U2 R U2 R' F R U R' U' R' F R2", note: "上起手备选" }
        ],
        note: "右侧车灯，后两块连牢。与 Gd 互为逆公式。"
      },
      {
        id: "Gd",
        name: "Gd (G-Perm 4)",
        category: "G-Perm",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "y2 R2 F2 R U2 R U2 R' F R U R' U' R' F R2",
        setupRelation: "做 Gc 即可得到此形态",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R U R' U' D R2 U R U' R' U R' U R2 D'", note: "下起手，右手节奏顺手" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R U R' U' D R2 U R U' R' U R' U R2 D'", note: "全球高赞标准解" },
          { name: "Top 2 (双层u)", exp: "R U R' y' R2 u' R U' R' U R' u R2", note: "双层u快速" },
          { name: "Top 3 (备选)", exp: "R U R' F' D R2 U' R' U R U' R D' R2 F", note: "免D层变体" }
        ],
        note: "右侧车灯，前两块连牢。与 Gc 互为逆公式。"
      },
      {
        id: "T",
        name: "T-Perm (邻角对棱换)",
        category: "邻角对棱换",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "R U R' U' R' F R2 U' R' U' R U R' F'",
        setupRelation: "自互逆 (做一遍 T 即可出此形态)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R U R' U' R' F R2 U' R' U' R U R' F'", note: "CFOP最具标志性公式，自互逆" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R U R' U' R' F R2 U' R' U' R U R' F'", note: "全球第一高赞" },
          { name: "Top 2 (备选)", exp: "y2 R U R' U' R' F R2 U' R' U' R U R' F'", note: "后车灯起手" },
          { name: "Top 3 (备选)", exp: "R2 U R2 U' R2 U' D R2 U' R2 U R2 D'", note: "纯RU+D流" }
        ],
        note: "左侧车灯，右侧两角互换，前棱与后棱互换。与 J-Perm 结构高度相似，顺序不同。自互逆。"
      },
      {
        id: "F",
        name: "F-Perm (邻角对棱换)",
        category: "邻角对棱换",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
        setupRelation: "自互逆 (做一遍 F 即可出此形态)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", note: "前置R'U'F'，接T-Perm主体" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", note: "高赞经典流" },
          { name: "Top 2 (免F手法)", exp: "R' U R U' R2 F' U' F U R F R' F' R2", note: "手感紧凑" },
          { name: "Top 3 (备选)", exp: "y R' U2 R' d' R' F' R2 U' R' U R' F R U' F", note: "转体变种" }
        ],
        note: "左侧有整条同色，右侧邻角互换，前棱与左棱对换。自互逆。"
      },
      {
        id: "Y",
        name: "Y-Perm (对角邻棱换)",
        category: "对角邻棱换",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
        setupRelation: "自互逆 (做一遍 Y 即可出此形态)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "F R U' R' U' R U R' F' R U R' U' R' F R F'", note: "前半段+后半段性感转少林，自互逆" },
          { name: "Top 1 (SpeedCubeDB)", exp: "F R U' R' U' R U R' F' R U R' U' R' F R F'", note: "全球高赞标准解" },
          { name: "Top 2 (变种)", exp: "R2 U' R' U R U' x' z' R U' R' U' R' F R F'", note: "无初始F手法" },
          { name: "Top 3 (备选)", exp: "y R U' R' U' F2 U' R U R' D R2", note: "极简步数" }
        ],
        note: "顶层对角互换（左前与右后），邻棱互换（前与左）。自互逆。其前半段就是 OLL-37 的逆公式！"
      },
      {
        id: "V",
        name: "V-Perm (对角邻棱换)",
        category: "对角邻棱换",
        prob: "1/18",
        stripMode: "PLL",
        order: 3,
        setup: "R' U R U' R' f' U' R U2 R' U' R U' R' f R",
        setupRelation: "自互逆 (做一遍 V 即可出此形态)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R' U R U' R' f' U' R U2 R' U' R U' R' f R", note: "顺手连贯，自互逆" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R' U R' U' y R' F' R2 U' R' U R' F R F", note: "转体双手极速" },
          { name: "Top 2 (纯RU+D)", exp: "R U2 R' D R U' R U' R U R2 D R' U' R D2", note: "免F免转体" },
          { name: "Top 3 (备选)", exp: "R' U R U' R' f' U' R U2 R' U' R U' R' f R", note: "双层f手法" }
        ],
        note: "顶层对角互换，邻棱互换，后侧与右侧已连成 2x2 块。自互逆。"
      },
      {
        id: "Z",
        name: "Z-Perm (邻棱互换)",
        category: "邻棱换",
        prob: "1/36",
        stripMode: "PLL",
        order: 3,
        setup: "M' U' M2 U' M2 U' M' U2 M2",
        setupRelation: "自互逆 (做一遍 Z 即可出此形态)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "M' U' M2 U' M2 U' M' U2 M2", note: "M层极速，节奏连贯" },
          { name: "Top 1 (SpeedCubeDB)", exp: "M' U' M2 U' M2 U' M' U2 M2", note: "全球高赞经典M层" },
          { name: "Top 2 (纯RU手法)", exp: "y R' U' R U' R U R U' R' U R U R2 U' R' U", note: "右手免M层" },
          { name: "Top 3 (备选)", exp: "M2 U M2 U M' U2 M2 U2 M'", note: "正向M层" }
        ],
        note: "四角已归位，前棱与右棱交换，后棱与左棱交换。自互逆。"
      },
      {
        id: "E",
        name: "E-Perm (对角换)",
        category: "对角换",
        prob: "1/36",
        stripMode: "PLL",
        order: 3,
        setup: "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
        setupRelation: "自互逆 (做一遍 E 即可出此形态)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "x' R U' R' D R U R' D' R U R' D R U' R' D' x", note: "双手D层拨指，自互逆" },
          { name: "Top 1 (SpeedCubeDB)", exp: "x' R U' R' D R U R' D' R U R' D R U' R' D' x", note: "高赞经典流" },
          { name: "Top 2 (双层u)", exp: "y x' R U' R' D R U R' u2 R' U R D R' U' R", note: "双层u免连续D" },
          { name: "Top 3 (备选)", exp: "R B' R F2 R' B R F2 R2", note: "旧式短步数" }
        ],
        note: "四棱已归位，四个角块呈十字对角互换，侧面无车灯。自互逆。"
      },
      {
        id: "Na",
        name: "Na (对角对棱换 A)",
        category: "对角对棱换",
        prob: "1/72",
        stripMode: "PLL",
        order: 3,
        setup: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
        setupRelation: "自互逆 (做一遍 Na 即可出此形态)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", note: "前接Jb后接收尾，自互逆" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", note: "主流高赞" },
          { name: "Top 2 (r' D r手法)", exp: "z U' R D' R2 U R' D U' R D' R2 U R' D z'", note: "少步数" },
          { name: "Top 3 (备选)", exp: "y' R U R' U R U R' F' ...", note: "换视角" }
        ],
        note: "右侧连成对块，前与右互换，后与左互换。公式长但由 J-Perm 衍生，易记。自互逆。"
      },
      {
        id: "Nb",
        name: "Nb (对角对棱换 B)",
        category: "对角对棱换",
        prob: "1/72",
        stripMode: "PLL",
        order: 3,
        setup: "R' U R U' R' F' U' F R U R' F R' F' R U' R",
        setupRelation: "自互逆 (做一遍 Nb 即可出此形态)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R' U R U' R' F' U' F R U R' F R' F' R U' R", note: "右手紧凑顺滑" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R' U R U' R' F' U' F R U R' F R' F' R U' R", note: "全球高赞经典解" },
          { name: "Top 2 (左手对称)", exp: "L' U' L U' L' U' L F L' U' L U L F' L2 U L2 U L' U L", note: "左手流对称" },
          { name: "Top 3 (备选)", exp: "z R' U R' D R2 U' R D' z' ...", note: "转体少步" }
        ],
        note: "左侧连成对块，前与左互换，后与右互换。自互逆。"
      },
      {
        id: "H",
        name: "H-Perm (对棱换)",
        category: "对棱换",
        prob: "1/72",
        stripMode: "PLL",
        order: 3,
        setup: "M2 U' M2 U2 M2 U' M2",
        setupRelation: "自互逆 (做一遍 H 即可出此形态)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "M2 U' M2 U2 M2 U' M2", note: "M层极速爆发，全套最顺手公式之一" },
          { name: "Top 1 (SpeedCubeDB)", exp: "M2 U M2 U2 M2 U M2", note: "正向U高赞" },
          { name: "Top 2 (纯RU手法)", exp: "R2 U2 R U2 R2 U2 R2 U2 R U2 R2", note: "纯RU无M层" },
          { name: "Top 3 (备选)", exp: "M2 U' M2 U2 M2 U' M2", note: "U'回拨流" }
        ],
        note: "四角已归位，对棱互换（前后互换、左右互换）。四个侧面全是对色。自互逆。"
      }
    ],

    // ----------------------------------------------------
    // 3阶 OLL (57 Full Cases)
    // ----------------------------------------------------
    oll: [
  {
    "id": "OLL-01",
    "name": "OLL-01 (点型)",
    "category": "点型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F R' F' R U2 F R' F' R2 U2 R'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RU'2 R2'FRF' U2 R'FRF'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RU'2 R2'FRF' U2 R'FRF'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "中心仅 1 黄点，两黄点在侧。"
  },
  {
    "id": "OLL-02",
    "name": "OLL-02 (点型)",
    "category": "点型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "f R U R' U' f' F R U R' U' F'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "FRUR'U'F' fRUR'U'f'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "FRUR'U'F' fRUR'U'f'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "3黄在左，先大F后小f，极好记。"
  },
  {
    "id": "OLL-03",
    "name": "OLL-03 (点型)",
    "category": "点型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F R U R' U' F' U f R U R' U' f'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "f RUR'U' f'U'F RUR'U' F'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "f RUR'U' f'U'F RUR'U' F'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "多出的点在右，右上右下取决于是否与左边的2点构成横向梯形。"
  },
  {
    "id": "OLL-04",
    "name": "OLL-04 (点型)",
    "category": "点型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F R U R' U' F' U' f R U R' U' f'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "f RUR'U' yxR'F RUR'U' F'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "f RUR'U' yxR'F RUR'U' F'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "与 OLL-3 呈镜像，中间连结为一个正 U 拨动。"
  },
  {
    "id": "OLL-05",
    "name": "OLL-05 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r U2 R' U' R U' r'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "r' U2 RUR'U r",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "r' U2 RUR'U r",
        "note": "全球高赞标准解"
      }
    ],
    "note": "fat sune，右手双层大鱼。与 OLL-6 互为逆公式。"
  },
  {
    "id": "OLL-06",
    "name": "OLL-06 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r' U2 R U R' U r",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "r U'2 R'U'RU' r'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "r U'2 R'U'RU' r'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "fat anti-sune，与 OLL-5 互逆。"
  },
  {
    "id": "OLL-07",
    "name": "OLL-07 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r U2 R' U' R U' r'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "rUR'URU'2r'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "rUR'URU'2r'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "闪电形态。手感与 OLL-27 (Sune) 类似，但首尾为双层 r。"
  },
  {
    "id": "OLL-08",
    "name": "OLL-08 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r U R' U R U2 r'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "r'U'RU'R'U2r",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "r'U'RU'R'U2r",
        "note": "全球高赞标准解"
      }
    ],
    "note": "与 OLL-7 互为逆公式。"
  },
  {
    "id": "OLL-09",
    "name": "OLL-09 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F U R U' R' F'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RUR'U' R'FR2U R'U'F'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RUR'U' R'FR2U R'U'F'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "鱼尾型，右手顺滑。"
  },
  {
    "id": "OLL-10",
    "name": "OLL-10 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "R U2 R' F R' F' R",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RUR'U R'FRF' RU'2R'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RUR'U R'FRF' RU'2R'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "与 OLL-9 互为逆公式。"
  },
  {
    "id": "OLL-11",
    "name": "OLL-11 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "S U2 R U R' U R U2 R' U2 S'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "r' R2UR'U RU'2R'U rR'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "r' R2UR'U RU'2R'U rR'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "S U2 - anti-sune - S' 构型。"
  },
  {
    "id": "OLL-12",
    "name": "OLL-12 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "S U2 R' U' R U' R' U2 R U2 S'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "F RUR'U' F'UF RUR'U' F'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "F RUR'U' F'UF RUR'U' F'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "S U2 - sune2 - S' 构型。"
  },
  {
    "id": "OLL-13",
    "name": "OLL-13 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F U R' U' R U2 R' U' F'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "rU'r'U' rUr' F'UF",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "rU'r'U' rUr' F'UF",
        "note": "全球高赞标准解"
      }
    ],
    "note": "与 OLL-9 逆向关联 (X'=X3)。"
  },
  {
    "id": "OLL-14",
    "name": "OLL-14 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F U R U' R' 2 F'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "R'FRU R'F'R FU'F'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "R'FRU R'F'R FU'F'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "左手 OLL-9 构型。"
  },
  {
    "id": "OLL-15",
    "name": "OLL-15 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r' U' r U' R' U R r' U r",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "r'U'r R'U'RU r'Ur",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "r'U'r R'U'RU r'Ur",
        "note": "全球高赞标准解"
      }
    ],
    "note": "sune + T 结构衍生。"
  },
  {
    "id": "OLL-16",
    "name": "OLL-16 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r U r' U R U' R' r U' r'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "rUr' RUR'U' rU'r'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "rUr' RUR'U' rU'r'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "T' + sune 结构衍生。"
  },
  {
    "id": "OLL-17",
    "name": "OLL-17 (点型)",
    "category": "点型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F R' F' R U2 F R' F' R U' R U' R'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RUR'U R'FRF'U2 R'FRF'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RUR'U R'FRF'U2 R'FRF'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "性感开头接双少林，斜对角两黄点。"
  },
  {
    "id": "OLL-18",
    "name": "OLL-18 (点型)",
    "category": "点型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "R U2 R2 F R F' U2 M' U R U' r'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "F RUR'd R'U2 R'FRF'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "F RUR'd R'U2 R'FRF'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "自互逆变体，双手极速连贯。"
  },
  {
    "id": "OLL-19",
    "name": "OLL-19 (点型)",
    "category": "点型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r U R' U2 r2 U r' U r U2 r'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "MU RUR'U' M' R'FRF'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "MU RUR'U' M' R'FRF'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "fat antisune + fat sune2 组合。"
  },
  {
    "id": "OLL-20",
    "name": "OLL-20 (点型)",
    "category": "点型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r U R' U' M2 U R U' R' U' M'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "MU RUR'U' M2U RU'r'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "MU RUR'U' M2U RU'r'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "双手配合 M 层转动极快。"
  },
  {
    "id": "OLL-21",
    "name": "OLL-21 (十字型)",
    "category": "十字型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "R U2 R' U' R U R' U' R U' R'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RU'2 R'U'RUR'U' RU'R'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RU'2 R'U'RUR'U' RU'R'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "双十字，四个角块黄色均未朝上。自互逆。"
  },
  {
    "id": "OLL-22",
    "name": "OLL-22 (十字型)",
    "category": "十字型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "R' U2 R2 U R2 U R2 U2 R'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RU'2 R'2U' R2U' R'2U'2R",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RU'2 R'2U' R2U' R'2U'2R",
        "note": "全球高赞标准解"
      }
    ],
    "note": "小车形态，后方两角朝后，前方两角朝左右。"
  },
  {
    "id": "OLL-23",
    "name": "OLL-23 (十字型)",
    "category": "十字型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "R' U2 R' D' R U2 R' D R2",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "R2D' RU2 R'D RU2R",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "R2D' RU2 R'D RU2R",
        "note": "全球高赞标准解"
      }
    ],
    "note": "双头车，经典 D 层手法，指法利落。"
  },
  {
    "id": "OLL-24",
    "name": "OLL-24 (十字型)",
    "category": "十字型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r U R' U' r' F R F'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "rUR'U' r'FRF'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "rUR'U' r'FRF'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "弓箭形态，双层 r 起手接少林。"
  },
  {
    "id": "OLL-25",
    "name": "OLL-25 (十字型)",
    "category": "十字型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "R' F' r U R U' r' F",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "F' rUR'U' r'FR",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "F' rUR'U' r'FR",
        "note": "全球高赞标准解"
      }
    ],
    "note": "十字对角反向，F' 起手紧凑流畅。"
  },
  {
    "id": "OLL-26",
    "name": "OLL-26 (十字型)",
    "category": "十字型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "R U R' U R U2 R'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RU'2R'U'RU'R'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RU'2R'U'RU'R'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "Anti-Sune (逆小鱼)，鱼头朝左下角，与 Sune 互逆。"
  },
  {
    "id": "OLL-27",
    "name": "OLL-27 (十字型)",
    "category": "十字型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "R U2 R' U' R U' R'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "R'U2RUR'UR",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "R'U2RUR'UR",
        "note": "全球高赞标准解"
      }
    ],
    "note": "Sune (正小鱼)，魔方界最著名公式之一，与 Anti-Sune 互逆。"
  },
  {
    "id": "OLL-28",
    "name": "OLL-28 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "R U R' U' M' U R U' r'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "rUR'U' r'RU RU'R'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "rUR'U' r'RU RU'R'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "与 OLL-57 互为逆公式。"
  },
  {
    "id": "OLL-29",
    "name": "OLL-29 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "y S' R' F R F' U R U' R' U S",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "MU RUR'U' R'FRF' M'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "MU RUR'U' R'FRF' M'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "双手 S 层顺滑。"
  },
  {
    "id": "OLL-30",
    "name": "OLL-30 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F U R U2 R' U' R U2 R' U' F'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "FURU2 R'U'RU2 R'U'F'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "FURU2 R'U'RU2 R'U'F'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "双 U2 拨动连贯。"
  },
  {
    "id": "OLL-31",
    "name": "OLL-31 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F' U' f U R U' R' S'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "R'U'F URU'R' F'R",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "R'U'F URU'R' F'R",
        "note": "全球高赞标准解"
      }
    ],
    "note": "与 OLL-32 互逆。"
  },
  {
    "id": "OLL-32",
    "name": "OLL-32 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "S R U R' U' f' U' F",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "S RUR'U' R'FRf'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "S RUR'U' R'FRf'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "与 OLL-57 互逆；与 OLL-40 互逆。"
  },
  {
    "id": "OLL-33",
    "name": "OLL-33 (拐角/T型)",
    "category": "拐角/T型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F R' F' R U R U' R'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RUR'U' R'FRF'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RUR'U' R'FRF'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "基础 T 型 (T2)，性感转少林：(R U R' U')(R' F R F')。"
  },
  {
    "id": "OLL-34",
    "name": "OLL-34 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F U R U' R' 2 F R U R U' R'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RUR2U' R'FRU RU'F'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RUR2U' R'FRU RU'F'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "与 OLL-46 互逆。"
  },
  {
    "id": "OLL-35",
    "name": "OLL-35 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "R U2 R' F R' F' R2 U2 R'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RU'2R'2 FRF' RU'2R'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RU'2R'2 FRF' RU'2R'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "base + OLL-35 = OLL-37 衍生。"
  },
  {
    "id": "OLL-36",
    "name": "OLL-36 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "x' U' R U l' U' R' U' R U R' U R",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "R'U'RU' R'URU lU'R'U x",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "R'U'RU' R'URU lU'R'U x",
        "note": "全球高赞标准解"
      }
    ],
    "note": "少步数连贯。"
  },
  {
    "id": "OLL-37",
    "name": "OLL-37 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "R U R' U' R' F R F'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "F RU'R'U' RUR' F'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "F RU'R'U' RUR' F'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "形态与 Y-Perm 相似，公式正好是 Y-Perm 前半部分！与 T2 互逆。"
  },
  {
    "id": "OLL-38",
    "name": "OLL-38 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F R' F' R U R U' R' U' R' U' R",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RUR'U RU'R'U' R'FRF'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RUR'U RU'R'U' R'FRF'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "节奏明快。"
  },
  {
    "id": "OLL-39",
    "name": "OLL-39 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "f' r U R' U' r' F r S",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "LF'L'U'LU FU'L'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "LF'L'U'LU FU'L'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "自互逆形态 (X=X*X)。"
  },
  {
    "id": "OLL-40",
    "name": "OLL-40 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "f R' F R U R U' R' S'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "R'FRUR'U' F'UR",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "R'FRUR'U' F'UR",
        "note": "全球高赞标准解"
      }
    ],
    "note": "自互逆形态，与 OLL-32 相关联。"
  },
  {
    "id": "OLL-41",
    "name": "OLL-41 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F U R U' R' F' R U2 R' U' R U' R'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RUR'U RU2R' F RUR'U' F'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RUR'U RU2R' F RUR'U' F'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "sune + T 复合公式：(R U R' U R U2 R')(F R U R' U' F')。"
  },
  {
    "id": "OLL-42",
    "name": "OLL-42 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F U R U' R' F' R' U2 R U R' U R",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "R'U'RU' R'U2R F RUR'U' F'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "R'U'RU' R'U2R F RUR'U' F'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "antisune + T 复合公式：(R' U' R U' R' U2 R)(F R U R' U' F')。"
  },
  {
    "id": "OLL-43",
    "name": "OLL-43 (拐角/T型)",
    "category": "拐角/T型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "f' L' U' L U f",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "f' L'U'LU f",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "f' L'U'LU f",
        "note": "全球高赞标准解"
      }
    ],
    "note": "与 OLL-44 镜面对称。"
  },
  {
    "id": "OLL-44",
    "name": "OLL-44 (拐角/T型)",
    "category": "拐角/T型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "f R U R' U' f'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "f RUR'U' f'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "f RUR'U' f'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "两棱相邻翻上成小直角，小 f 单性感秒杀。"
  },
  {
    "id": "OLL-45",
    "name": "OLL-45 (拐角/T型)",
    "category": "拐角/T型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F R U R' U' F'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "F RUR'U' F'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "F RUR'U' F'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "入门 CFOP 第一条公式，大 F 单性感，上面用 F 下面用 f。"
  },
  {
    "id": "OLL-46",
    "name": "OLL-46 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "R U' R' F R' F R U R",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "R'U'R'FRF'UR",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "R'U'R'FRF'UR",
        "note": "全球高赞标准解"
      }
    ],
    "note": "与 OLL-34 互逆。"
  },
  {
    "id": "OLL-47",
    "name": "OLL-47 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "R' U' F R' F' R 2 U R",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "R'U' R'FRF' 2 UR",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "R'U' R'FRF' 2 UR",
        "note": "全球高赞标准解"
      }
    ],
    "note": "大少林变体。"
  },
  {
    "id": "OLL-48",
    "name": "OLL-48 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F R U R' U' R U R' U' F'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "F RUR'U' 2F'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "F RUR'U' 2F'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "大 F 双性感：F (R U R' U')2 F'。"
  },
  {
    "id": "OLL-49",
    "name": "OLL-49 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r' U r2 U' r2 U' r2 U r'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "rU'r2U r2Ur2U'r",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "rU'r2U r2Ur2U'r",
        "note": "全球高赞标准解"
      }
    ],
    "note": "双层 r 双步进。"
  },
  {
    "id": "OLL-50",
    "name": "OLL-50 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r U' r2 U r2 U r2 U' r",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "r'Ur2U' r2U'r2Ur'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "r'Ur2U' r2U'r2Ur'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "与 OLL-49 互为逆公式。"
  },
  {
    "id": "OLL-51",
    "name": "OLL-51 (一字/线型)",
    "category": "一字/线型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "f R U R' U' R U R' U' f'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "f RUR'U' 2f'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "f RUR'U' 2f'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "中间黄色直线，小 f 双性感秒杀。"
  },
  {
    "id": "OLL-52",
    "name": "OLL-52 (一字/线型)",
    "category": "一字/线型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "R' U' R U' R' U' F' U F R",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RUR'U Rd'RU' R'F'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RUR'U Rd'RU' R'F'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "中间已成黄色线，一角翻上一角朝侧。"
  },
  {
    "id": "OLL-53",
    "name": "OLL-53 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r' U2 R U R' U' R U R' U r",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "r'U'RU' R'URU' R'U2r",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "r'U'RU' R'URU' R'U2r",
        "note": "全球高赞标准解"
      }
    ],
    "note": "双层 r 双转向。"
  },
  {
    "id": "OLL-54",
    "name": "OLL-54 (小拐角/其它型)",
    "category": "小拐角/其它型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r U2 R' U' R U R' U' R U' r'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "rUR'U RU'R'U RU2r'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "rUR'U RU'R'U RU2r'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "与 OLL-56 互为逆公式。"
  },
  {
    "id": "OLL-55",
    "name": "OLL-55 (一字/线型)",
    "category": "一字/线型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "F R' F' U2 R U R' U R2 U2 R'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RU'2 R'2U' RU'R'U2 FRF'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RU'2 R'2U' RU'R'U2 FRF'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "中间黄色直线，四角全未翻上，右手爆发力极强。"
  },
  {
    "id": "OLL-56",
    "name": "OLL-56 (一字/线型)",
    "category": "一字/线型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r U2 R' U' R U' r' U' R U R' U' r'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "rUr'U RU'R'U RU'R' rU'r'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "rUr'U RU'R'U RU'R' rU'r'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "中间黄色直线，双层 r 夹双性感，与 OLL-54 互逆。"
  },
  {
    "id": "OLL-57",
    "name": "OLL-57 (拐角/闪电型)",
    "category": "拐角/闪电型",
    "stripMode": "OLL",
    "order": 3,
    "setup": "r U R' U' M U R U' R'",
    "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
    "algs": [
      {
        "name": "⭐ 顺手推荐",
        "exp": "RUR'U' M' URU'r'",
        "note": "精选顺手解法"
      },
      {
        "name": "Top 1 (SpeedCubeDB)",
        "exp": "RUR'U' M' URU'r'",
        "note": "全球高赞标准解"
      }
    ],
    "note": "顶层六点黄色，仅两棱未翻。公式非常连贯好记。与 OLL-28 互逆。"
  }
],

    // ----------------------------------------------------
    // 3阶 F2L 重点精解
    // ----------------------------------------------------
    f2l: [
{
        id: "F2L-01",
        name: "基本型 1 (直接入槽)",
        category: "顶层角朝侧面",
        stripMode: "F2L",
        order: 3,
        setup: "R U' R'",
        setupRelation: "做 U R U' R' 即可分离出此形态",
        algs: [
          { name: "⭐ 顺手推荐", exp: "U' R U' R' U R U R'", note: "异色藏角 · 同色公式" },
          { name: "Top 1 (SpeedCubeDB)", exp: "U' R U' R' U R U R'", note: "标准解" },
          { name: "Top 2 (备选)", exp: "y' U R' U R U' R' U' R", note: "转体入槽" }
        ],
        note: "角块在顶层，白色朝右，棱块与角块颜色不同。异色藏角，同色公式。"
      },
      {
        id: "F2L-02",
        name: "基本型 2 (左右镜像)",
        category: "左右镜像",
        stripMode: "F2L",
        order: 3,
        setup: "y L' U L y'",
        setupRelation: "左手镜像",
        algs: [
          { name: "⭐ 顺手推荐", exp: "U L' U L U' L' U' L", note: "左手同色公式，免转体" },
          { name: "Top 1 (SpeedCubeDB)", exp: "y' U R' U R U' R' U' R", note: "转体右手做" }
        ],
        note: "F2L-01 的完全镜像，掌握左手可以避免转体消耗时间。"
      },
      {
        id: "F2L-03",
        name: "顶层白朝上 1 (标准拆分)",
        category: "顶层角朝上",
        stripMode: "F2L",
        order: 3,
        setup: "R U' R' U R U' R'",
        setupRelation: "做公式逆向可还原",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R U2 R' U' R U R'", note: "U2翻转角块，顺手入槽" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R U2 R' U' R U R'", note: "全球高赞标准解" },
          { name: "Top 2 (备选)", exp: "y' R' U2 R U R' U' R", note: "后槽入位" }
        ],
        note: "角块白色朝上，棱块在顶层。做 R U2 R' 将白色翻到侧面，再常规入槽。"
      },
      {
        id: "F2L-04",
        name: "顶层白朝上 2 (角棱相连)",
        category: "顶层角朝上",
        stripMode: "F2L",
        order: 3,
        setup: "R U R' U' R U2 R'",
        setupRelation: "与公式互逆",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R U2 R' U R U' R'", note: "解离后一次入槽" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R U2 R' U R U' R'", note: "标准高赞" },
          { name: "Top 2 (备选)", exp: "y U2 L' U' L U' L' U L", note: "左手入槽" }
        ],
        note: "角块白色朝上且与棱块已连在一起但颜色不对。先用 R U2 R' 解离，再推入槽位。"
      },
      {
        id: "F2L-05",
        name: "角块进槽 1 (白朝前)",
        category: "角在底层/进槽拆解",
        stripMode: "F2L",
        order: 3,
        setup: "R U' R' U R U' R'",
        setupRelation: "进槽逆向",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R U R' U' R U R' U' R U R'", note: "三连性感秒杀，不用记新公式" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R U R' U' R U R'", note: "标准提角入槽" }
        ],
        note: "角块已在右前槽位但方向不对（白色朝前）。三次性感操作即可顺势归位。"
      },
      {
        id: "F2L-06",
        name: "角块进槽 2 (白朝右)",
        category: "角在底层/进槽拆解",
        stripMode: "F2L",
        order: 3,
        setup: "R U R' U' R U R'",
        setupRelation: "两连性感",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R U' R' U R U2 R'", note: "提角配对入槽" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R U' R' U R U2 R'", note: "高赞解法" }
        ],
        note: "角块在右前槽位，白色朝右。提角配对，迅速进槽。"
      }
    ],

    // ----------------------------------------------------
    // 2阶 魔方宝典 (2x2 Pocket Cube)
    // ----------------------------------------------------
    oll2: [
{
        id: "2OLL-Sune",
        name: "Sune (小鱼 1)",
        category: "2阶 OLL",
        stripMode: "OLL",
        order: 2,
        setup: "R U2 R' U' R U' R'",
        setupRelation: "做 Anti-Sune 即可出此形态 (与 Anti-Sune 互逆)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R U R' U R U2 R'", note: "三阶正小鱼，自如秒转" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R U R' U R U2 R'", note: "全球公认最速解" },
          { name: "Top 2 (备选)", exp: "y' R' U2 R U R' U R", note: "后起手" }
        ],
        note: "顶面仅一个角块朝上，左前角黄色朝前。与 Anti-Sune 互为逆公式。"
      },
      {
        id: "2OLL-AntiSune",
        name: "Anti-Sune (小鱼 2)",
        category: "2阶 OLL",
        stripMode: "OLL",
        order: 2,
        setup: "R U R' U R U2 R'",
        setupRelation: "做 Sune 即可出此形态 (与 Sune 互逆)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R U2 R' U' R U' R'", note: "三阶逆小鱼，顺手无滞" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R U2 R' U' R U' R'", note: "全球高赞主流" },
          { name: "Top 2 (备选)", exp: "y' R' U' R U' R' U2 R", note: "后手抗翻" }
        ],
        note: "顶面仅一个角块朝上，右前角黄色朝右。与 Sune 互为逆公式。"
      },
      {
        id: "2OLL-Pi",
        name: "Pi (双头车)",
        category: "2阶 OLL",
        stripMode: "OLL",
        order: 2,
        setup: "F R U R' U' R U R' U' F'",
        setupRelation: "自互逆",
        algs: [
          { name: "⭐ 顺手推荐", exp: "F R U R' U' R U R' U' F'", note: "大F双性感，极其好记" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R U2 R' U' R U R' U2 R U' R'", note: "纯RU双手流" },
          { name: "Top 2 (双性感)", exp: "F R U R' U' R U R' U' F'", note: "好记高赞" }
        ],
        note: "顶面无黄色朝上，后两角朝后，前两角朝外。大 F 接双性感直接还原。"
      },
      {
        id: "2OLL-H",
        name: "H (四向外/四角翻)",
        category: "2阶 OLL",
        stripMode: "OLL",
        order: 2,
        setup: "R2 U2 R' U2 R2",
        setupRelation: "自互逆",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R2 U2 R' U2 R2", note: "极简五步，自互逆！" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R2 U2 R U2 R2", note: "高赞解法" },
          { name: "Top 2 (备选)", exp: "F R U R' U' R U R' U' R U R' U' F'", note: "三性感" }
        ],
        note: "顶面无黄色朝上，前后各有两点朝外。超短公式 R2 U2 R' U2 R2，自互逆。"
      },
      {
        id: "2OLL-U",
        name: "U / P (双黄并列)",
        category: "2阶 OLL",
        stripMode: "OLL",
        order: 2,
        setup: "F R U R' U' F'",
        setupRelation: "与公式互逆",
        algs: [
          { name: "⭐ 顺手推荐", exp: "F R U R' U' F'", note: "三阶基础大F单性感" },
          { name: "Top 1 (SpeedCubeDB)", exp: "F R U R' U' F'", note: "全球高赞第一" },
          { name: "Top 2 (备选)", exp: "R U2 R2 U' R2 U' R2 U2 R", note: "纯RU" }
        ],
        note: "顶面已有两个黄色朝上并列在后方，前方两黄色朝前。F(R U R' U')F' 直接搞定。"
      },
      {
        id: "2OLL-T",
        name: "T (对视)",
        category: "2阶 OLL",
        stripMode: "OLL",
        order: 2,
        setup: "F' R U R' U' R' F R",
        setupRelation: "做 L 即可出此形态 (与 L 互逆)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R U R' U' R' F R F'", note: "三阶T2少林，与L互逆" },
          { name: "Top 1 (SpeedCubeDB)", exp: "R U R' U' R' F R F'", note: "高赞第一" },
          { name: "Top 2 (备选)", exp: "y R' U' R U R B' R' B", note: "后起手" }
        ],
        note: "顶面两个黄色并列，另外两点向两侧对视。公式就是三阶 T2（性感转少林）。与 L 互逆。"
      },
      {
        id: "2OLL-L",
        name: "L (斜角)",
        category: "2阶 OLL",
        stripMode: "OLL",
        order: 2,
        setup: "R U R' U' R' F R F'",
        setupRelation: "做 T 即可出此形态 (与 T 互逆)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "F' R U R' U' R' F R", note: "F'起手少林，与T互逆" },
          { name: "Top 1 (SpeedCubeDB)", exp: "F R' F' R U R U' R'", note: "少林转性感" },
          { name: "Top 2 (备选)", exp: "y' R U2 R' U' R U R' U' R U' R'", note: "纯RU" }
        ],
        note: "顶面两个角黄色对角朝上。与 T 互为逆公式。"
      }
    ],

    pll2: [
{
        id: "2PLL-Adj",
        name: "Adj (邻角换)",
        category: "2阶 PLL",
        stripMode: "PLL",
        order: 2,
        setup: "R U R' U' R' F R2 U' R' U' R U R' F'",
        setupRelation: "自互逆 (做一遍即出形态；相当于三阶 T-Perm / J-Perm)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "R U R' U' R' F R2 U' R' U' R U R' F'", note: "三阶经典 T-Perm，自互逆" },
          { name: "Top 1 (J-Perm法)", exp: "R U R' F' R U R' U' R' F R2 U' R'", note: "Jb-Perm，极速连贯" },
          { name: "Top 2 (纯RU)", exp: "R2 U' R2 U2 y R2 U' R2", note: "二阶极简步数" }
        ],
        note: "顶层有一侧两个角块颜色相同（车灯），另一侧两角需要互换。直接做三阶 T-Perm 或 Jb-Perm！自互逆。"
      },
      {
        id: "2PLL-Opp",
        name: "Opp (对角换)",
        category: "2阶 PLL",
        stripMode: "PLL",
        order: 2,
        setup: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
        setupRelation: "自互逆 (相当于三阶 Y-Perm)",
        algs: [
          { name: "⭐ 顺手推荐", exp: "F R U' R' U' R U R' F' R U R' U' R' F R F'", note: "三阶经典 Y-Perm，自互逆" },
          { name: "Top 1 (SpeedCubeDB)", exp: "F R U' R' U' R U R' F' R U R' U' R' F R F'", note: "高赞标准解" },
          { name: "Top 2 (二阶特解)", exp: "R U' R' U' F2 U' R U R' D R2", note: "二阶竞速少步" }
        ],
        note: "顶层四个侧面均无车灯，对角两两互换。直接做三阶 Y-Perm！自互逆。"
      }
    ]
  };

  global.CUBE_ALGS_DATA = CUBE_ALGS_DATA;
})(window);
