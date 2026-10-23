// 初始演示数据：只存展示资料；演示登录密码由服务层验证，不持久化明文。
export const demoAccounts = [
  {
    id: 'u1',
    name: '林间来信',
    email: 'user@exix.demo',
    role: 'user',
    bio: '收集生活里的颜色，偶尔也画一点。',
    avatar: '林',
    hue: '#d6e4df',
  },
  {
    id: 'a1',
    name: '鹿眠',
    email: 'artist@exix.demo',
    role: 'artist',
    bio: '画一些安静的地方。自由插画师 / 喜欢山、海和植物。',
    avatar: '鹿',
    hue: '#e6dbc8',
  },
  {
    id: 'admin',
    name: 'Exix 编辑部',
    email: 'admin@exix.demo',
    role: 'admin',
    bio: '让每一份创作都被看见。',
    avatar: 'E',
    hue: '#dcd9f0',
  },
  {
    id: 'a2',
    name: '青屿',
    email: 'qing@exix.demo',
    role: 'artist',
    bio: '在形状与色彩之间散步。',
    avatar: '青',
    hue: '#cddde9',
  },
  {
    id: 'a3',
    name: '夏日邮局',
    email: 'summer@exix.demo',
    role: 'artist',
    bio: '用画笔寄出一些小小的日常。',
    avatar: '夏',
    hue: '#f2d5cb',
  },
]
export function createSeed() {
  const titles = [
    '在山的另一边',
    '把夏天装进花瓶',
    '蓝色的慢时光',
    '森林来信',
    '日落之前',
    '一座安静的房子',
    '沿着海岸散步',
    '月亮也在旅行',
  ]
  return {
    version: 1,
    users: demoAccounts.map((u) => ({ ...u, allowStrangers: true, restricted: false })),
    works: titles.map((title, i) => ({
      id: `w${i + 1}`,
      authorId: ['a1', 'a2', 'a3'][i % 3],
      title,
      description: [
        '给忙碌生活留一点空白。今天的灵感，来自窗外的一束光。',
        '一次关于色彩和形状的小练习，希望你也能在这里停留一会儿。',
      ][i % 2],
      tags: [
        ['风景', '原创插画'],
        ['静物', '色彩练习'],
        ['日常', '数字绘画'],
      ][i % 3],
      images: [`/art/work-${i + 1}.svg`],
      hidden: false,
      createdAt: new Date(Date.now() - i * 3600000 * 9).toISOString(),
      baseLikes: [128, 86, 214, 67, 153, 92, 178, 46][i],
    })),
    likes: [],
    collections: [],
    follows: [{ userId: 'u1', targetId: 'a1' }],
    comments: [
      {
        id: 'c1',
        workId: 'w1',
        userId: 'u1',
        text: '好喜欢这里的颜色，像是可以走进去的梦。',
        parentId: null,
        createdAt: new Date().toISOString(),
      },
    ],
    applications: [],
    reports: [],
    blocks: [],
    conversations: [{ id: 'conv1', members: ['u1', 'a1'] }],
    messages: [
      {
        id: 'm1',
        conversationId: 'conv1',
        senderId: 'a1',
        text: '你好，欢迎来到 Exix！很高兴在这里遇见你。',
        createdAt: new Date().toISOString(),
        readBy: ['a1'],
      },
    ],
    notifications: [
      {
        id: 'n1',
        userId: 'u1',
        text: '欢迎来到 Exix，去发现喜欢的作品吧。',
        path: '/',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ],
  }
}
