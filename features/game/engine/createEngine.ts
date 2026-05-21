import { playSoundEffect } from "@/lib/sound";
import * as repo from "@/features/stage/stageProgressRepository";
import * as T from "./tuning";
import type { Item, ItemType, Puddle, Shelter } from "@/features/stage/types";
import type { Engine, EngineConfig, GameState, Input } from "./types";

export function createEngine(config: EngineConfig): Engine {
    const { canvas, stage, onStateChange } = config;
    const ctx = canvas.getContext("2d")!;
    const input = {
        left: false,
        right: false,
        jump: false
    };
    function generateItems(puddles: Puddle[]) {
        const types: ItemType[] = [
            "heart",
            "umbrella",
            "boots",
            "raincoat"
        ];
        const items = [];
        let x = 350 + Math.random() * 200;
        while(x < stage.goalDistance - 250){
            const nearShelter = stage.shelters.some((s)=>Math.abs(s.x - x) < 190);
            const nearPuddle = puddles.some((p)=>x > p.x - 45 && x < p.x + p.width + 45);
            if (!nearShelter && !nearPuddle) {
                const type = types[Math.floor(Math.random() * types.length)];
                const r = Math.random();
                let y;
                if (r < 0.5) y = 45 + Math.random() * 45;
                else if (r < 0.85) y = 90 + Math.random() * 50;
                else y = 140 + Math.random() * 40;
                items.push({
                    x: Math.round(x),
                    y: Math.round(y),
                    type
                });
                x += 360 + Math.random() * 280;
            } else {
                x += 110;
            }
        }
        return items;
    }
    function generatePuddles() {
        const puddles = [];
        let x = 500 + Math.random() * 400;
        while(x < stage.goalDistance - 200){
            const width = Math.random() < 0.4 ? 135 : 72;
            const overlapsShelter = stage.shelters.some((s)=>x < s.x + 100 && x + width > s.x - 100);
            if (!overlapsShelter) {
                puddles.push({
                    x: Math.round(x),
                    width
                });
            }
            x += 550 + Math.random() * 550;
        }
        return puddles;
    }
    function initialState(): GameState {
        const initNext = stage.lightning ? stage.lightning.gap.min + Math.random() * (stage.lightning.gap.max - stage.lightning.gap.min) : 0;
        const puddles = generatePuddles();
        const items = generateItems(puddles);
        return {
            px: 30,
            py: 0,
            vy: 0,
            onGround: true,
            jumpsLeft: T["MAX_JUMPS"],
            facing: 1,
            cam: 0,
            realT: 0,
            drops: [],
            lightnings: [],
            nextStrikeT: initNext,
            lives: T["MAX_LIVES"],
            iframeT: 0,
            items,
            puddles,
            umbrellaT: 0,
            bootsT: 0,
            raincoatT: 0,
            score: 0,
            scorePopups: [],
            bestScore: (0, repo["getBestScore"])(stage.id),
            isNewBest: false,
            timeBonus: 0,
            heartBonus: 0,
            status: "playing"
        };
    }
    const state = initialState();
    let raf: number | null = null;
    const itemAudio = typeof Audio !== "undefined" ? new Audio("/audio/item.mp3") : null;
    if (itemAudio) itemAudio.volume = 0.5;
    const hurtAudio = typeof Audio !== "undefined" ? new Audio("/audio/hurt.mp3") : null;
    if (hurtAudio) hurtAudio.volume = 0.5;
    const thunderAudio = typeof Audio !== "undefined" ? new Audio("/audio/thunder.mp3") : null;
    if (thunderAudio) thunderAudio.volume = 0.5;
    let lastT = 0;
    let prevJump = false;
    let spawnAcc = 0;
    let prevPxScore = state.px;
    let winStartT: number | null = null;
    let runDist = 0;
    const RUN_FRAMES = 8;
    const RUN_DISTANCE_PER_FRAME = 15;
    const RUN_TARGET_DISPLAY_H = 90;
    const IDLE_TARGET_DISPLAY_H = 90;
    const runFrames: HTMLCanvasElement[] = [];
    let runFrameW = 1;
    let runFrameH = 1;
    const idleFrames: HTMLCanvasElement[] = [];
    let idleFrameW = 1;
    let idleFrameH = 1;
    const raincoatRunFrames: HTMLCanvasElement[] = [];
    let raincoatRunFrameW = 1;
    let raincoatRunFrameH = 1;
    const umbrellaRunFrames: HTMLCanvasElement[] = [];
    let umbrellaRunFrameW = 1;
    let umbrellaRunFrameH = 1;
    const bootsRunFrames: HTMLCanvasElement[] = [];
    let bootsRunFrameW = 1;
    let bootsRunFrameH = 1;
    const raincoatIdleFrames: HTMLCanvasElement[] = [];
    let raincoatIdleFrameW = 1;
    let raincoatIdleFrameH = 1;
    const bootsIdleFrames: HTMLCanvasElement[] = [];
    let bootsIdleFrameW = 1;
    let bootsIdleFrameH = 1;
    const umbrellaIdleFrames: HTMLCanvasElement[] = [];
    let umbrellaIdleFrameW = 1;
    let umbrellaIdleFrameH = 1;
    const busStopFrames: HTMLCanvasElement[] = [];
    let busStopFrameW = 1;
    let busStopFrameH = 1;
    const awningFrames: HTMLCanvasElement[] = [];
    let awningFrameW = 1;
    let awningFrameH = 1;
    const phoneBoothFrames: HTMLCanvasElement[] = [];
    let phoneBoothFrameW = 1;
    let phoneBoothFrameH = 1;
    const thunderFrames: HTMLCanvasElement[] = [];
    let thunderFrameW = 1;
    let thunderFrameH = 1;
    const ITEM_FPS = 6;
    const heartFrames: HTMLCanvasElement[] = [];
    let heartFrameW = 1;
    let heartFrameH = 1;
    const umbrellaFrames: HTMLCanvasElement[] = [];
    let umbrellaFrameW = 1;
    let umbrellaFrameH = 1;
    const bootsFrames: HTMLCanvasElement[] = [];
    let bootsFrameW = 1;
    let bootsFrameH = 1;
    const raincoatItemFrames: HTMLCanvasElement[] = [];
    let raincoatItemFrameW = 1;
    let raincoatItemFrameH = 1;
    const rainFrames: HTMLCanvasElement[] = [];
    let rainFrameW = 1;
    let rainFrameH = 1;
    const RAIN_DRAW_H = 32;
    const puddleShortFrames: HTMLCanvasElement[] = [];
    let puddleShortFrameW = 1;
    let puddleShortFrameH = 1;
    const puddleLongFrames: HTMLCanvasElement[] = [];
    let puddleLongFrameW = 1;
    let puddleLongFrameH = 1;
    const houseFrames: HTMLCanvasElement[] = [];
    let houseFrameW = 1;
    let houseFrameH = 1;
    let bgImage: CanvasImageSource | null = null;
    let bgW = 1;
    let bgH = 1;
    {
        const img = new Image();
        img.onload = ()=>{
            bgImage = img;
            bgW = img.naturalWidth;
            bgH = img.naturalHeight;
        };
        img.src = "/sprites/background/street-bg.png";
    }
    function loadSpriteFrames(src: string, frameCount: number, targetFrames: HTMLCanvasElement[], setDims: (w: number, h: number) => void) {
        const img = new Image();
        img.onload = ()=>{
            const master = document.createElement("canvas");
            master.width = img.naturalWidth;
            master.height = img.naturalHeight;
            const mctx = master.getContext("2d");
            if (!mctx) return;
            mctx.drawImage(img, 0, 0);
            const data = mctx.getImageData(0, 0, master.width, master.height);
            const px = data.data;
            // 이미 투명 픽셀이 있으면 배경이 제거된 이미지 → 크로마키 생략
            let hasTransparent = false;
            for(let i = 3; i < px.length; i += 4){
                if (px[i] === 0) {
                    hasTransparent = true;
                    break;
                }
            }
            if (!hasTransparent) {
                for(let i = 0; i < px.length; i += 4){
                    const r = px[i];
                    const g = px[i + 1];
                    const b = px[i + 2];
                    if (g > 100 && g > r * 1.2 && g > b * 1.2) {
                        px[i + 3] = 0;
                    }
                }
                mctx.putImageData(data, 0, 0);
            }
            const rawW = Math.floor(master.width / frameCount);
            const rawH = master.height;
            const rawFrames: HTMLCanvasElement[] = [];
            for(let i = 0; i < frameCount; i++){
                const fc = document.createElement("canvas");
                fc.width = rawW;
                fc.height = rawH;
                const fctx = fc.getContext("2d");
                if (!fctx) continue;
                fctx.drawImage(master, i * rawW, 0, rawW, rawH, 0, 0, rawW, rawH);
                rawFrames.push(fc);
            }
            let minX = rawW;
            let minY = rawH;
            let maxX = -1;
            let maxY = -1;
            for (const rf of rawFrames){
                const rctx = rf.getContext("2d");
                if (!rctx) continue;
                const rdata = rctx.getImageData(0, 0, rawW, rawH).data;
                for(let y = 0; y < rawH; y++){
                    const rowBase = y * rawW * 4;
                    for(let x = 0; x < rawW; x++){
                        if (rdata[rowBase + x * 4 + 3] > 0) {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }
            }
            if (maxX < minX || maxY < minY) {
                setDims(rawW, rawH);
                for (const rf of rawFrames)targetFrames.push(rf);
                return;
            }
            const tightW = maxX - minX + 1;
            const tightH = maxY - minY + 1;
            setDims(tightW, tightH);
            for (const rf of rawFrames){
                const tc = document.createElement("canvas");
                tc.width = tightW;
                tc.height = tightH;
                const tctx = tc.getContext("2d");
                if (!tctx) continue;
                tctx.drawImage(rf, minX, minY, tightW, tightH, 0, 0, tightW, tightH);
                targetFrames.push(tc);
            }
        };
        img.src = src;
    }
    loadSpriteFrames("/sprites/character/run.png", RUN_FRAMES, runFrames, (w, h)=>{
        runFrameW = w;
        runFrameH = h;
    });
    loadSpriteFrames("/sprites/character/idle.png", 1, idleFrames, (w, h)=>{
        idleFrameW = w;
        idleFrameH = h;
    });
    loadSpriteFrames("/sprites/character/raincoat_run.png", RUN_FRAMES, raincoatRunFrames, (w, h)=>{
        raincoatRunFrameW = w;
        raincoatRunFrameH = h;
    });
    loadSpriteFrames("/sprites/character/umbrella_run.png", RUN_FRAMES, umbrellaRunFrames, (w, h)=>{
        umbrellaRunFrameW = w;
        umbrellaRunFrameH = h;
    });
    loadSpriteFrames("/sprites/character/boots_run.png", RUN_FRAMES, bootsRunFrames, (w, h)=>{
        bootsRunFrameW = w;
        bootsRunFrameH = h;
    });
    loadSpriteFrames("/sprites/character/raincoat_idle.png", 1, raincoatIdleFrames, (w, h)=>{
        raincoatIdleFrameW = w;
        raincoatIdleFrameH = h;
    });
    loadSpriteFrames("/sprites/character/boots_idle.png", 1, bootsIdleFrames, (w, h)=>{
        bootsIdleFrameW = w;
        bootsIdleFrameH = h;
    });
    loadSpriteFrames("/sprites/character/umbrella_idle.png", 1, umbrellaIdleFrames, (w, h)=>{
        umbrellaIdleFrameW = w;
        umbrellaIdleFrameH = h;
    });
    loadSpriteFrames("/sprites/objects/bus_stop.png", 1, busStopFrames, (w, h)=>{
        busStopFrameW = w;
        busStopFrameH = h;
    });
    loadSpriteFrames("/sprites/objects/awning.png", 1, awningFrames, (w, h)=>{
        awningFrameW = w;
        awningFrameH = h;
    });
    loadSpriteFrames("/sprites/objects/phone_booth.png", 1, phoneBoothFrames, (w, h)=>{
        phoneBoothFrameW = w;
        phoneBoothFrameH = h;
    });
    loadSpriteFrames("/sprites/effects/thunder.png", 1, thunderFrames, (w, h)=>{
        thunderFrameW = w;
        thunderFrameH = h;
    });
    loadSpriteFrames("/sprites/items/heart.png", 1, heartFrames, (w, h)=>{
        heartFrameW = w;
        heartFrameH = h;
    });
    loadSpriteFrames("/sprites/items/umbrella.png", 1, umbrellaFrames, (w, h)=>{
        umbrellaFrameW = w;
        umbrellaFrameH = h;
    });
    loadSpriteFrames("/sprites/items/boots.png", 1, bootsFrames, (w, h)=>{
        bootsFrameW = w;
        bootsFrameH = h;
    });
    loadSpriteFrames("/sprites/items/raincoat.png", 1, raincoatItemFrames, (w, h)=>{
        raincoatItemFrameW = w;
        raincoatItemFrameH = h;
    });
    loadSpriteFrames("/sprites/effects/rain.png", 1, rainFrames, (w, h)=>{
        rainFrameW = w;
        rainFrameH = h;
    });
    loadSpriteFrames("/sprites/effects/puddle_short.png", 1, puddleShortFrames, (w, h)=>{
        puddleShortFrameW = w;
        puddleShortFrameH = h;
    });
    loadSpriteFrames("/sprites/effects/puddle_long.png", 1, puddleLongFrames, (w, h)=>{
        puddleLongFrameW = w;
        puddleLongFrameH = h;
    });
    loadSpriteFrames("/sprites/objects/house.png", 1, houseFrames, (w, h)=>{
        houseFrameW = w;
        houseFrameH = h;
    });
    function getTimeScale() {
        return input.left || input.right ? 1 : T["STILL_TIME_SCALE"];
    }
    function getSpeedMult() {
        const ts = getTimeScale();
        const tsNorm = (ts - T["STILL_TIME_SCALE"]) / (1 - T["STILL_TIME_SCALE"]);
        return T["SPEED_MULT_MIN"] + tsNorm * (T["SPEED_MULT_MAX"] - T["SPEED_MULT_MIN"]);
    }
    function shelterRoof(s: Shelter) {
        let drawH = 160;
        let fw = busStopFrameW;
        let fh = busStopFrameH;
        if (s.variant === "awning") {
            drawH = 175;
            fw = awningFrameW;
            fh = awningFrameH;
        } else if (s.variant === "phoneBooth") {
            drawH = 170;
            fw = phoneBoothFrameW;
            fh = phoneBoothFrameH;
        }
        const drawW = (drawH * fw) / fh;
        return {
            left: s.x - drawW / 2,
            right: s.x + drawW / 2,
            top: T["GROUND_Y"] - 25 - drawH,
        };
    }
    function applyDamage() {
        if (state.iframeT > 0) return;
        playSoundEffect(hurtAudio);
        state.lives--;
        state.iframeT = T["IFRAME_DURATION"];
        if (state.lives <= 0) {
            state.status = "dead";
        }
    }
    function pickupItem(it: Item) {
        playSoundEffect(itemAudio);
        const points = T["ITEM_SCORE"][it.type];
        state.score += points;
        state.scorePopups.push({
            x: it.x,
            y: T["GROUND_Y"] - it.y - T["ITEM_SIZE"],
            value: points,
            t: T["SCORE_POPUP_DURATION"]
        });
        switch(it.type){
            case "heart":
                state.lives = Math.min(T["MAX_LIVES"], state.lives + 1);
                break;
            case "umbrella":
                state.umbrellaT = T["ITEM_DURATION"];
                break;
            case "boots":
                state.bootsT = T["ITEM_DURATION"];
                break;
            case "raincoat":
                state.raincoatT = T["ITEM_DURATION"];
                break;
        }
    }
    function absorbRain() {
        return state.umbrellaT > 0 || state.raincoatT > 0;
    }
    function absorbPuddle() {
        return state.bootsT > 0 || state.raincoatT > 0;
    }
    function step(dt: number) {
        if (state.status !== "playing") return;
        if (state.iframeT > 0) {
            state.iframeT = Math.max(0, state.iframeT - dt);
        }
        if (state.umbrellaT > 0) {
            state.umbrellaT = Math.max(0, state.umbrellaT - dt);
        }
        if (state.bootsT > 0) {
            state.bootsT = Math.max(0, state.bootsT - dt);
        }
        if (state.raincoatT > 0) {
            state.raincoatT = Math.max(0, state.raincoatT - dt);
        }
        if (input.jump && !prevJump && state.jumpsLeft > 0) {
            state.vy = T["PLAYER_JUMP_VEL"];
            state.onGround = false;
            state.jumpsLeft--;
        }
        prevJump = input.jump;
        if (!state.onGround) {
            state.vy -= T["PLAYER_GRAVITY"] * dt;
            state.py += state.vy * dt;
            if (state.py <= 0) {
                state.py = 0;
                state.vy = 0;
                state.onGround = true;
                state.jumpsLeft = T["MAX_JUMPS"];
            }
        }
        let vx = 0;
        if (input.right && !input.left) {
            vx = T["PLAYER_SPEED"];
            state.facing = 1;
        } else if (input.left && !input.right) {
            vx = -T["PLAYER_SPEED"];
            state.facing = -1;
        }
        state.cam += T["AUTO_SCROLL_SPEED"] * dt;
        state.px += vx * dt;
        runDist += Math.abs(vx) * dt;
        const desiredCam = state.px - T["VIEWPORT_WIDTH"] * T["PLAYER_SCREEN_LIMIT_RATIO"];
        if (desiredCam > state.cam) state.cam = desiredCam;
        if (state.px < state.cam) state.px = state.cam;
        if (state.px < 0) state.px = 0;
        const dxScore = state.px - prevPxScore;
        if (dxScore > 0) {
            state.score += dxScore * T["DISTANCE_SCORE_RATE"] * getSpeedMult();
        }
        prevPxScore = state.px;
        if (state.px >= stage.goalDistance) {
            state.status = "won";
            if (winStartT === null) winStartT = performance.now();
            const refTime = stage.goalDistance / T["AUTO_SCROLL_SPEED"];
            const timeSaved = Math.max(0, refTime - state.realT);
            state.timeBonus = Math.floor(timeSaved * T["TIME_BONUS_PER_SEC"]);
            state.heartBonus = state.lives * T["HEART_BONUS"];
            const total = Math.floor(state.score) + state.timeBonus + state.heartBonus;
            const prevBest = (0, repo["getBestScore"])(stage.id);
            state.isNewBest = total > prevBest;
            state.bestScore = Math.max(prevBest, total);
            (0, repo["recordBestScore"])(stage.id, total);
            (0, repo["markCleared"])(stage.id);
            (0, repo["addCumulativeScore"])(total);
        }
        if (state.onGround) {
            for (const p of state.puddles){
                if (state.px + T["PLAYER_WIDTH"] / 2 > p.x && state.px - T["PLAYER_WIDTH"] / 2 < p.x + p.width) {
                    if (!absorbPuddle()) applyDamage();
                    break;
                }
            }
        }
        for(let i = state.items.length - 1; i >= 0; i--){
            const it = state.items[i];
            const itLeft = it.x - T["ITEM_SIZE"] / 2;
            const itRight = it.x + T["ITEM_SIZE"] / 2;
            const itBottomY = T["GROUND_Y"] - it.y;
            const itTopY = itBottomY - T["ITEM_SIZE"];
            if (state.px + T["PLAYER_WIDTH"] / 2 > itLeft && state.px - T["PLAYER_WIDTH"] / 2 < itRight && T["GROUND_Y"] - state.py > itTopY && T["GROUND_Y"] - state.py - T["PLAYER_HEIGHT"] < itBottomY) {
                pickupItem(it);
                state.items.splice(i, 1);
            }
        }
        const ts = getTimeScale();
        spawnAcc += dt * ts * stage.rainRate;
        while(spawnAcc >= 1){
            spawnAcc -= 1;
            const spawnX = state.cam - 40 + Math.random() * (T["VIEWPORT_WIDTH"] + 160);
            state.drops.push({
                x: spawnX,
                y: -40
            });
        }
        const playerLeft = state.px - T["PLAYER_WIDTH"] / 2;
        const playerRight = state.px + T["PLAYER_WIDTH"] / 2;
        const playerTopY = T["GROUND_Y"] - state.py - T["PLAYER_HEIGHT"];
        const playerBottomY = T["GROUND_Y"] - state.py;
        for(let i = state.drops.length - 1; i >= 0; i--){
            const d = state.drops[i];
            d.x += T["RAIN_VX"] * dt * ts;
            d.y += T["RAIN_VY"] * dt * ts;
            if (d.y > T["GROUND_Y"] + 20) {
                state.drops.splice(i, 1);
                continue;
            }
            let consumed = false;
            for (const s of stage.shelters){
                const r = shelterRoof(s);
                if (d.y >= r.top && d.x >= r.left && d.x <= r.right) {
                    state.drops.splice(i, 1);
                    consumed = true;
                    break;
                }
            }
            if (consumed) continue;
            if (d.x >= playerLeft && d.x <= playerRight && d.y >= playerTopY && d.y <= playerBottomY) {
                if (!absorbRain()) applyDamage();
                state.drops.splice(i, 1);
            }
        }
        if (stage.lightning) {
            state.nextStrikeT -= dt;
            if (state.nextStrikeT <= 0) {
                const { min, max } = stage.lightning.gap;
                const warnSec = stage.lightning.warnSec ?? T["LIGHTNING_WARN_DURATION"];
                const playerEffVx = input.right && !input.left ? T["PLAYER_SPEED"] : input.left && !input.right ? -T["PLAYER_SPEED"] : T["AUTO_SCROLL_SPEED"];
                const predictedX = state.px + playerEffVx * warnSec;
                const desiredX = predictedX + (Math.random() - 0.5) * 2 * T["LIGHTNING_PLAYER_BIAS_RADIUS"];
                const minX = state.cam + T["LIGHTNING_SPAWN_MARGIN"];
                const maxX = state.cam + T["VIEWPORT_WIDTH"] - T["LIGHTNING_SPAWN_MARGIN"];
                const spawnX = Math.max(minX, Math.min(maxX, desiredX));
                state.lightnings.push({
                    x: spawnX,
                    phase: "warn",
                    t: warnSec
                });
                state.nextStrikeT = min + Math.random() * (max - min);
            }
        }
        for(let i = state.lightnings.length - 1; i >= 0; i--){
            const ev = state.lightnings[i];
            ev.t -= ev.phase === "warn" ? dt : dt * ts;
            if (ev.t <= 0) {
                if (ev.phase === "warn") {
                    ev.phase = "strike";
                    ev.t = T["LIGHTNING_STRIKE_DURATION"];
                    playSoundEffect(thunderAudio);
                } else if (ev.phase === "strike") {
                    ev.phase = "linger";
                    ev.t = T["LIGHTNING_LINGER_DURATION"];
                } else {
                    state.lightnings.splice(i, 1);
                    continue;
                }
            }
            if (ev.phase === "strike") {
                const half = T["LIGHTNING_WIDTH"] / 2;
                if (state.px + T["PLAYER_WIDTH"] / 2 > ev.x - half && state.px - T["PLAYER_WIDTH"] / 2 < ev.x + half) {
                    applyDamage();
                }
            }
        }
        for(let i = state.scorePopups.length - 1; i >= 0; i--){
            const p = state.scorePopups[i];
            p.t -= dt;
            if (p.t <= 0) state.scorePopups.splice(i, 1);
        }
        state.realT += dt;
    }
    function draw() {
        const W = canvas.width;
        const H = canvas.height;
        const cam = Math.round(state.cam);
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
        skyGrad.addColorStop(0, "#D8B5E0");
        skyGrad.addColorStop(0.5, "#FFB8C8");
        skyGrad.addColorStop(1, "#FFC8A0");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);
        if (bgImage) {
            const scale = H / bgH;
            const drawBgW = Math.round(bgW * scale);
            const drawBgH = H;
            const offset = (cam % drawBgW + drawBgW) % drawBgW;
            ctx.drawImage(bgImage, -offset, 0, drawBgW, drawBgH);
            ctx.drawImage(bgImage, drawBgW - offset, 0, drawBgW, drawBgH);
        } else {
            ctx.fillStyle = "#3a2f24";
            ctx.fillRect(0, T["GROUND_Y"], W, H - T["GROUND_Y"]);
            ctx.fillStyle = "#5d4f3e";
            ctx.fillRect(0, T["GROUND_Y"], W, 3);
        }
        for (const p of state.puddles){
            const sx = p.x - cam;
            if (sx + p.width < 0 || sx > W) continue;
            const isLong = p.width >= 100;
            const pFrames = isLong ? puddleLongFrames : puddleShortFrames;
            const pfw = isLong ? puddleLongFrameW : puddleShortFrameW;
            const pfh = isLong ? puddleLongFrameH : puddleShortFrameH;
            if (pFrames.length > 0) {
                const f = pFrames[0];
                const drawW = p.width;
                const drawH = drawW * pfh / pfw;
                const drawY = Math.round(T["GROUND_Y"] - drawH * 1.0);
                ctx.drawImage(f, Math.round(sx), drawY, drawW, drawH);
            } else {
                ctx.fillStyle = "#3a6fa8";
                ctx.fillRect(sx, T["GROUND_Y"] - 3, p.width, 8);
                ctx.fillStyle = "rgba(180,210,255,0.4)";
                ctx.fillRect(sx, T["GROUND_Y"] - 3, p.width, 2);
            }
        }
        {
            const sx = stage.goalDistance - cam;
            if (sx > -260 && sx < W + 260) {
                if (houseFrames.length > 0) {
                    const drawH = 210;
                    const drawW = drawH * houseFrameW / houseFrameH;
                    ctx.drawImage(houseFrames[0], Math.round(sx - drawW / 2), Math.round(T["GROUND_Y"] - 25 - drawH), drawW, drawH);
                } else {
                    ctx.fillStyle = "#5d4f3e";
                    ctx.fillRect(sx - 2, T["GROUND_Y"] - 90, 4, 90);
                    ctx.fillStyle = "#e53e3e";
                    ctx.beginPath();
                    ctx.moveTo(sx + 2, T["GROUND_Y"] - 90);
                    ctx.lineTo(sx + 32, T["GROUND_Y"] - 80);
                    ctx.lineTo(sx + 2, T["GROUND_Y"] - 65);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#fbb6ce";
                    ctx.fillRect(sx + 2, T["GROUND_Y"] - 90, 24, 2);
                }
            }
        }
        for (const it of state.items){
            const sx = it.x - cam;
            if (sx + T["ITEM_SIZE"] < 0 || sx - T["ITEM_SIZE"] > W) continue;
            const yBottom = T["GROUND_Y"] - it.y;
            const yTop = yBottom - T["ITEM_SIZE"];
            const left = sx - T["ITEM_SIZE"] / 2;
            let itemFrames = null;
            let itemFW = 1;
            let itemFH = 1;
            if (it.type === "heart") {
                itemFrames = heartFrames;
                itemFW = heartFrameW;
                itemFH = heartFrameH;
            } else if (it.type === "umbrella") {
                itemFrames = umbrellaFrames;
                itemFW = umbrellaFrameW;
                itemFH = umbrellaFrameH;
            } else if (it.type === "boots") {
                itemFrames = bootsFrames;
                itemFW = bootsFrameW;
                itemFH = bootsFrameH;
            } else if (it.type === "raincoat") {
                itemFrames = raincoatItemFrames;
                itemFW = raincoatItemFrameW;
                itemFH = raincoatItemFrameH;
            }
            if (itemFrames && itemFrames.length > 0) {
                const idx = itemFrames.length > 1 ? Math.floor(state.realT * ITEM_FPS) % itemFrames.length : 0;
                const f = itemFrames[idx];
                const drawH = T["ITEM_SIZE"] * (it.type === "heart" ? 1 : 1.3);
                const drawW = drawH * itemFW / itemFH;
                const drawLeft = Math.round(sx - drawW / 2);
                const drawTop = Math.round(yBottom - drawH);
                ctx.drawImage(f, drawLeft, drawTop, drawW, drawH);
            } else {
                ctx.fillStyle = "#888";
                ctx.fillRect(left, yTop, T["ITEM_SIZE"], T["ITEM_SIZE"]);
            }
        }
        const ts = getTimeScale();
        const playerVxRaw = input.right && !input.left ? T["PLAYER_SPEED"] : 0;
        const appVx = T["RAIN_VX"] - playerVxRaw;
        const appVy = T["RAIN_VY"];
        const mag = Math.sqrt(appVx * appVx + appVy * appVy);
        if (rainFrames.length > 0) {
            const rainFrame = rainFrames[0];
            const rainH = RAIN_DRAW_H;
            const rainW = rainH * rainFrameW / rainFrameH;
            const angle = Math.atan2(-appVx, appVy);
            for (const d of state.drops){
                const sx = d.x - cam;
                if (sx < -30 || sx > W + 30) continue;
                ctx.save();
                ctx.translate(sx, d.y);
                ctx.rotate(angle);
                ctx.drawImage(rainFrame, -rainW / 2, -rainH, rainW, rainH);
                ctx.restore();
            }
        } else {
            const sdx = appVx / mag * T["RAIN_STREAK_LENGTH"];
            const sdy = appVy / mag * T["RAIN_STREAK_LENGTH"];
            ctx.strokeStyle = "rgba(190,210,245,0.78)";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            for (const d of state.drops){
                const sx = d.x - cam;
                if (sx < -30 || sx > W + 30) continue;
                ctx.moveTo(sx, d.y);
                ctx.lineTo(sx - sdx, d.y - sdy);
            }
            ctx.stroke();
        }
        for (const s of stage.shelters){
            const sx = s.x - cam;
            if (sx + 60 < 0 || sx - 60 > W) continue;
            if (s.variant === "busStop") {
                if (busStopFrames.length > 0) {
                    const drawH = 160;
                    const drawW = drawH * busStopFrameW / busStopFrameH;
                    ctx.drawImage(busStopFrames[0], Math.round(sx - drawW / 2), Math.round(T["GROUND_Y"] - 25 - drawH), drawW, drawH);
                } else {
                    ctx.fillStyle = "#4a5568";
                    ctx.fillRect(sx - 50, T["GROUND_Y"] - 80, 4, 80);
                    ctx.fillRect(sx + 46, T["GROUND_Y"] - 80, 4, 80);
                    ctx.fillStyle = "rgba(120,150,180,0.25)";
                    ctx.fillRect(sx - 46, T["GROUND_Y"] - 76, 92, 58);
                    ctx.fillStyle = "#2d3748";
                    ctx.fillRect(sx - 55, T["GROUND_Y"] - 88, 110, 10);
                    ctx.fillStyle = "#5d4f3e";
                    ctx.fillRect(sx - 35, T["GROUND_Y"] - 20, 70, 6);
                }
            } else if (s.variant === "awning") {
                if (awningFrames.length > 0) {
                    const drawH = 175;
                    const drawW = drawH * awningFrameW / awningFrameH;
                    ctx.drawImage(awningFrames[0], Math.round(sx - drawW / 2), Math.round(T["GROUND_Y"] - 25 - drawH), drawW, drawH);
                } else {
                    ctx.fillStyle = "#3a3a3a";
                    ctx.fillRect(sx - 50, T["GROUND_Y"] - 110, 4, 16);
                    ctx.fillRect(sx + 46, T["GROUND_Y"] - 110, 4, 16);
                    ctx.fillStyle = "#8b3a3a";
                    ctx.fillRect(sx - 50, T["GROUND_Y"] - 110, 100, 12);
                    ctx.fillStyle = "#c54a4a";
                    ctx.fillRect(sx - 50, T["GROUND_Y"] - 110, 100, 3);
                }
            } else if (s.variant === "phoneBooth") {
                if (phoneBoothFrames.length > 0) {
                    const drawH = 170;
                    const drawW = drawH * phoneBoothFrameW / phoneBoothFrameH;
                    ctx.drawImage(phoneBoothFrames[0], Math.round(sx - drawW / 2), Math.round(T["GROUND_Y"] - 25 - drawH), drawW, drawH);
                } else {
                    ctx.fillStyle = "#9b2c2c";
                    ctx.fillRect(sx - 22, T["GROUND_Y"] - 110, 44, 110);
                    ctx.fillStyle = "#2d2d2d";
                    ctx.fillRect(sx - 22, T["GROUND_Y"] - 110, 44, 14);
                    ctx.fillStyle = "#f0e0a0";
                    ctx.fillRect(sx - 18, T["GROUND_Y"] - 107, 36, 8);
                    ctx.fillStyle = "rgba(160,190,210,0.4)";
                    ctx.fillRect(sx - 18, T["GROUND_Y"] - 92, 36, 70);
                    ctx.fillStyle = "#9b2c2c";
                    ctx.fillRect(sx - 2, T["GROUND_Y"] - 92, 4, 70);
                }
            }
        }
        const warnSec = stage.lightning?.warnSec ?? T["LIGHTNING_WARN_DURATION"];
        for (const ev of state.lightnings){
            const sx = ev.x - cam;
            if (sx + T["LIGHTNING_WIDTH"] < 0 || sx - T["LIGHTNING_WIDTH"] > W) continue;
            if (ev.phase === "warn") {
                const progress = 1 - ev.t / warnSec;
                const blinkHz = 3 + progress * 18;
                const visible = Math.floor(state.realT * blinkHz) % 2 === 0;
                if (visible) {
                    ctx.fillStyle = "rgba(255,200,0,0.7)";
                    ctx.fillRect(sx - T["LIGHTNING_WIDTH"] / 2, T["GROUND_Y"] - 4, T["LIGHTNING_WIDTH"], 8);
                    ctx.fillStyle = "rgba(255,80,0,0.9)";
                    ctx.fillRect(sx - T["LIGHTNING_WIDTH"] / 2, T["GROUND_Y"] - 6, T["LIGHTNING_WIDTH"], 2);
                }
            } else if (ev.phase === "strike") {
                const strikeProgress = 1 - ev.t / T["LIGHTNING_STRIKE_DURATION"];
                if (thunderFrames.length > 0) {
                    const f = thunderFrames[0];
                    const drawW = T["LIGHTNING_WIDTH"];
                    const drawH = T["GROUND_Y"] * strikeProgress;
                    const srcH = thunderFrameH * strikeProgress;
                    ctx.drawImage(f, 0, 0, thunderFrameW, srcH, Math.round(sx - drawW / 2), 0, drawW, drawH);
                } else {
                    const tipY = T["GROUND_Y"] * strikeProgress;
                    ctx.fillStyle = "rgba(255,240,100,0.4)";
                    ctx.fillRect(sx - T["LIGHTNING_WIDTH"] / 2, 0, T["LIGHTNING_WIDTH"], tipY);
                    ctx.fillStyle = "rgba(255,255,255,0.95)";
                    ctx.fillRect(sx - 4, 0, 8, tipY);
                }
            } else {
                if (thunderFrames.length > 0) {
                    const alpha = Math.max(0, ev.t / T["LIGHTNING_LINGER_DURATION"]);
                    ctx.globalAlpha = alpha;
                    ctx.drawImage(thunderFrames[0], Math.round(sx - T["LIGHTNING_WIDTH"] / 2), 0, T["LIGHTNING_WIDTH"], T["GROUND_Y"]);
                    ctx.globalAlpha = 1;
                } else {
                    ctx.fillStyle = "rgba(20,20,20,0.7)";
                    ctx.fillRect(sx - T["LIGHTNING_WIDTH"] / 2, T["GROUND_Y"] - 2, T["LIGHTNING_WIDTH"], 4);
                }
            }
        }
        const screenX = state.px - cam;
        const playerTop = T["GROUND_Y"] - state.py - T["PLAYER_HEIGHT"];
        const blinking = state.iframeT > 0 && Math.floor(state.realT * 12) % 2 === 0;
        if (!blinking) {
            let activeSet = runFrames;
            let activeSetW = runFrameW;
            let activeSetH = runFrameH;
            let activeMaxT = 0;
            let activeEffect = null;
            let hasItemEffect = false;
            if (state.raincoatT > activeMaxT && raincoatRunFrames.length > 0) {
                activeSet = raincoatRunFrames;
                activeSetW = raincoatRunFrameW;
                activeSetH = raincoatRunFrameH;
                activeMaxT = state.raincoatT;
                activeEffect = "raincoat";
                hasItemEffect = true;
            }
            if (state.umbrellaT > activeMaxT && umbrellaRunFrames.length > 0) {
                activeSet = umbrellaRunFrames;
                activeSetW = umbrellaRunFrameW;
                activeSetH = umbrellaRunFrameH;
                activeMaxT = state.umbrellaT;
                activeEffect = "umbrella";
                hasItemEffect = true;
            }
            if (state.bootsT > activeMaxT && bootsRunFrames.length > 0) {
                activeSet = bootsRunFrames;
                activeSetW = bootsRunFrameW;
                activeSetH = bootsRunFrameH;
                activeMaxT = state.bootsT;
                activeEffect = "boots";
                hasItemEffect = true;
            }
            const runSet = activeSet;
            const runSetW = activeSetW;
            const runSetH = activeSetH;
            let frame;
            let frameW = 1;
            let frameH = 1;
            let targetH = RUN_TARGET_DISPLAY_H;
            if (!state.onGround && runSet.length > 0) {
                frame = runSet[3];
                frameW = runSetW;
                frameH = runSetH;
            } else if ((input.left || input.right) && runSet.length > 0) {
                const i = Math.floor(runDist / RUN_DISTANCE_PER_FRAME);
                const idx = (i % RUN_FRAMES + RUN_FRAMES) % RUN_FRAMES;
                frame = runSet[idx];
                frameW = runSetW;
                frameH = runSetH;
            } else if (activeEffect === "raincoat" && raincoatIdleFrames.length > 0) {
                frame = raincoatIdleFrames[0];
                frameW = raincoatIdleFrameW;
                frameH = raincoatIdleFrameH;
                targetH = IDLE_TARGET_DISPLAY_H;
            } else if (activeEffect === "boots" && bootsIdleFrames.length > 0) {
                frame = bootsIdleFrames[0];
                frameW = bootsIdleFrameW;
                frameH = bootsIdleFrameH;
                targetH = IDLE_TARGET_DISPLAY_H;
            } else if (activeEffect === "umbrella" && umbrellaIdleFrames.length > 0) {
                frame = umbrellaIdleFrames[0];
                frameW = umbrellaIdleFrameW;
                frameH = umbrellaIdleFrameH;
                targetH = IDLE_TARGET_DISPLAY_H;
            } else if (hasItemEffect) {
                frame = runSet[0];
                frameW = runSetW;
                frameH = runSetH;
            } else if (idleFrames.length > 0) {
                frame = idleFrames[0];
                frameW = idleFrameW;
                frameH = idleFrameH;
                targetH = IDLE_TARGET_DISPLAY_H;
            } else if (runFrames.length > 0) {
                frame = runFrames[0];
                frameW = runFrameW;
                frameH = runFrameH;
            }
            if (frame) {
                const SPRITE_H = targetH;
                const SPRITE_W = SPRITE_H * frameW / frameH;
                const destY = Math.round(T["GROUND_Y"] - state.py - SPRITE_H);
                if (state.facing === -1) {
                    ctx.save();
                    ctx.translate(Math.round(screenX), 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(frame, -SPRITE_W / 2, destY, SPRITE_W, SPRITE_H);
                    ctx.restore();
                } else {
                    const destX = Math.round(screenX - SPRITE_W / 2);
                    ctx.drawImage(frame, destX, destY, SPRITE_W, SPRITE_H);
                }
            } else {
                ctx.fillStyle = "#fff";
                ctx.fillRect(screenX - T["PLAYER_WIDTH"] / 2, playerTop, T["PLAYER_WIDTH"], T["PLAYER_HEIGHT"]);
            }
        }
        for (const p of state.scorePopups){
            const sx = p.x - cam;
            if (sx < -60 || sx > W + 60) continue;
            const progress = 1 - p.t / T["SCORE_POPUP_DURATION"];
            const yOffset = -progress * T["SCORE_POPUP_RISE"];
            const alpha = Math.max(0, 1 - progress);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = "#ffe066";
            ctx.font = "bold 20px 'PF Stardust', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`+${p.value}`, sx, p.y + yOffset);
            ctx.restore();
        }
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.font = "32px 'PF Stardust', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`SCORE ${Math.floor(state.score).toLocaleString()}`, W - 24, 48);
        if (state.bestScore > 0) {
            ctx.font = "18px 'PF Stardust', sans-serif";
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.fillText(`BEST ${state.bestScore.toLocaleString()}`, W - 24, 76);
        }
        ctx.restore();
        const hudIcon = 34;
        const heartW = heartFrameH > 0 ? (hudIcon * heartFrameW) / heartFrameH : hudIcon;
        for(let i = 0; i < state.lives; i++){
            if (heartFrames.length > 0) {
                ctx.drawImage(heartFrames[0], 24 + i * (heartW + 4), 18, heartW, hudIcon);
            }
        }
        const blinkOff = Math.floor(state.realT * 12) % 2 === 0;
        const activeItems = [
            { t: state.umbrellaT, frames: umbrellaFrames, fw: umbrellaFrameW, fh: umbrellaFrameH },
            { t: state.bootsT, frames: bootsFrames, fw: bootsFrameW, fh: bootsFrameH },
            { t: state.raincoatT, frames: raincoatItemFrames, fw: raincoatItemFrameW, fh: raincoatItemFrameH },
        ].filter((it)=>it.t > 0);
        let ax = 24;
        const ay = 18 + hudIcon + 8;
        for (const item of activeItems){
            const blink = item.t < T["ITEM_BLINK_THRESHOLD"] && blinkOff;
            const dw = (hudIcon * item.fw) / item.fh;
            if (!blink && item.frames.length > 0) {
                ctx.drawImage(item.frames[0], Math.round(ax), ay, dw, hudIcon);
            }
            ax += dw + 6;
        }
        if (state.status === "dead") {
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = "#fff";
            ctx.font = "64px 'PF Stardust', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("GAME OVER", W / 2, H / 2 - 20);
            ctx.restore();
        }
        if (state.status === "won") {
            const animSec = winStartT === null ? 0 : (performance.now() - winStartT) / 1000;
            const fullTimeBonus = state.timeBonus;
            const TIME_START = 0.4;
            const TIME_DURATION = 1.0;
            const HEART_START = 1.7;
            const HEART_INTERVAL = 0.3;
            const TOTAL_DELAY = 0.5;
            const timeT = Math.max(0, Math.min(1, (animSec - TIME_START) / TIME_DURATION));
            const shownTimeBonus = Math.floor(fullTimeBonus * timeT);
            const heartsConsumed = Math.max(0, Math.min(state.lives, Math.floor((animSec - HEART_START) / HEART_INTERVAL)));
            const shownHeartBonus = heartsConsumed * T["HEART_BONUS"];
            const baseScore = Math.floor(state.score);
            const heartsDoneAt = HEART_START + state.lives * HEART_INTERVAL;
            const totalShown = animSec >= heartsDoneAt + TOTAL_DELAY;
            const total = baseScore + shownTimeBonus + shownHeartBonus;
            ctx.save();
            ctx.fillStyle = "rgba(25,42,78,0.72)";
            ctx.fillRect(0, 0, W, H);

            const panelW = 460;
            const panelH = 330;
            const panelX = W / 2 - panelW / 2;
            const panelY = H * 0.30;
            ctx.fillStyle = "rgba(255,255,255,0.14)";
            ctx.strokeStyle = "rgba(255,255,255,0.55)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(panelX, panelY, panelW, panelH, 24);
            ctx.fill();
            ctx.stroke();

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "rgba(0,0,0,0.4)";
            ctx.shadowBlur = 10;
            ctx.fillStyle = "#fff";
            ctx.font = "52px 'PF Stardust', sans-serif";
            ctx.fillText("STAGE CLEAR", W / 2, panelY - 34);
            ctx.shadowBlur = 0;

            const cx = W / 2;
            const labelX = panelX + 40;
            const valueX = panelX + panelW - 40;
            const startY = panelY + 56;
            const lineH = 42;
            ctx.font = "24px 'PF Stardust', sans-serif";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "left";
            ctx.fillText("SCORE", labelX, startY);
            ctx.textAlign = "right";
            ctx.fillText(baseScore.toLocaleString(), valueX, startY);
            if (animSec >= TIME_START) {
                ctx.fillStyle = "#ffe066";
                ctx.textAlign = "left";
                ctx.fillText("TIME bonus", labelX, startY + lineH);
                ctx.textAlign = "right";
                ctx.fillText(`+${shownTimeBonus.toLocaleString()}`, valueX, startY + lineH);
            }
            if (animSec >= HEART_START) {
                const heartsLeft = state.lives - heartsConsumed;
                ctx.fillStyle = "#fc8181";
                ctx.textAlign = "left";
                ctx.fillText("HEART bonus", labelX, startY + lineH * 2);
                ctx.textAlign = "center";
                ctx.fillText("♥".repeat(heartsLeft), cx, startY + lineH * 2);
                ctx.textAlign = "right";
                ctx.fillText(`+${shownHeartBonus.toLocaleString()}`, valueX, startY + lineH * 2);
            }
            if (totalShown) {
                ctx.strokeStyle = "rgba(255,255,255,0.35)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(labelX, startY + lineH * 2.8);
                ctx.lineTo(valueX, startY + lineH * 2.8);
                ctx.stroke();
                ctx.fillStyle = "#fff";
                ctx.font = "30px 'PF Stardust', sans-serif";
                ctx.textAlign = "left";
                ctx.fillText("TOTAL", labelX, startY + lineH * 3.5);
                ctx.textAlign = "right";
                ctx.fillText(total.toLocaleString(), valueX, startY + lineH * 3.5);
                ctx.font = "20px 'PF Stardust', sans-serif";
                ctx.fillStyle = state.isNewBest ? "#ffe066" : "rgba(255,255,255,0.7)";
                ctx.textAlign = "left";
                ctx.fillText("BEST", labelX, startY + lineH * 4.5);
                ctx.textAlign = "right";
                ctx.fillText(state.bestScore.toLocaleString(), valueX, startY + lineH * 4.5);
                if (state.isNewBest) {
                    ctx.fillStyle = "#ffe066";
                    ctx.font = "bold 26px 'PF Stardust', sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("★ NEW BEST! ★", W / 2, startY + lineH * 5.6);
                }
            }
            ctx.restore();
        }
    }
    function loop(now: number) {
        if (raf === null) return;
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;
        step(dt);
        draw();
        onStateChange?.(state);
        raf = requestAnimationFrame(loop);
    }
    return {
        start () {
            if (raf !== null) return;
            lastT = performance.now();
            raf = requestAnimationFrame(loop);
        },
        stop () {
            if (raf !== null) {
                cancelAnimationFrame(raf);
                raf = null;
            }
        },
        setInput (partial) {
            Object.assign(input, partial);
        },
        getState () {
            return state;
        },
        restart () {
            Object.assign(state, initialState());
            spawnAcc = 0;
            prevJump = false;
            prevPxScore = state.px;
            winStartT = null;
        }
    };
}
