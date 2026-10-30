"""Gabungkan src/ menjadi satu file index.html yang bisa langsung dibuka di browser."""
import pathlib
root = pathlib.Path(__file__).parent
s = root / 'src'
html = (s / 'index.html').read_text(encoding='utf-8')
css = (s / 'style.css').read_text(encoding='utf-8')
js = '\n'.join((s / f).read_text(encoding='utf-8') for f in ['engine.js', 'data.js', 'assets.js', 'models.js', 'audio.js', 'game.js'])
out = html.replace('/*CSS*/', css).replace('<script>/*JS*/</script>', '<script>\n' + js + '\n</script>')
(root / 'index.html').write_text(out, encoding='utf-8')
print('index.html dibuat,', len(out), 'byte')
