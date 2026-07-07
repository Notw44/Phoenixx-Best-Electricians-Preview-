"use client";
import React, { useEffect, useRef } from "react";

/* ========= Fragment shader (fixed: init z/d/f; safe divides) ========= */
const SHADER_SRC = `#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform vec3  iResolution;   // (w, h, dpr)
uniform float iTime;
uniform int   iFrame;
uniform vec4  iMouse;

// 2D Hash function
float hash21(vec2 p){ 
  p = fract(p * vec2(123.34, 456.21)); 
  p += dot(p, p + 45.32); 
  return fract(p.x * p.y); 
}

// Value Noise 2D
float noise(in vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Fractal Brownian Motion (FBM) for flowing silk currents
float fbm(in vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; ++i) {
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  vec2 p = (fragCoord - 0.5 * iResolution.xy) / max(iResolution.y, 1.0);
  
  float t = iTime * 0.12; // Slow luxurious movement
  
  // Domain warping for liquid current distortion
  vec2 q = vec2(0.0);
  q.x = fbm(p + vec2(t, 0.3 * t));
  q.y = fbm(p + vec2(0.2 * t, 0.5 * t));
  
  vec2 r = vec2(0.0);
  r.x = fbm(p + 1.0 * q + vec2(1.7, 9.2) + 0.1 * t);
  r.y = fbm(p + 1.0 * q + vec2(8.3, 2.8) + 0.08 * t);
  
  float f = fbm(p + 1.2 * r);
  
  // Core colors mapping to Tracy's luxury gunmetal & gold theme
  vec3 colDeep = vec3(0.02, 0.02, 0.025);     // Dark premium steel base
  vec3 colSlate = vec3(0.05, 0.06, 0.08);     // Brushed Slate-silver current
  vec3 colGold = vec3(0.72, 0.52, 0.10);      // Burnished gold flowing stream
  vec3 colGlow = vec3(0.99, 0.88, 0.28);      // Hot incandescent yellow-gold spark
  
  // Base background blend
  vec3 col = mix(colDeep, colSlate, f);
  
  // Introduce gold rivers/auroras
  float goldIntensity = pow(f, 3.5) * 1.8;
  col = mix(col, colGold, goldIntensity * 0.42);
  
  // Add thin, pulsing glowing electrical currents/veins
  float vein1 = abs(sin(p.x * 2.2 + p.y * 1.2 + f * 3.5 - t * 1.8));
  float vein2 = abs(sin(p.y * 2.8 - p.x * 0.8 + f * 4.2 + t * 1.3));
  float electricVeins = smoothstep(0.988, 1.0, 1.0 - min(vein1, vein2));
  col += colGlow * electricVeins * 0.24;
  
  // Floating energy embers drifting slowly upwards
  float pGrid = 16.0;
  vec2 ip = floor(p * pGrid);
  vec2 fp = fract(p * pGrid) - 0.5;
  float pHash = hash21(ip);
  
  // Slow upwards vertical drift + slight horizontal wiggle
  float pYOffset = fract(t * 1.1 + pHash);
  float pXOffset = sin(t * 2.0 + pHash * 6.28) * 0.15;
  fp.y -= (pYOffset - 0.5);
  fp.x -= pXOffset;
  
  float pSize = 0.025 + 0.035 * sin(t * 4.0 + pHash * 6.28);
  float dParticle = length(fp);
  float pGlow = smoothstep(pSize, 0.0, dParticle);
  
  // Selectively display particles based on noise grid
  float pMask = step(0.72, hash21(ip + 57.84));
  col += colGlow * pGlow * pMask * 0.48;
  
  // Interactive magnetic ripple on mouse move/hover
  if (length(iMouse.xy) > 2.0) {
    vec2 mPos = (iMouse.xy - 0.5 * iResolution.xy) / max(iResolution.y, 1.0);
    float dMouse = length(p - mPos);
    float mGlow = smoothstep(0.45, 0.0, dMouse);
    
    // Electrical current wave ripples outward from the mouse
    float ripple = sin(dMouse * 38.0 - iTime * 8.0) * 0.5 + 0.5;
    col += colGlow * mGlow * ripple * 0.15;
    col += colGold * mGlow * 0.18;
  }
  
  // Subtle elegant vignette to focus elements
  float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
  vignette = clamp(pow(16.0 * vignette, 0.3), 0.0, 1.0);
  col *= vignette;
  
  fragColor = vec4(col, 1.0);
}

void main(){ mainImage(fragColor, gl_FragCoord.xy); }
`;

/* ========= Vertex shader: fullscreen triangle ========= */
const VERT_SRC = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
out vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/* ========= Utils (no-throw, logs only) ========= */
function safeCompile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  const ok = gl.getShaderParameter(sh, gl.COMPILE_STATUS);
  const log = gl.getShaderInfoLog(sh) || "";
  return { shader: ok ? sh : null, log };
}
function safeLink(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  const ok = gl.getProgramParameter(prog, gl.LINK_STATUS);
  const log = gl.getProgramInfoLog(prog) || "";
  return { program: ok ? prog : null, log };
}
function drawError(gl: WebGL2RenderingContext, msg: string) {
  console.error(msg);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clearColor(0.2, 0.0, 0.0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

/* ========= Canvas runtime (TDZ-safe, robust resize) ========= */
interface ShaderCanvasProps {
  fragSource: string;
  pixelRatio?: number;
}

function ShaderCanvas({
  fragSource,
  pixelRatio,
}: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, l: 0, r: 0 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: false });
    if (!gl) return;

    // Predeclare resources to avoid TDZ in cleanup
    let disposed = false;
    let vao: WebGLVertexArrayObject | null = null;
    let vbo: WebGLBuffer | null = null;
    let program: WebGLProgram | null = null;
    let ro: ResizeObserver | null = null;
    let resizeScheduled = false;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current.x = Math.max(0, Math.min(x, rect.width));
      mouseRef.current.y = Math.max(0, Math.min(rect.height - y, rect.height));
    };
    const onDown = (e: MouseEvent) => { if (e.button === 0) mouseRef.current.l = 1; if (e.button === 2) mouseRef.current.r = 1; };
    const onUp   = (e: MouseEvent) => { if (e.button === 0) mouseRef.current.l = 0; if (e.button === 2) mouseRef.current.r = 0; };
    const onCtxMenu = (e: Event) => e.preventDefault();
    const onContextLost = (ev: Event) => { ev.preventDefault(); if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; };
    const onContextRestored = () => { scheduleSize(); startRef.current = performance.now(); frameRef.current = 0; if (!rafRef.current) rafRef.current = requestAnimationFrame(tick); };

    const getDpr = () => {
      const sys = (window.devicePixelRatio || 1);
      return Math.max(1, Math.min(2, pixelRatio ?? sys)); // parens for ?? with ||
    };

    function applySize() {
      resizeScheduled = false;
      if (disposed) return;
      const dpr = getDpr();
      const cssW = Math.max(1, (canvas.clientWidth | 0));
      const cssH = Math.max(1, (canvas.clientHeight | 0));
      const w = Math.max(1, Math.floor(cssW * dpr));
      const h = Math.max(1, Math.floor(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl!.viewport(0, 0, w, h);
      }
    }
    function scheduleSize() {
      if (resizeScheduled) return;
      resizeScheduled = true;
      requestAnimationFrame(applySize);
    }

    // Geometry
    vao = gl.createVertexArray();
    vbo = gl.createBuffer();
    if (!vao || !vbo) { drawError(gl, "Failed to create VAO/VBO"); return cleanup; }
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Shaders
    const { shader: vs, log: vsLog } = safeCompile(gl, gl.VERTEX_SHADER, VERT_SRC);
    if (!vs) { drawError(gl, `Vertex compile error:\n${vsLog}`); return cleanup; }
    const { shader: fs, log: fsLog } = safeCompile(gl, gl.FRAGMENT_SHADER, fragSource);
    if (!fs) { drawError(gl, `Fragment compile error:\n${fsLog}`); gl.deleteShader(vs); return cleanup; }
    const linked = safeLink(gl, vs, fs);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!linked.program) { drawError(gl, `Program link error:\n${linked.log}`); return cleanup; }
    program = linked.program;

    // Uniforms
    const uResolution = gl.getUniformLocation(program, "iResolution");
    const uTime = gl.getUniformLocation(program, "iTime");
    const uFrame = gl.getUniformLocation(program, "iFrame");
    const uMouse = gl.getUniformLocation(program, "iMouse");

    // Resize observer
    ro = new ResizeObserver(scheduleSize);
    ro.observe(canvas);
    scheduleSize();

    // Events
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("contextmenu", onCtxMenu);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    // Animation
    startRef.current = performance.now();
    frameRef.current = 0;

    function tick(now: number) {
      if (disposed) return;
      if (gl!.isContextLost()) { rafRef.current = requestAnimationFrame(tick); return; }

      const t = (now - startRef.current) / 1000;
      frameRef.current += 1;

      try {
        gl!.useProgram(program!);
        if (resizeScheduled) applySize();

        const dpr = getDpr();
        const w = canvas.width, h = canvas.height;

        if (uResolution) gl!.uniform3f(uResolution, w, h, dpr);
        if (uTime) gl!.uniform1f(uTime, t);
        if (uFrame) gl!.uniform1i(uFrame, frameRef.current);
        if (uMouse) {
          const m = mouseRef.current;
          gl!.uniform4f(uMouse, m.x * dpr, m.y * dpr, m.l, m.r);
        }

        gl!.bindVertexArray(vao!);
        gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      } catch (err) {
        drawError(gl!, (err as Error)?.message ?? String(err));
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    function cleanup() {
      disposed = true;
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("contextmenu", onCtxMenu);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);

      if (ro) { try { ro.disconnect(); } catch {} ro = null; }
      try { if (vbo) gl!.deleteBuffer(vbo); } catch {}
      try { if (vao) gl!.deleteVertexArray(vao); } catch {}
      try { if (program) gl!.deleteProgram(program); } catch {}
    }

    return cleanup;
  }, [fragSource, pixelRatio]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}

/* ========= Default export: fullscreen container ========= */
export default function Component() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "black",
        overflow: "hidden",
      }}
    >
      <ShaderCanvas fragSource={SHADER_SRC} />
    </div>
  );
}
