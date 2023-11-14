require("esbuild").build({
    entryPoints: ["dist/index.ts"],
    bundle: true,
    outdir: "./dist",
    platform: "neutral",
    loader: {".ts": "ts"},
    minify: process.env.NODE_ENV !== "development",
    external: ["url", "stream", "crypto", "tls", "net", "http", "https", "events", "zlib"],
}).catch(() => process.exit(1));
