/**
 * Comprehensive Rubik's Cube Algorithm Database (100% WCA & CubeSim Verified)
 * Full 3x3 CFOP (57 OLL, 21 PLL, 6 Key F2L) & 2x2 (7 OLL, 2 PLL)
 */

(function (global) {
  const CUBE_ALGS_DATA = {
  "pll": [
    {
      "id": "Ua",
      "name": "Ua (三棱逆时针换)",
      "category": "三棱换",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "顶层四角归位，后棱归位，前、左、右三棱逆时针置换。与 Ub 互为逆公式。",
      "setupRelation": "做 Ub 即可得到此形态",
      "setup": "R2 U R U R' U' R' U' R' U R'",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U' R U R U R U' R' U' R2",
          "setup": "R2 U R U R' U' R' U' R' U R'",
          "note": "纯RU双手极速流畅"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "M2 U M U2 M' U M2",
          "setup": "M2 U' M U2 M' U' M2",
          "note": "M层高赞标准解"
        },
        {
          "name": "Top 2 (纯RU)",
          "exp": "R U' R U R U R U' R' U' R2",
          "setup": "R2 U R U R' U' R' U' R' U R'",
          "note": "右手免翻"
        },
        {
          "name": "Top 3 (后起手)",
          "exp": "y2 R2 U' R' U' R U R U R U' R",
          "setup": "R' U R' U' R' U' R' U R U R2 y2",
          "note": "后手顺指"
        }
      ]
    },
    {
      "id": "Ub",
      "name": "Ub (三棱顺时针换)",
      "category": "三棱换",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "顶层四角归位，后棱归位，前、左、右三棱顺时针置换。与 Ua 互为逆公式。",
      "setupRelation": "做 Ua 即可得到此形态",
      "setup": "M2 U M U2 M' U M2",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "M2 U' M U2 M' U' M2",
          "setup": "M2 U M U2 M' U M2",
          "note": "M层极速爆发"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "M2 U' M U2 M' U' M2",
          "setup": "M2 U M U2 M' U M2",
          "note": "M层高赞第一"
        },
        {
          "name": "Top 2 (纯RU)",
          "exp": "R2 U R U R' U' R' U' R' U R'",
          "setup": "R U' R U R U R U' R' U' R2",
          "note": "纯RU无M层"
        },
        {
          "name": "Top 3 (后起手)",
          "exp": "y2 R' U R' U' R' U' R' U R U R2",
          "setup": "R2 U' R' U' R U R U R U' R y2",
          "note": "后手顺指"
        }
      ]
    },
    {
      "id": "Aa",
      "name": "Aa (三角逆时针换)",
      "category": "三角换",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "两角相邻已复原（车灯朝左后），另三角逆时针置换。与 Ab 互为逆公式。",
      "setupRelation": "做 Ab 即可得到此形态",
      "setup": "x R2 D2 R U R' D2 R U' R x'",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "x R' U R' D2 R U' R' D2 R2 x'",
          "setup": "x R2 D2 R U R' D2 R U' R x'",
          "note": "经典右手极速"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "x R' U R' D2 R U' R' D2 R2 x'",
          "setup": "x R2 D2 R U R' D2 R U' R x'",
          "note": "全球高赞主流"
        },
        {
          "name": "Top 2 (免转体)",
          "exp": "R' F R' B2 R F' R' B2 R2",
          "setup": "R2 B2 R F R' B2 R F' R",
          "note": "免大转体"
        }
      ]
    },
    {
      "id": "Ab",
      "name": "Ab (三角顺时针换)",
      "category": "三角换",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "两角相邻已复原（车灯朝左后），另三角顺时针置换。与 Aa 互为逆公式。",
      "setupRelation": "做 Aa 即可得到此形态",
      "setup": "x R' U R' D2 R U' R' D2 R2 x'",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "x R2 D2 R U R' D2 R U' R x'",
          "setup": "x R' U R' D2 R U' R' D2 R2 x'",
          "note": "经典手感顺滑"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "x R2 D2 R U R' D2 R U' R x'",
          "setup": "x R' U R' D2 R U' R' D2 R2 x'",
          "note": "高赞主流解"
        },
        {
          "name": "Top 2 (免转体)",
          "exp": "R2 B2 R' F' R B2 R' F R'",
          "setup": "R F' R B2 R' F R B2 R2",
          "note": "免转体流"
        }
      ]
    },
    {
      "id": "Jb",
      "name": "Jb (相邻角棱换)",
      "category": "邻角邻棱换",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "右侧完整一块已复原，互换左侧两角及左前两棱。全套 CFOP 中最顺手公式。",
      "setupRelation": "做 Ja 即可得到此形态",
      "setup": "R U R2 F' R U R U' R' F R U' R'",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' F' R U R' U' R' F R2 U' R'",
          "setup": "R U R2 F' R U R U' R' F R U' R'",
          "note": "指法连贯极佳，极速爆发"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U R' F' R U R' U' R' F R2 U' R'",
          "setup": "R U R2 F' R U R U' R' F R U' R'",
          "note": "全球高赞第1"
        },
        {
          "name": "Top 2 (纯RU)",
          "exp": "R U2 R' U' R U2 L' U R' U' L",
          "setup": "L' U R U' L U2 R' U R U2 R'",
          "note": "纯RU/L流"
        }
      ]
    },
    {
      "id": "Ja",
      "name": "Ja (相邻角棱换)",
      "category": "邻角邻棱换",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "左侧完整一块已复原，与 Jb 左右镜像对应。",
      "setupRelation": "做 Jb 即可得到此形态",
      "setup": "U' L' U' L2 F L' U' L' U L F' L' U L y",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "y' L' U' L F L' U' L U L F' L2 U L U",
          "setup": "U' L' U' L2 F L' U' L' U L F' L' U L y",
          "note": "左手顺手镜像"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "y' L' U' L F L' U' L U L F' L2 U L U",
          "setup": "U' L' U' L2 F L' U' L' U L F' L' U L y",
          "note": "标准左手解"
        },
        {
          "name": "Top 2 (纯RU右手)",
          "exp": "R' U L' U2 R U' R' U2 R L U'",
          "setup": "U L' R' U2 R U R' U2 L U' R",
          "note": "纯RU/L免大换位"
        }
      ]
    },
    {
      "id": "Rb",
      "name": "Rb (相邻角棱换 · 上起手)",
      "category": "邻角邻棱换",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "右侧车灯，前棱与右棱、前右角与后右角置换。与 Ra 互为逆公式。",
      "setupRelation": "做 Ra 即可得到此形态",
      "setup": "U R2 F R U R U' R' F' R U2 R' U2 R",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R' U2 R U2 R' F R U R' U' R' F' R2 U'",
          "setup": "U R2 F R U R U' R' F' R U2 R' U2 R",
          "note": "经典上起手，极佳流畅"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R' U2 R U2 R' F R U R' U' R' F' R2 U'",
          "setup": "U R2 F R U R U' R' F' R U2 R' U2 R",
          "note": "高赞标准上起手"
        }
      ]
    },
    {
      "id": "Ra",
      "name": "Ra (相邻角棱换 · 下起手)",
      "category": "邻角邻棱换",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "左侧车灯，前棱与左棱、前左角与后左角置换。与 Rb 互为逆公式。",
      "setupRelation": "做 Rb 即可得到此形态",
      "setup": "R U2 R D R' U R D' R' U' R' U R U R'",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U' R' U' R U R D R' U' R D' R' U2 R'",
          "setup": "R U2 R D R' U R D' R' U' R' U R U R'",
          "note": "经典下起手D层联动"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U' R' U' R U R D R' U' R D' R' U2 R'",
          "setup": "R U2 R D R' U R D' R' U' R' U R U R'",
          "note": "高赞标准下起手"
        },
        {
          "name": "Top 2 (免D层F起手)",
          "exp": "R U R' F' R U2 R' U2 R' F R U R U2 R'",
          "setup": "R U2 R' U' R' F' R U2 R U2 R' F R U' R'",
          "note": "F面起手"
        }
      ]
    },
    {
      "id": "Ga",
      "name": "Ga (三角三棱换 · 下起手)",
      "category": "G-Perm",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "前车灯，右后有复原 1x2 块。逆时针循环。",
      "setupRelation": "做 Gb 即可得到此形态",
      "setup": "D R' U' R D' U R2 U R' U R U' R U' R2",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R2 U R' U R' U' R U' R2 U' D R' U R D'",
          "setup": "D R' U' R D' U R2 U R' U R U' R U' R2",
          "note": "经典下起手，指法连贯"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R2 U R' U R' U' R U' R2 U' D R' U R D'",
          "setup": "D R' U' R D' U R2 U R' U R U' R U' R2",
          "note": "高赞标准解"
        }
      ]
    },
    {
      "id": "Gb",
      "name": "Gb (三角三棱换)",
      "category": "G-Perm",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "前车灯，前右有复原 1x2 块。顺时针循环。",
      "setupRelation": "做 Ga 即可得到此形态",
      "setup": "D' R2 U R' U R' U' R U' R2 D U' R' U R",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R' U' R U D' R2 U R' U R U' R U' R2 D",
          "setup": "D' R2 U R' U R' U' R U' R2 D U' R' U R",
          "note": "经典极速顺指"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R' U' R U D' R2 U R' U R U' R U' R2 D",
          "setup": "D' R2 U R' U R' U' R U' R2 D U' R' U R",
          "note": "高赞标准解"
        }
      ]
    },
    {
      "id": "Gc",
      "name": "Gc (三角三棱换 · 上起手)",
      "category": "G-Perm",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "右车灯，左后有复原 1x2 块。",
      "setupRelation": "做 Gd 即可得到此形态",
      "setup": "D' R U R' U' D R2 U' R U' R' U R' U R2",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R2 U' R U' R U R' U R2 D' U R U' R' D",
          "setup": "D' R U R' U' D R2 U' R U' R' U R' U R2",
          "note": "经典上起手"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R2 U' R U' R U R' U R2 D' U R U' R' D",
          "setup": "D' R U R' U' D R2 U' R U' R' U R' U R2",
          "note": "高赞解法"
        }
      ]
    },
    {
      "id": "Gd",
      "name": "Gd (三角三棱换 · 下起手)",
      "category": "G-Perm",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "右车灯，左前有复原 1x2 块。",
      "setupRelation": "做 Gc 即可得到此形态",
      "setup": "D R2 U' R U' R U R' U' R2 D' U R U' R'",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U' D R2 U R U' R' U R' U R2 D'",
          "setup": "D R2 U' R U' R U R' U' R2 D' U R U' R'",
          "note": "经典下起手"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U R' U' D R2 U R U' R' U R' U R2 D'",
          "setup": "D R2 U' R U' R U R' U' R2 D' U R U' R'",
          "note": "高赞解法"
        }
      ]
    },
    {
      "id": "T",
      "name": "T (相邻角棱换)",
      "category": "邻角邻棱换",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "左侧车灯，右侧两角互换，前棱与后棱互换。自互逆。",
      "setupRelation": "自互逆 (再做一遍 T 即可出此形态)",
      "setup": "F R U' R' U R U R2 F' R U R U' R'",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U' R' F R2 U' R' U' R U R' F'",
          "setup": "F R U' R' U R U R2 F' R U R U' R'",
          "note": "CFOP必须肌肉记忆之神技，自互逆"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U R' U' R' F R2 U' R' U' R U R' F'",
          "setup": "F R U' R' U R U R2 F' R U R U' R'",
          "note": "全球高赞第1"
        }
      ]
    },
    {
      "id": "F",
      "name": "F (相邻角棱换)",
      "category": "邻角邻棱换",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "右侧两角互换，左右两棱互换。自互逆。",
      "setupRelation": "自互逆 (再做一遍 F 即可出此形态)",
      "setup": "R' U' R U' R' U R U R2 F' R U R U' R' F U R",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
          "setup": "R' U' R U' R' U R U R2 F' R U R U' R' F U R",
          "note": "标准解，T-Perm变体"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
          "setup": "R' U' R U' R' U R U R2 F' R U R U' R' F U R",
          "note": "高赞解法"
        }
      ]
    },
    {
      "id": "Y",
      "name": "Y (对角对棱换)",
      "category": "对角对棱换",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "前左角与后右角置换，前棱与左棱置换。自互逆。",
      "setupRelation": "自互逆 (再做一遍 Y 即可出此形态)",
      "setup": "F R' F' R U R U' R' F R U' R' U R U R' F'",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F R U' R' U' R U R' F' R U R' U' R' F R F'",
          "setup": "F R' F' R U R U' R' F R U' R' U R U R' F'",
          "note": "前半少林后半性感，手感极致流畅，自互逆"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "F R U' R' U' R U R' F' R U R' U' R' F R F'",
          "setup": "F R' F' R U R U' R' F R U' R' U R U R' F'",
          "note": "全球高赞第1"
        }
      ]
    },
    {
      "id": "V",
      "name": "V (对角对棱换)",
      "category": "对角对棱换",
      "prob": "1/18",
      "stripMode": "PLL",
      "order": 3,
      "note": "前右角与后左角置换，前棱与右棱置换。自互逆。",
      "setupRelation": "自互逆 (再做一遍 V 即可出此形态)",
      "setup": "R' f' R U R' U R U2 R' U f R U R' U' R",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R' U R U' R' f' U' R U2 R' U' R U' R' f R",
          "setup": "R' f' R U R' U R U2 R' U f R U R' U' R",
          "note": "小f层连贯顺手"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R' U R U' R' f' U' R U2 R' U' R U' R' f R",
          "setup": "R' f' R U R' U R U2 R' U f R U R' U' R",
          "note": "高赞第一"
        }
      ]
    },
    {
      "id": "Z",
      "name": "Z (相邻对棱互换)",
      "category": "对棱换",
      "prob": "1/36",
      "stripMode": "PLL",
      "order": 3,
      "note": "前棱与右棱互换，后棱与左棱互换。双手绝配：右手无名指与中指持续向上双推M'2，左手食指中指持续逆时针拨U'/U'2，手势零冲突！自互逆。",
      "setupRelation": "自互逆 (再做一遍 Z 即可出此形态)",
      "setup": "M2 U2 M U M2 U M2 U M",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "M' U' M'2 U' M'2 U' M' U'2 M'2",
          "setup": "M2 U2 M U M2 U M2 U M",
          "note": "底面连续向上双推M'2+左手U'连续双拨，全推无拉手势零冲突"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "M' U' M2 U' M2 U' M' U2 M2",
          "setup": "M2 U2 M U M2 U M2 U M",
          "note": "高赞通用标准解"
        }
      ]
    },
    {
      "id": "E",
      "name": "E (四角对角换)",
      "category": "对角换",
      "prob": "1/36",
      "stripMode": "PLL",
      "order": 3,
      "note": "四角对角交叉互换，棱块完全归位。自互逆。",
      "setupRelation": "自互逆 (再做一遍 E 即可出此形态)",
      "setup": "x' D R U R' D' R U' R' D R U' R' D' R U R' x",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
          "setup": "x' D R U R' D' R U' R' D R U' R' D' R U R' x",
          "note": "经典D层交替，自互逆"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
          "setup": "x' D R U R' D' R U' R' D R U' R' D' R U R' x",
          "note": "高赞第一"
        }
      ]
    },
    {
      "id": "Na",
      "name": "Na (对角对棱换)",
      "category": "对角对棱换",
      "prob": "1/72",
      "stripMode": "PLL",
      "order": 3,
      "note": "右侧两角互换，前后两棱互换。自互逆。",
      "setupRelation": "自互逆 (再做一遍 Na 即可出此形态)",
      "setup": "R U R' U2 R U R2 F' R U R U' R' F R U' R' U' R U' R'",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
          "setup": "R U R' U2 R U R2 F' R U R U' R' F R U' R' U' R U' R'",
          "note": "Jb组合神技，自互逆"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
          "setup": "R U R' U2 R U R2 F' R U R U' R' F R U' R' U' R U' R'",
          "note": "主流高赞"
        }
      ]
    },
    {
      "id": "Nb",
      "name": "Nb (对角对棱换)",
      "category": "对角对棱换",
      "prob": "1/72",
      "stripMode": "PLL",
      "order": 3,
      "note": "左侧两角互换，左右两棱互换。自互逆。",
      "setupRelation": "自互逆 (再做一遍 Nb 即可出此形态)",
      "setup": "R' U R' F R F' R U' R' F' U F R U R' U' R",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R' U R U' R' F' U' F R U R' F R' F' R U' R",
          "setup": "R' U R' F R F' R U' R' F' U F R U R' U' R",
          "note": "经典右手流，自互逆"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R' U R U' R' F' U' F R U R' F R' F' R U' R",
          "setup": "R' U R' F R F' R U' R' F' U F R U R' U' R",
          "note": "高赞第一"
        }
      ]
    },
    {
      "id": "H",
      "name": "H (对棱互换)",
      "category": "对棱换",
      "prob": "1/72",
      "stripMode": "PLL",
      "order": 3,
      "note": "四角已归位，前后棱互换、左右棱互换。自互逆。",
      "setupRelation": "自互逆 (再做一遍 H 即可出此形态)",
      "setup": "M2 U M2 U2 M2 U M2",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "M2 U' M2 U2 M2 U' M2",
          "setup": "M2 U M2 U2 M2 U M2",
          "note": "M层极速爆发，全套最顺手公式之一"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "M2 U' M2 U2 M2 U' M2",
          "setup": "M2 U M2 U2 M2 U M2",
          "note": "高赞第一"
        },
        {
          "name": "Top 2 (纯RU手法)",
          "exp": "R2 U2 R U2 R2 U2 R2 U2 R U2 R2",
          "setup": "R2 U2 R' U2 R2 U2 R2 U2 R' U2 R2",
          "note": "纯RU无M层"
        }
      ]
    }
  ],
  "oll": [
    {
      "id": "OLL-01",
      "name": "OLL-01 (点型)",
      "category": "点型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/27",
      "setup": "F R' F' R U2 F R' F' R2 U2 R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U'2 R2' F R F' U'2 R' F R F'",
          "setup": "F R' F' R U2 F R' F' R2 U2 R'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U2 R' R' F R F' U2 R' F R F'",
          "setup": "F R' F' R U2 F R' F' R R U2 R'",
          "note": "主流标准解"
        }
      ],
      "note": "中心仅 1 黄点，两黄点在侧。左右手绝配指法：两次 U'2 均由左手食指中指连续逆时针双拨，无需换手松开右手握持！"
    },
    {
      "id": "OLL-02",
      "name": "OLL-02 (点型)",
      "category": "点型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "f U R U' R' f' F U R U' R' F'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F R U R' U' F' f R U R' U' f'",
          "setup": "f U R U' R' f' F U R U' R' F'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "r U r' U2 r U2 R' U2 R U' r'",
          "setup": "r U R' U2 R U2 r' U2 r U' r'",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "y' F R U R' U' F' f R U R' U' f'",
          "setup": "f U R U' R' f' F U R U' R' F' y",
          "note": "主流标准解"
        },
        {
          "name": "Top 3 (备选)",
          "exp": "y' F R U R' U' S R U R' U' f'",
          "setup": "f U R U' R' S' U R U' R' F' y",
          "note": "主流标准解"
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
      "prob": "1/13.5",
      "setup": "F U R U' R' F' U f U R U' R' f'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "f R U R' U' f' U' F R U R' U' F'",
          "setup": "F U R U' R' F' U f U R U' R' f'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "r' R2 U R' U r U2 r' U M'",
          "setup": "M U' r U2 r' U' R U' R2 r",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "y F U R U' R' F' U F R U R' U' F'",
          "setup": "F U R U' R' F' U' F R U R' U' F' y'",
          "note": "主流标准解"
        },
        {
          "name": "Top 3 (备选)",
          "exp": "y' f R U R' U' f' U' F R U R' U' F'",
          "setup": "F U R U' R' F' U f U R U' R' f' y",
          "note": "主流标准解"
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
      "prob": "1/13.5",
      "setup": "F U R U' R' F' U' f U R U' R' f'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "f R U R' U' f' U F R U R' U' F'",
          "setup": "F U R U' R' F' U' f U R U' R' f'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "M U' r U2 r' U' R U' R' M'",
          "setup": "M R U R' U r U2 r' U M'",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "y F U R U' R' F' U' F R U R' U' F'",
          "setup": "F U R U' R' F' U F R U R' U' F' y'",
          "note": "主流标准解"
        },
        {
          "name": "Top 3 (备选)",
          "exp": "y' f R U R' U' f' U F R U R' U' F'",
          "setup": "F U R U' R' F' U' f U R U' R' f' y",
          "note": "主流标准解"
        }
      ],
      "note": "多出的点在右，构成梯形。"
    },
    {
      "id": "OLL-05",
      "name": "OLL-05 (方块型)",
      "category": "方块型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "r' U' R U' R' U2 r",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r' U2 R U R' U r",
          "setup": "r' U' R U' R' U2 r",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "l' U2 L U L' U l",
          "setup": "l' U' L U' L' U2 l",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "y2 r' U2 R U R' U r",
          "setup": "r' U' R U' R' U2 r y2",
          "note": "主流标准解"
        }
      ],
      "note": "fat anti-sune"
    },
    {
      "id": "OLL-06",
      "name": "OLL-06 (方块型)",
      "category": "方块型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "r U R' U R U2 r'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r U2 R' U' R U' r'",
          "setup": "r U R' U R U2 r'",
          "note": "精选手感推荐解"
        }
      ],
      "note": "fat sune"
    },
    {
      "id": "OLL-07",
      "name": "OLL-07 (小闪电)",
      "category": "小闪电",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "r U2 R' U' R U' r'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r U R' U R U2 r'",
          "setup": "r U2 R' U' R U' r'",
          "note": "精选手感推荐解"
        }
      ],
      "note": "参见 OLL 27"
    },
    {
      "id": "OLL-08",
      "name": "OLL-08 (小闪电)",
      "category": "小闪电",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "r' U2 R U R' U r",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r' U' R U' R' U2 r",
          "setup": "r' U2 R U R' U r",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "l' U' L U' L' U2 l",
          "setup": "l' U2 L U L' U l",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "R U2 R' U2 R' F R F'",
          "setup": "F R' F' R U2 R U2 R'",
          "note": "主流标准解"
        },
        {
          "name": "Top 3 (备选)",
          "exp": "y2 r' U' R U' R' U2 r",
          "setup": "r' U2 R U R' U r y2",
          "note": "主流标准解"
        }
      ],
      "note": "anti-sune"
    },
    {
      "id": "OLL-09",
      "name": "OLL-09 (鱼形)",
      "category": "鱼形",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F U R U' R2 F' R U R U' R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U' R' F R2 U R' U' F'",
          "setup": "F U R U' R2 F' R U R U' R'",
          "note": "精选手感推荐解"
        }
      ],
      "note": "鱼形 1"
    },
    {
      "id": "OLL-10",
      "name": "OLL-10 (鱼形)",
      "category": "鱼形",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "R U2 R' F R' F' R U' R U' R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U R' F R F' R U2 R'",
          "setup": "R U2 R' F R' F' R U' R U' R'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "y2 r U R' U R U' R' U' r' R U R U' R'",
          "setup": "R U R' U' R' r U R U R' U' R U' r' y2",
          "note": "主流标准解"
        }
      ],
      "note": "鱼形 2"
    },
    {
      "id": "OLL-11",
      "name": "OLL-11 (小闪电)",
      "category": "小闪电",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "M U' R U2 R' U' R U' R2 r",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r' R2 U R' U R U2 R' U M'",
          "setup": "M U' R U2 R' U' R U' R2 r",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "r U R' U R' F R F' R U2 r'",
          "setup": "r U2 R' F R' F' R U' R U' r'",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "y2 r' R2 U R' U R U2 R' U M'",
          "setup": "M U' R U2 R' U' R U' R2 r y2",
          "note": "主流标准解"
        }
      ],
      "note": "小闪电 1"
    },
    {
      "id": "OLL-12",
      "name": "OLL-12 (小闪电)",
      "category": "小闪电",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F U R U' R' F' U' F U R U' R' F'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F R U R' U' F' U F R U R' U' F'",
          "setup": "F U R U' R' F' U' F U R U' R' F'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "M' R' U' R U' R' U2 R U' R r'",
          "setup": "r R' U R' U2 R U R' U R M",
          "note": "主流标准解"
        }
      ],
      "note": "小闪电 2"
    },
    {
      "id": "OLL-13",
      "name": "OLL-13 (马步/拐角)",
      "category": "马步/拐角",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F R U' R' U R U2 R' U' F'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F U R U2 R' U' R U R' F'",
          "setup": "F R U' R' U R U2 R' U' F'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "F U R U' R2 F' R U R U' R'",
          "setup": "R U R' U' R' F R2 U R' U' F'",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "r U' r' U' r U r' y' R' U R",
          "setup": "R' U' R y r U' r' U r U r'",
          "note": "主流标准解"
        }
      ],
      "note": "马步型 1"
    },
    {
      "id": "OLL-14",
      "name": "OLL-14 (马步/拐角)",
      "category": "马步/拐角",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F U F' R' F R U' R' F' R",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R' F R U R' F' R F U' F'",
          "setup": "F U F' R' F R U' R' F' R",
          "note": "精选手感推荐解"
        }
      ],
      "note": "马步型 2"
    },
    {
      "id": "OLL-15",
      "name": "OLL-15 (马步/拐角)",
      "category": "马步/拐角",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "r' U' r U' R' U R r' U r",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r' U' r R' U' R U r' U r",
          "setup": "r' U' r U' R' U R r' U r",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "l' U' l L' U' L U l' U l",
          "setup": "l' U' l U' L' U L l' U l",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "y2 r' U' r R' U' R U r' U r",
          "setup": "r' U' r U' R' U R r' U r y2",
          "note": "主流标准解"
        }
      ],
      "note": "马步型 3"
    },
    {
      "id": "OLL-16",
      "name": "OLL-16 (马步/拐角)",
      "category": "马步/拐角",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "r U r' U R U' R' r U' r'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r U r' R U R' U' r U' r'",
          "setup": "r U r' U R U' R' r U' r'",
          "note": "精选手感推荐解"
        }
      ],
      "note": "马步型 4"
    },
    {
      "id": "OLL-17",
      "name": "OLL-17 (点型)",
      "category": "点型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F R' F' R U2 F R' F' R U' R U' R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U R' F R F' U2 R' F R F'",
          "setup": "F R' F' R U2 F R' F' R U' R U' R'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "F R' F' R2 r' U R U' R' U' M'",
          "setup": "M U R U R' U' r R2 F R F'",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "y2 R U R' U R' F R F' U2 R' F R F'",
          "setup": "F R' F' R U2 F R' F' R U' R U' R' y2",
          "note": "主流标准解"
        }
      ],
      "note": "点型 3"
    },
    {
      "id": "OLL-18",
      "name": "OLL-18 (点型)",
      "category": "点型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "r' U2 R U R' U r r U2 R' U' R U' r'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r U R' U R U2 r' r' U' R U' R' U2 r",
          "setup": "r' U2 R U R' U r r U2 R' U' R U' r'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "y R U2 R' R' F R F' U2 M' U R U' r'",
          "setup": "r U R' U' M U2 F R' F' R R U2 R' y'",
          "note": "主流标准解"
        }
      ],
      "note": "点型 4"
    },
    {
      "id": "OLL-19",
      "name": "OLL-19 (点型)",
      "category": "点型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F R' F' R M U R U' R' U' M'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "M U R U R' U' M' R' F R F'",
          "setup": "F R' F' R M U R U' R' U' M'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "r' R U R U R' U' M' R' F R F'",
          "setup": "F R' F' R M U R U' R' U' R' r",
          "note": "主流标准解"
        }
      ],
      "note": "点型 5"
    },
    {
      "id": "OLL-20",
      "name": "OLL-20 (点型)",
      "category": "点型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/54",
      "setup": "r U R' U' M2 U R U' R' U' M'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "M U R U R' U' M2' U R U' r'",
          "setup": "r U R' U' M2 U R U' R' U' M'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "r U R' U' M2 U R U' R' U' M'",
          "setup": "M U R U R' U' M2 U R U' r'",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "r' R U R U R' U' M2 U R U' r'",
          "setup": "r U R' U' M2 U R U' R' U' R' r",
          "note": "主流标准解"
        }
      ],
      "note": "全反点型"
    },
    {
      "id": "OLL-21",
      "name": "OLL-21 (十字型)",
      "category": "十字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/27",
      "setup": "R U R' U R U' R' U R U2 R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U2 R' U' R U R' U' R U' R'",
          "setup": "R U R' U R U' R' U R U2 R'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "y R U R' U R U' R' U R U2 R'",
          "setup": "R U2 R' U' R U R' U' R U' R' y'",
          "note": "主流标准解"
        }
      ],
      "note": "十字型 · 4角翻色"
    },
    {
      "id": "OLL-22",
      "name": "OLL-22 (十字型)",
      "category": "十字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "R' U2 R2 U R2 U R2 U2 R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U2 R2' U' R2 U' R2' U2 R",
          "setup": "R' U2 R2 U R2 U R2 U2 R'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U2 R2 U' R2 U' R2 U2 R",
          "setup": "R' U2 R2 U R2 U R2 U2 R'",
          "note": "主流标准解"
        }
      ],
      "note": "十字型 · 左右车灯"
    },
    {
      "id": "OLL-23",
      "name": "OLL-23 (十字型)",
      "category": "十字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "R' U2 R' D' R U2 R' D R2",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R2 D' R U2 R' D R U2 R",
          "setup": "R' U2 R' D' R U2 R' D R2",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "y2 R2 D R' U2 R D' R' U2 R'",
          "setup": "R U2 R D R' U2 R D' R2 y2",
          "note": "主流标准解"
        }
      ],
      "note": "十字型 · 单向车灯"
    },
    {
      "id": "OLL-24",
      "name": "OLL-24 (十字型)",
      "category": "十字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F R' F' r U R U' r'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r U R' U' r' F R F'",
          "setup": "F R' F' r U R U' r'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "y R U R D R' U' R D' R2",
          "setup": "R2 D R' U R D' R' U' R' y'",
          "note": "主流标准解"
        }
      ],
      "note": "十字型 · 交叉型"
    },
    {
      "id": "OLL-25",
      "name": "OLL-25 (十字型)",
      "category": "十字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "R' F' r U R U' r' F",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F' r U R' U' r' F R",
          "setup": "R' F' r U R U' r' F",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "y' R' F R B' R' F' R B",
          "setup": "B' R' F R B R' F' R y",
          "note": "主流标准解"
        }
      ],
      "note": "十字型"
    },
    {
      "id": "OLL-26",
      "name": "OLL-26 (十字型)",
      "category": "十字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "R U R' U R U2 R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U2 R' U' R U' R'",
          "setup": "R U R' U R U2 R'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "y' R' U' R U' R' U2 R",
          "setup": "R' U2 R U R' U R y",
          "note": "主流标准解"
        }
      ],
      "note": "Anti-Sune (逆小鱼)"
    },
    {
      "id": "OLL-27",
      "name": "OLL-27 (十字型)",
      "category": "十字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "R U2 R' U' R U' R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U R U2 R'",
          "setup": "R U2 R' U' R U' R'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "y' R' U2 R U R' U R",
          "setup": "R' U' R U' R' U2 R y",
          "note": "主流标准解"
        }
      ],
      "note": "Sune (顺小鱼)"
    },
    {
      "id": "OLL-28",
      "name": "OLL-28 (四角翻好)",
      "category": "四角翻好",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "R U R' U' M' U R U' r'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r U R' U' M U R U' R'",
          "setup": "R U R' U' M' U R U' r'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "r U R' U' r' R U R U' R'",
          "setup": "R U R' U' R' r U R U' r'",
          "note": "主流标准解"
        }
      ],
      "note": "顶四角已归位，翻棱"
    },
    {
      "id": "OLL-29",
      "name": "OLL-29 (折角型)",
      "category": "折角型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "R U' R' F' U F R U R' U R U' R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U' R U' R' F' U' F R U R'",
          "setup": "R U' R' F' U F R U R' U R U' R'",
          "note": "精选手感推荐解"
        }
      ],
      "note": "折角型"
    },
    {
      "id": "OLL-30",
      "name": "OLL-30 (折角型)",
      "category": "折角型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F U R U2 R' U R U2 R' U' F'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F U R U2 R' U' R U2 R' U' F'",
          "setup": "F U R U2 R' U R U2 R' U' F'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "F R' F R2 U' R' U' R U R' F2",
          "setup": "F2 R U' R' U R U R2 F' R F'",
          "note": "主流标准解"
        }
      ],
      "note": "折角型"
    },
    {
      "id": "OLL-31",
      "name": "OLL-31 (P字型)",
      "category": "P字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "R' F R U R' U' F' U R",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R' U' F U R U' R' F' R",
          "setup": "R' F R U R' U' F' U R",
          "note": "精选手感推荐解"
        }
      ],
      "note": "P字型"
    },
    {
      "id": "OLL-32",
      "name": "OLL-32 (P字型)",
      "category": "P字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "f R' F' R U R U' R' S'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "S R U R' U' R' F R f'",
          "setup": "f R' F' R U R U' R' S'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "L U F' U' L' U L F L'",
          "setup": "L F' L' U' L U F U' L'",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "y2 S R U R' U' R' F R f'",
          "setup": "f R' F' R U R U' R' S' y2",
          "note": "主流标准解"
        }
      ],
      "note": "P字型"
    },
    {
      "id": "OLL-33",
      "name": "OLL-33 (T字型)",
      "category": "T字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F R' F' R U R U' R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U' R' F R F'",
          "setup": "F R' F' R U R U' R'",
          "note": "精选手感推荐解"
        }
      ],
      "note": "T字型 1 (T型基础)"
    },
    {
      "id": "OLL-34",
      "name": "OLL-34 (C字型)",
      "category": "C字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "B' F R' F' R B U R U' R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U' B' R' F R F' B",
          "setup": "B' F R' F' R B U R U' R'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U R2 U' R' F R U R U' F'",
          "setup": "F U R' U' R' F' R U R2 U' R'",
          "note": "主流标准解"
        }
      ],
      "note": "C字型"
    },
    {
      "id": "OLL-35",
      "name": "OLL-35 (鱼形)",
      "category": "鱼形",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "R U2 R' F R' F' R2 U2 R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U2 R2' F R F' R U2 R'",
          "setup": "R U2 R' F R' F' R2 U2 R'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U2 R' R' F R F' R U2 R'",
          "setup": "R U2 R' F R' F' R R U2 R'",
          "note": "主流标准解"
        }
      ],
      "note": "鱼形"
    },
    {
      "id": "OLL-36",
      "name": "OLL-36 (W字型)",
      "category": "W字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F' L F L' U' L' U' L U L' U L",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "L' U' L U' L' U L U L F' L' F",
          "setup": "F' L F L' U' L' U' L U L' U L",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "y2 R' U' R U' R' U R U R B' R' B",
          "setup": "B' R B R' U' R' U' R U R' U R y2",
          "note": "主流标准解"
        }
      ],
      "note": "W字型"
    },
    {
      "id": "OLL-37",
      "name": "OLL-37 (鱼形)",
      "category": "鱼形",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "R U R' U' R' F R F'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F R' F' R U R U' R'",
          "setup": "R U R' U' R' F R F'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "F R U' R' U' R U R' F'",
          "setup": "F R U' R' U R U R' F'",
          "note": "主流标准解"
        }
      ],
      "note": "鱼形"
    },
    {
      "id": "OLL-38",
      "name": "OLL-38 (W字型)",
      "category": "W字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F R' F' R U R U R' U' R U' R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U R U' R' U' R' F R F'",
          "setup": "F R' F' R U R U R' U' R U' R'",
          "note": "精选手感推荐解"
        }
      ],
      "note": "W字型"
    },
    {
      "id": "OLL-39",
      "name": "OLL-39 (大闪电)",
      "category": "大闪电",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "L U F' U' L' U L F L'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "L F' L' U' L U F U' L'",
          "setup": "L U F' U' L' U L F L'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "y2 R B' R' U' R U B U' R'",
          "setup": "R U B' U' R' U R B R' y2",
          "note": "主流标准解"
        }
      ],
      "note": "大闪电"
    },
    {
      "id": "OLL-40",
      "name": "OLL-40 (大闪电)",
      "category": "大闪电",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "R' U' F U R U' R' F' R",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R' F R U R' U' F' U R",
          "setup": "R' U' F U R U' R' F' R",
          "note": "精选手感推荐解"
        }
      ],
      "note": "大闪电"
    },
    {
      "id": "OLL-41",
      "name": "OLL-41 (折角型)",
      "category": "折角型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F U R U' R' F' R U2 R' U' R U' R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U R U2 R' F R U R' U' F'",
          "setup": "F U R U' R' F' R U2 R' U' R U' R'",
          "note": "精选手感推荐解"
        }
      ],
      "note": "折角型"
    },
    {
      "id": "OLL-42",
      "name": "OLL-42 (折角型)",
      "category": "折角型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F U R U' R' F' R' U2 R U R' U R",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R' U' R U' R' U2 R F R U R' U' F'",
          "setup": "F U R U' R' F' R' U2 R U R' U R",
          "note": "精选手感推荐解"
        }
      ],
      "note": "折角型"
    },
    {
      "id": "OLL-43",
      "name": "OLL-43 (P字型)",
      "category": "P字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "f' U' L' U L f",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "f' L' U' L U f",
          "setup": "f' U' L' U L f",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "F' U' L' U L F",
          "setup": "F' L' U' L U F",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "R' U' F R' F' R U R",
          "setup": "R' U' R' F R F' U R",
          "note": "主流标准解"
        }
      ],
      "note": "P字型"
    },
    {
      "id": "OLL-44",
      "name": "OLL-44 (P字型)",
      "category": "P字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "f U R U' R' f'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "f R U R' U' f'",
          "setup": "f U R U' R' f'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "F U R U' R' F'",
          "setup": "F R U R' U' F'",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "y2 f R U R' U' f'",
          "setup": "f U R U' R' f' y2",
          "note": "主流标准解"
        }
      ],
      "note": "P字型"
    },
    {
      "id": "OLL-45",
      "name": "OLL-45 (T字型)",
      "category": "T字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F U R U' R' F'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F R U R' U' F'",
          "setup": "F U R U' R' F'",
          "note": "精选手感推荐解"
        }
      ],
      "note": "T字型 2"
    },
    {
      "id": "OLL-46",
      "name": "OLL-46 (C字型)",
      "category": "C字型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "R' U' F R' F' R U R",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R' U' R' F R F' U R",
          "setup": "R' U' F R' F' R U R",
          "note": "精选手感推荐解"
        }
      ],
      "note": "C字型"
    },
    {
      "id": "OLL-47",
      "name": "OLL-47 (小L型)",
      "category": "小L型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F' U' L' U L U' L' U L F",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F' L' U' L U L' U' L U F",
          "setup": "F' U' L' U L U' L' U L F",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R' U' R' F R F' R' F R F' U R",
          "setup": "R' U' F R' F' R F R' F' R U R",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "y' F U R U' R' F' R U R' U R U2 R'",
          "setup": "R U2 R' U' R U' R' F R U R' U' F' y",
          "note": "主流标准解"
        }
      ],
      "note": "小L型"
    },
    {
      "id": "OLL-48",
      "name": "OLL-48 (小L型)",
      "category": "小L型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F U R U' R' U R U' R' F'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F R U R' U' R U R' U' F'",
          "setup": "F U R U' R' U R U' R' F'",
          "note": "精选手感推荐解"
        }
      ],
      "note": "小L型"
    },
    {
      "id": "OLL-49",
      "name": "OLL-49 (小L型)",
      "category": "小L型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "r' U r2 U' r2 U' r2 U r'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r U' r2' U r2 U r2' U' r",
          "setup": "r' U r2 U' r2 U' r2 U r'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "r U' r2 U r2 U r2 U' r",
          "setup": "r' U r2 U' r2 U' r2 U r'",
          "note": "主流标准解"
        }
      ],
      "note": "小L型"
    },
    {
      "id": "OLL-50",
      "name": "OLL-50 (小L型)",
      "category": "小L型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "r U' r2 U r2 U r2 U' r",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r' U r2 U' r2' U' r2 U r'",
          "setup": "r U' r2 U r2 U r2 U' r",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "r' U r2 U' r2 U' r2 U r'",
          "setup": "r U' r2 U r2 U r2 U' r",
          "note": "主流标准解"
        }
      ],
      "note": "小L型"
    },
    {
      "id": "OLL-51",
      "name": "OLL-51 (一字/线型)",
      "category": "一字/线型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "F R U R' U' R U R' U' F'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F U R U' R' U R U' R' F'",
          "setup": "F R U R' U' R U R' U' F'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "y2 f R U R' U' R U R' U' f'",
          "setup": "f U R U' R' U R U' R' f' y2",
          "note": "主流标准解"
        }
      ],
      "note": "一字/线型"
    },
    {
      "id": "OLL-52",
      "name": "OLL-52 (一字/线型)",
      "category": "一字/线型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "R B U B' U R' U' R U' R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U R U' B U' B' R'",
          "setup": "R B U B' U R' U' R U' R'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "y2 R' F' U' F U' R U R' U R",
          "setup": "R' U' R U' R' U F' U F R y2",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "R U R' U R U' y R U' R' F'",
          "setup": "F R U R' y' U R' U' R U' R'",
          "note": "主流标准解"
        }
      ],
      "note": "一字/线型"
    },
    {
      "id": "OLL-53",
      "name": "OLL-53 (小L型)",
      "category": "小L型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "r' U' R U' R' U R U' R' U2 r",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r' U2 R U R' U' R U R' U r",
          "setup": "r' U' R U' R' U R U' R' U2 r",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "l' U2 L U L' U' L U L' U l",
          "setup": "l' U' L U' L' U L U' L' U2 l",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "y2 r' U2 R U R' U' R U R' U r",
          "setup": "r' U' R U' R' U R U' R' U2 r y2",
          "note": "主流标准解"
        },
        {
          "name": "Top 3 (备选)",
          "exp": "y r' U' R U' R' U R U' R' U2 r",
          "setup": "r' U2 R U R' U' R U R' U r y'",
          "note": "主流标准解"
        }
      ],
      "note": "小L型"
    },
    {
      "id": "OLL-54",
      "name": "OLL-54 (小L型)",
      "category": "小L型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/13.5",
      "setup": "r U R' U R U' R' U R U2 r'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r U2 R' U' R U R' U' R U' r'",
          "setup": "r U R' U R U' R' U R U2 r'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "y r U R' U R U' R' U R U2 r'",
          "setup": "r U2 R' U' R U R' U' R U' r' y'",
          "note": "主流标准解"
        }
      ],
      "note": "小L型"
    },
    {
      "id": "OLL-55",
      "name": "OLL-55 (一字/线型)",
      "category": "一字/线型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/27",
      "setup": "F R' F' U2 R U R' U R2 U2 R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U2 R2' U' R U' R' U2 F R F'",
          "setup": "F R' F' U2 R U R' U R2 U2 R'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R' F R U R U' R2 F' R2 U' R' U R U R'",
          "setup": "R U' R' U' R U R2 F R2 U R' U' R' F' R",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "y R U2 R2 U' R U' R' U2 F R F'",
          "setup": "F R' F' U2 R U R' U R2 U2 R' y'",
          "note": "主流标准解"
        }
      ],
      "note": "一字/线型"
    },
    {
      "id": "OLL-56",
      "name": "OLL-56 (一字/线型)",
      "category": "一字/线型",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/27",
      "setup": "r U r' R U R' U' R U R' U' r U' r'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "r U r' U R U' R' U R U' R' r U' r'",
          "setup": "r U r' R U R' U' R U R' U' r U' r'",
          "note": "精选手感推荐解"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "r' U' r U' R' U R U' R' U R r' U r",
          "setup": "r' U' r R' U' R U R' U' R U r' U r",
          "note": "主流标准解"
        },
        {
          "name": "Top 2 (备选)",
          "exp": "r U r' U R U' R' U R U' M' U' r'",
          "setup": "r U M U R' U' R U R' U' r U' r'",
          "note": "主流标准解"
        }
      ],
      "note": "一字/线型"
    },
    {
      "id": "OLL-57",
      "name": "OLL-57 (四角翻好)",
      "category": "四角翻好",
      "stripMode": "OLL",
      "order": 3,
      "prob": "1/27",
      "setup": "r U R' U' M U R U' R'",
      "setupRelation": "转此逆公式即可在实体魔方上摆出该形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U' M' U R U' r'",
          "setup": "r U R' U' M U R U' R'",
          "note": "精选手感推荐解"
        }
      ],
      "note": "顶四角已翻好"
    }
  ],
  "f2l": [
    {
      "id": "F2L-01",
      "name": "基本入槽 (前右槽)",
      "category": "基础直接入槽",
      "stripMode": "F2L",
      "order": 3,
      "setup": "R U' R' U' R U R' U",
      "setupRelation": "与公式互逆",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "U' R U' R' U R U R'",
          "setup": "R U' R' U' R U R' U",
          "note": "标准异色藏角配对入槽"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "U' R U' R' U R U R'",
          "setup": "R U' R' U' R U R' U",
          "note": "高赞解法"
        }
      ],
      "note": "角棱在顶层已处于异色相错位，U' 提角藏好后顺势入槽。"
    },
    {
      "id": "F2L-02",
      "name": "左右镜像 (异色藏角 · 同色公式)",
      "category": "左右镜像免转体",
      "stripMode": "F2L",
      "order": 3,
      "setup": "R' U R y U' R U2 R' U",
      "setupRelation": "与公式互逆",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "U' R U2 R' U y' R' U' R",
          "setup": "R' U R y U' R U2 R' U",
          "note": "免转体经典顺手"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "U' R U2 R' U y' R' U' R",
          "setup": "R' U R y U' R U2 R' U",
          "note": "高赞主流解"
        },
        {
          "name": "Top 2 (左手入槽)",
          "exp": "U' R U2 R' U y L' U' L",
          "setup": "L' U L y' U' R U2 R' U",
          "note": "左手平滑入槽"
        }
      ],
      "note": "异色藏角，同色公式。顶层调向后一次推入。"
    },
    {
      "id": "F2L-03",
      "name": "同色同近异离",
      "category": "基础直接入槽",
      "stripMode": "F2L",
      "order": 3,
      "setup": "R' U R y U2 R U R' U R'",
      "setupRelation": "与公式互逆",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U' R U' R' U2 y' R' U' R",
          "setup": "R' U R y U2 R U R' U R'",
          "note": "经典指法连贯"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U' R U' R' U2 y' R' U' R",
          "setup": "R' U R y U2 R U R' U R'",
          "note": "标准解"
        }
      ],
      "note": "在共同的面上操作，同近异离口诀。"
    },
    {
      "id": "F2L-04",
      "name": "顶层白朝上 (角棱分离)",
      "category": "顶层角朝上",
      "stripMode": "F2L",
      "order": 3,
      "setup": "R U' R' U R U2 R'",
      "setupRelation": "与公式互逆",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U2 R' U' R U R'",
          "setup": "R U' R' U R U2 R'",
          "note": "解离后配对入槽"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U2 R' U' R U R'",
          "setup": "R U' R' U R U2 R'",
          "note": "高赞第一"
        }
      ],
      "note": "角块白色朝上，先做 R U2 R' 翻转角块并分离棱块，再直接入槽。"
    },
    {
      "id": "F2L-05",
      "name": "角块在底层 (白朝前)",
      "category": "角在底层/进槽拆解",
      "stripMode": "F2L",
      "order": 3,
      "setup": "R U' R' U R U' R' U R U' R'",
      "setupRelation": "三性感逆向",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U' R U R' U' R U R'",
          "setup": "R U' R' U R U' R' U R U' R'",
          "note": "三连性感秒杀，极好记"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U R' U' R U R' U' R U R'",
          "setup": "R U' R' U R U' R' U R U' R'",
          "note": "高赞解法"
        }
      ],
      "note": "角块已在右前槽位但白色朝前。直接做 3 次标准性感操作 R U R' U' 瞬间完成。"
    },
    {
      "id": "F2L-06",
      "name": "少林转入槽",
      "category": "基础直接入槽",
      "stripMode": "F2L",
      "order": 3,
      "setup": "R U R' F R U R' U' F'",
      "setupRelation": "与公式互逆",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F U R U' R' F' R U' R'",
          "setup": "R U R' F R U R' U' F'",
          "note": "少林开路，优雅入槽"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "F U R U' R' F' R U' R'",
          "setup": "R U R' F R U R' U' F'",
          "note": "标准解"
        }
      ],
      "note": "少林动作 F U R U' R' F' 先翻开棱块，最后 R U' R' 回槽。"
    }
  ],
  "oll2": [
    {
      "id": "2OLL-Sune",
      "name": "Sune (顺小鱼)",
      "category": "2阶 OLL",
      "stripMode": "OLL",
      "order": 2,
      "setup": "R U2 R' U' R U' R'",
      "setupRelation": "做 Anti-Sune 即可出此形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U R U2 R'",
          "setup": "R U2 R' U' R U' R'",
          "note": "标准顺小鱼"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U R' U R U2 R'",
          "setup": "R U2 R' U' R U' R'",
          "note": "高赞第一"
        }
      ],
      "note": "顶面仅 1 黄点朝上，左前黄色朝前。与 Anti-Sune 互为逆公式。"
    },
    {
      "id": "2OLL-AntiSune",
      "name": "Anti-Sune (逆小鱼)",
      "category": "2阶 OLL",
      "stripMode": "OLL",
      "order": 2,
      "setup": "R U R' U R U2 R'",
      "setupRelation": "做 Sune 即可出此形态",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U2 R' U' R U' R'",
          "setup": "R U R' U R U2 R'",
          "note": "标准逆小鱼"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U2 R' U' R U' R'",
          "setup": "R U R' U R U2 R'",
          "note": "高赞第一"
        }
      ],
      "note": "顶面仅 1 黄点朝上，右前黄色朝右。与 Sune 互为逆公式。"
    },
    {
      "id": "2OLL-Pi",
      "name": "Pi (双头车)",
      "category": "2阶 OLL",
      "stripMode": "OLL",
      "order": 2,
      "setup": "F U R U' R' U R U' R' F'",
      "setupRelation": "自互逆",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F R U R' U' R U R' U' F'",
          "setup": "F U R U' R' U R U' R' F'",
          "note": "大F双性感，极其好记"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "F R U R' U' R U R' U' F'",
          "setup": "F U R U' R' U R U' R' F'",
          "note": "高赞解法"
        }
      ],
      "note": "顶面无黄色朝上，后两角朝后，前两角朝外。大 F 接双性感直接搞定。"
    },
    {
      "id": "2OLL-H",
      "name": "H (四角翻)",
      "category": "2阶 OLL",
      "stripMode": "OLL",
      "order": 2,
      "setup": "R2 U2 R U2 R2",
      "setupRelation": "自互逆",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R2 U2 R' U2 R2",
          "setup": "R2 U2 R U2 R2",
          "note": "极简五步，自互逆！"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R2 U2 R U2 R2",
          "setup": "R2 U2 R' U2 R2",
          "note": "高赞解法"
        }
      ],
      "note": "顶面无黄色朝上，前后各有两点朝外。超短公式 R2 U2 R' U2 R2，自互逆。"
    },
    {
      "id": "2OLL-P",
      "name": "P (双黄并列)",
      "category": "2阶 OLL",
      "stripMode": "OLL",
      "order": 2,
      "setup": "F U R U' R' F'",
      "setupRelation": "与公式互逆",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F R U R' U' F'",
          "setup": "F U R U' R' F'",
          "note": "三阶基础大F单性感"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "F R U R' U' F'",
          "setup": "F U R U' R' F'",
          "note": "高赞第一"
        }
      ],
      "note": "顶面已有两个黄色朝上并列在后方，前方两黄色朝前。F R U R' U' F' 直接搞定。"
    },
    {
      "id": "2OLL-T",
      "name": "T (对视)",
      "category": "2阶 OLL",
      "stripMode": "OLL",
      "order": 2,
      "setup": "F R' F' R U R U' R'",
      "setupRelation": "做 L 即可出此形态 (与 L 互逆)",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U' R' F R F'",
          "setup": "F R' F' R U R U' R'",
          "note": "三阶T2少林，与L互逆"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "R U R' U' R' F R F'",
          "setup": "F R' F' R U R U' R'",
          "note": "高赞第一"
        }
      ],
      "note": "顶面两个黄色并列，另外两点向两侧对视。公式就是三阶 T2（性感转少林）。与 L 互逆。"
    },
    {
      "id": "2OLL-L",
      "name": "L (斜角)",
      "category": "2阶 OLL",
      "stripMode": "OLL",
      "order": 2,
      "setup": "R' F' R U R U' R' F",
      "setupRelation": "做 T 即可出此形态 (与 T 互逆)",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F' R U R' U' R' F R",
          "setup": "R' F' R U R U' R' F",
          "note": "F'起手少林，与T互逆"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "F' R U R' U' R' F R",
          "setup": "R' F' R U R U' R' F",
          "note": "高赞第一"
        }
      ],
      "note": "顶面两个角黄色对角朝上。与 T 互为逆公式。"
    }
  ],
  "pll2": [
    {
      "id": "2PLL-Adj",
      "name": "Adj (邻角换)",
      "category": "2阶 PLL",
      "stripMode": "PLL",
      "order": 2,
      "setup": "F R U' R' U R U R2 F' R U R U' R'",
      "setupRelation": "自互逆 (相当于三阶 T-Perm / J-Perm)",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "R U R' U' R' F R2 U' R' U' R U R' F'",
          "setup": "F R U' R' U R U R2 F' R U R U' R'",
          "note": "三阶经典 T-Perm，自互逆"
        },
        {
          "name": "Top 1 (J-Perm法)",
          "exp": "R U R' F' R U R' U' R' F R2 U' R'",
          "setup": "R U R2 F' R U R U' R' F R U' R'",
          "note": "Jb-Perm，极速连贯"
        }
      ],
      "note": "顶层有一侧两个角块颜色相同（车灯），另一侧两角需要互换。直接做三阶 T-Perm 或 Jb-Perm！自互逆。"
    },
    {
      "id": "2PLL-Opp",
      "name": "Opp (对角换)",
      "category": "2阶 PLL",
      "stripMode": "PLL",
      "order": 2,
      "setup": "F R' F' R U R U' R' F R U' R' U R U R' F'",
      "setupRelation": "自互逆 (相当于三阶 Y-Perm)",
      "algs": [
        {
          "name": "⭐ 顺手推荐",
          "exp": "F R U' R' U' R U R' F' R U R' U' R' F R F'",
          "setup": "F R' F' R U R U' R' F R U' R' U R U R' F'",
          "note": "三阶经典 Y-Perm，自互逆"
        },
        {
          "name": "Top 1 (SpeedCubeDB)",
          "exp": "F R U' R' U' R U R' F' R U R' U' R' F R F'",
          "setup": "F R' F' R U R U' R' F R U' R' U R U R' F'",
          "note": "高赞标准解"
        }
      ],
      "note": "顶层四个侧面均无车灯，对角两两互换。直接做三阶 Y-Perm！自互逆。"
    }
  ]
};

  global.CUBE_ALGS_DATA = CUBE_ALGS_DATA;
})(window);
