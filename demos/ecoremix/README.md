# EcoRemix 3D demo

`index.html` is the user-provided HTML, preserved without modifications.

Upload the complete `flow_blocks` folder alongside it:

```text
demos/ecoremix/
  index.html
  flow_blocks/
    c_b0.js
    ...
    m_decomp_big_150000_b4.js
    ...
```

Keep all original file names and the directory structure. The `.gitkeep` is only a placeholder and contains no flow frames. The HTML dynamically loads `flow_blocks/<key>.js` for CFD/AI frames.

Sensor data and the default flow block are embedded in the HTML; the full set of times/models requires the external folder. The 3D libraries are loaded from the original CDN URLs used by the uploaded HTML.
