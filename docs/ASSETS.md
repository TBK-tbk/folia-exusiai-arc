# 替换素材指南

`mod/character.mjs` 和 `mod/gun.mjs` 里各自只有一行有效内容：

```js
export const CHARACTER_URL = "data:image/webp;base64,UklGR...";
export const GUN_URL = "data:image/png;base64,iVBORw0...";
```

Folia 的 `folia-mod://` 协议只服务 `.js` / `.mjs`，所以图片必须内嵌成 data URL。
想换成自己的图，按下面任意一种方式重新生成这个文件即可。

---

## 方式一：PowerShell（Windows 自带）

```powershell
$img = "C:\path\to\your.webp"
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($img))
$out = "D:\Folia-src\...\mods\exusiai-arc\character.mjs"
Set-Content -Path $out -Encoding UTF8 -Value (
  "// mods/exusiai-arc/character.mjs`nexport const CHARACTER_URL = `"data:image/webp;base64,$b64`";"
)
```

## 方式二：Python

```python
import base64, pathlib

src = pathlib.Path(r"C:\path\to\your.webp")
b64 = base64.b64encode(src.read_bytes()).decode()
pathlib.Path(r"character.mjs").write_text(
    '// mods/exusiai-arc/character.mjs\n'
    f'export const CHARACTER_URL = "data:image/webp;base64,{b64}";\n',
    encoding="utf-8",
)
```

## 方式三：在线工具

搜索 "image to base64"，把图片转成 base64 字符串，再手工拼成上面那行 JS 即可。

---

## 图片规格建议

| 项 | 建议 |
|---|---|
| 立绘 | **透明底 PNG / WebP**，宽 760–1100 px，比例约 3:4（竖图） |
| 枪线稿 | 透明底 PNG，横图，线色浅色（模组会把整体染成淡金） |
| 体积 | 单张控制在 300 KB 内 —— data URL 会让 `.mjs` 膨胀约 1.37 倍 |

**为什么强调透明底？** 模组直接把图叠在暗色背景上，白底会露出一块明显的白框。
如果只有白底图，可以先用抠图工具（remove.bg、Photoshop 的「选择主体」）处理。

---

## 换完之后

1. 文件名和导出名必须保持不变（`CHARACTER_URL` / `GUN_URL`），否则 `client.mjs` 会 import 失败
2. 重启 Folia —— 内容摘要变了，会要求重新确认授权
3. 如果立绘比例和原来差很多，可以在设置里调「立绘大小」和「立绘淡化」补偿
