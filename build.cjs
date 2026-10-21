/* Harlan & Voss — THEME 2 (Ivory & Oxblood) static site builder.
   Reads _content/*.html (with %%KEY%% front-matter at top) and wraps them
   with _partial-head.html + _partial-foot.html to produce final pages.
   Run: node build.cjs
*/
const fs = require('fs')
const path = require('path')

const root = __dirname
const head = fs.readFileSync(path.join(root, '_partial-head.html'), 'utf8')
const foot = fs.readFileSync(path.join(root, '_partial-foot.html'), 'utf8')
const dir = path.join(root, '_content')

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'))
const DEFAULT_OG = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80'

// simple {{> partial}} include support
function expandIncludes(src) {
  return src.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
    const p = path.join(dir, `_${name}.html`)
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''
  })
}

let count = 0
files.filter((f) => !f.startsWith('_')).forEach((file) => {
  let src = fs.readFileSync(path.join(dir, file), 'utf8')

  // front-matter: lines of %%KEY: value%%
  const meta = {}
  src = src.replace(/^%%([A-Z]+):\s*([\s\S]*?)%%\s*/gm, (_, k, v) => { meta[k] = v.trim(); return '' })

  const title = meta.TITLE || 'Harlan & Voss LLP'
  const desc = meta.DESC || 'Los Angeles trial and litigation attorneys.'
  const slug = file.replace(/^_/, '')
  const og = meta.OG || DEFAULT_OG
  const scripts = meta.SCRIPTS
    ? meta.SCRIPTS.split(',').map((s) => '  <script src="' + s.trim() + '"></script>').join('\n')
    : ''

  let body = expandIncludes(src)
  body = body.replace(/\{\{SLUG\}\}/g, slug)

  const page = head
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{DESC\}\}/g, desc)
    .replace(/\{\{SLUG\}\}/g, slug)
    .replace(/\{\{OG\}\}/g, og)
    .replace('{{SCRIPTS}}', scripts)
    .replace('{{BODY}}', body)

  fs.writeFileSync(path.join(root, file), page + '\n' + foot)
  count++
  console.log('built ' + file)
})

console.log(`\n${count} pages built.`)
