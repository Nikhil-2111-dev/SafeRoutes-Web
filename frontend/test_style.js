
fetch("https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json")
  .then(r => r.json())
  .then(d => {
     console.log("Glyphs URL:", d.glyphs);
     const fonts = new Set();
     d.layers.forEach(l => {
       if (l.layout && l.layout["text-font"]) {
         l.layout["text-font"].forEach(f => fonts.add(f));
       }
     });
     console.log("Supported fonts:", Array.from(fonts));
  })
  .catch(console.error);

