const TAG_RULES: { pattern: RegExp; tag: string }[] = [
  { pattern: /剧情|情节|故事|发展|走向/, tag: "剧情讨论" },
  { pattern: /情报|消息|剧透|预告|PV|CM|新视觉/, tag: "情报搬运" },
  { pattern: /同人|二创|COS|cos|插画|手绘|图透|绘画|MMD/, tag: "二创分享" },
  { pattern: /资源|下载|网盘|链接|磁力/, tag: "资源交流" },
  { pattern: /评分|打几分|怎么样|推荐|烂|神|雷|垃圾/, tag: "评分吐槽" },
  { pattern: /声优|CV|配音|角色|人设/, tag: "声优角色" },
];

export function autoTag(content: string): string[] {
  const tags = new Set<string>();
  for (const rule of TAG_RULES) {
    if (rule.pattern.test(content)) {
      tags.add(rule.tag);
    }
  }
  return tags.size > 0 ? Array.from(tags) : ["综合讨论"];
}
