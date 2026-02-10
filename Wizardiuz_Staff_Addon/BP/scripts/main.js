import { world, system, ItemStack, EquipmentSlot } from "@minecraft/server";

const STAFF_ORDER = ["water", "fire", "wind", "sand", "hail"];
const STAFF_IDS = Object.fromEntries(STAFF_ORDER.map((e) => [e, `wizardiuz:staff_${e}`]));
const SCROLL_TO_ELEMENT = {
  "wizardiuz:scroll_tide_warden": "water",
  "wizardiuz:scroll_banished_sun": "fire",
  "wizardiuz:scroll_gale_sigil": "wind",
  "wizardiuz:scroll_dune_aegis": "sand",
  "wizardiuz:scroll_hail_requiem": "hail"
};

function getElementFromStaff(typeId) {
  return STAFF_ORDER.find((e) => typeId === STAFF_IDS[e]);
}

function getOffhand(player) {
  return player.getComponent("equippable")?.getEquipment(EquipmentSlot.Offhand);
}

function setMainhandToElement(player, element) {
  const inv = player.getComponent("inventory")?.container;
  if (!inv) return;
  const slot = player.selectedSlotIndex;
  inv.setItem(slot, new ItemStack(STAFF_IDS[element], 1));
}

function nearbyMobs(player, radius = 8) {
  const entities = player.dimension.getEntities({ location: player.location, maxDistance: radius });
  return entities.filter((e) => e.id !== player.id && e.typeId !== "minecraft:item");
}

function damageRing(player, radius, amount, cause = "magic") {
  for (const e of nearbyMobs(player, radius)) {
    try {
      e.applyDamage(amount, { cause, damagingEntity: player });
    } catch {}
  }
}

function pushBurst(player, strength = 1.4, radius = 6) {
  for (const e of nearbyMobs(player, radius)) {
    const dx = e.location.x - player.location.x;
    const dz = e.location.z - player.location.z;
    const mag = Math.max(Math.hypot(dx, dz), 0.1);
    e.applyKnockback(dx / mag, dz / mag, strength, 0.2);
  }
}

function effectSelf(player, effect, duration, amp = 0, showParticles = true) {
  try {
    player.addEffect(effect, duration, { amplifier: amp, showParticles });
  } catch {}
}

const ABILITIES = {
  water: [
    { name: "Tidal Lance", category: "Attack", run: (p) => { damageRing(p, 7, 6, "magic"); p.dimension.runCommandAsync(`particle minecraft:splash_particle ${p.location.x} ${p.location.y + 1} ${p.location.z}`); } },
    { name: "Mending Rain", category: "Support", run: (p) => { effectSelf(p, "regeneration", 120, 1); effectSelf(p, "resistance", 100, 0); } },
    { name: "Foam Guard", category: "Defense", run: (p) => { effectSelf(p, "absorption", 200, 1); effectSelf(p, "water_breathing", 400, 0); } },
    { name: "Riptide Burst", category: "Attack", run: (p) => { pushBurst(p, 1.6, 8); damageRing(p, 5, 4, "entityAttack"); } },
    { name: "Mist Veil", category: "Defense", run: (p) => { effectSelf(p, "invisibility", 80, 0); effectSelf(p, "slow_falling", 120, 0); } },
    { name: "Spring of Focus", category: "Support", run: (p) => { effectSelf(p, "saturation", 1, 0, false); effectSelf(p, "speed", 120, 0); } }
  ],
  fire: [
    { name: "Coffin of the Banished Sun", category: "Attack", run: (p) => { damageRing(p, 9, 8, "fire"); p.dimension.runCommandAsync(`execute at @s run summon minecraft:small_fireball ^ ^1 ^2`); } },
    { name: "Solar Bulwark", category: "Defense", run: (p) => { effectSelf(p, "fire_resistance", 300, 0); effectSelf(p, "resistance", 120, 1); } },
    { name: "Ember Rush", category: "Support", run: (p) => { effectSelf(p, "speed", 160, 1); effectSelf(p, "strength", 100, 0); } },
    { name: "Blazing Volley", category: "Attack", run: (p) => { for (let i = 0; i < 3; i++) system.runTimeout(() => p.dimension.runCommandAsync(`execute at @s run summon minecraft:small_fireball ^ ^1 ^2`), i * 6); } },
    { name: "Scorch Field", category: "Attack", run: (p) => { damageRing(p, 6, 7, "fireTick"); } },
    { name: "Phoenix Pulse", category: "Support", run: (p) => { effectSelf(p, "regeneration", 100, 1); effectSelf(p, "health_boost", 200, 1); } }
  ],
  wind: [
    { name: "Cyclone Jab", category: "Attack", run: (p) => { pushBurst(p, 2.0, 9); damageRing(p, 6, 5, "magic"); } },
    { name: "Tailwind", category: "Support", run: (p) => { effectSelf(p, "speed", 220, 2); effectSelf(p, "jump_boost", 220, 1); } },
    { name: "Aerial Skin", category: "Defense", run: (p) => { effectSelf(p, "slow_falling", 220, 0); effectSelf(p, "resistance", 100, 0); } },
    { name: "Vacuum Spike", category: "Attack", run: (p) => damageRing(p, 5, 9, "magic") },
    { name: "Pressure Step", category: "Support", run: (p) => { effectSelf(p, "haste", 180, 1); effectSelf(p, "night_vision", 300, 0); } },
    { name: "Skyguard", category: "Defense", run: (p) => effectSelf(p, "absorption", 140, 2) }
  ],
  sand: [
    { name: "Dune Spear", category: "Attack", run: (p) => damageRing(p, 7, 7, "entityAttack") },
    { name: "Granite Stance", category: "Defense", run: (p) => { effectSelf(p, "resistance", 220, 1); effectSelf(p, "slowness", 60, 0); } },
    { name: "Nomad's Gift", category: "Support", run: (p) => { effectSelf(p, "saturation", 1, 0, false); effectSelf(p, "regeneration", 80, 0); } },
    { name: "Quicksand Ring", category: "Attack", run: (p) => { damageRing(p, 5, 5, "magic"); p.dimension.runCommandAsync(`execute as @e[r=5,type=!player] at @s run effect @s slowness 3 4 true`); } },
    { name: "Dust Veil", category: "Defense", run: (p) => effectSelf(p, "invisibility", 60, 0) },
    { name: "Caravan Step", category: "Support", run: (p) => effectSelf(p, "speed", 180, 0) }
  ],
  hail: [
    { name: "Shard Barrage", category: "Attack", run: (p) => damageRing(p, 8, 8, "freezing") },
    { name: "Frostwall", category: "Defense", run: (p) => { effectSelf(p, "resistance", 120, 1); effectSelf(p, "absorption", 120, 1); } },
    { name: "Winter Mercy", category: "Support", run: (p) => effectSelf(p, "regeneration", 120, 1) },
    { name: "Permafrost Nova", category: "Attack", run: (p) => { damageRing(p, 5, 10, "freezing"); p.dimension.runCommandAsync(`execute as @e[r=5,type=!player] at @s run effect @s slowness 4 4 true`); } },
    { name: "Iceblink", category: "Support", run: (p) => effectSelf(p, "speed", 80, 2) },
    { name: "Crystal Shell", category: "Defense", run: (p) => effectSelf(p, "health_boost", 160, 1) }
  ]
};

function castAbility(player, element, sneaking) {
  const pool = ABILITIES[element];
  const subset = sneaking ? pool.slice(3, 6) : pool.slice(0, 3);
  const chosen = subset[Math.floor(Math.random() * subset.length)];
  chosen.run(player);
  player.onScreenDisplay.setActionBar(`§b${element.toUpperCase()} §7| §e${chosen.name} §8(${chosen.category})`);
}

world.afterEvents.itemUse.subscribe((ev) => {
  const player = ev.source;
  if (!player?.isValid()) return;

  const item = ev.itemStack;
  if (!item) return;
  const element = getElementFromStaff(item.typeId);
  if (!element) return;

  const offhand = getOffhand(player);
  const offhandId = offhand?.typeId;
  const offhandElement = offhandId ? SCROLL_TO_ELEMENT[offhandId] : undefined;

  if (player.isSneaking && !offhandElement) {
    const idx = STAFF_ORDER.indexOf(element);
    const next = STAFF_ORDER[(idx + 1) % STAFF_ORDER.length];
    setMainhandToElement(player, next);
    player.onScreenDisplay.setActionBar(`§dElement switched: §f${next.toUpperCase()}`);
    return;
  }

  if (!offhandElement) {
    player.onScreenDisplay.setActionBar("§7Offhand a Wizardiuz Scroll to cast abilities.");
    return;
  }

  if (offhandElement !== element) {
    setMainhandToElement(player, offhandElement);
  }

  castAbility(player, offhandElement, player.isSneaking);
});
