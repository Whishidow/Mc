# Wizardiuz Staff Addon (Bedrock 1.21.131)

This addon provides the **Wizardiuz Staff** elemental weapon system with offhand scroll mechanics.

## Features implemented

- Elemental staff variants: **Water, Fire, Wind, Sand, Hail**.
- **Crouch + Use** (without scroll in offhand) cycles element in order:
  - Water → Fire → Wind → Sand → Hail → Water.
- Offhand **Scrolls** unlock casting.
- Two control lanes per scroll:
  - **Use** = ability lane A (random one from 3 abilities)
  - **Crouch + Use** = ability lane B (random one from 3 abilities)
- Each element has **6 total abilities** with mixed category tags:
  - Support / Attack / Defense
- Staff crystal texture changes by held staff element (and auto-syncs to scroll element).

## Items

### Staffs
- `wizardiuz:staff_water`
- `wizardiuz:staff_fire`
- `wizardiuz:staff_wind`
- `wizardiuz:staff_sand`
- `wizardiuz:staff_hail`

### Scrolls (offhand)
- `wizardiuz:scroll_banished_sun` (Fire)
- `wizardiuz:scroll_tide_warden` (Water)
- `wizardiuz:scroll_gale_sigil` (Wind)
- `wizardiuz:scroll_dune_aegis` (Sand)
- `wizardiuz:scroll_hail_requiem` (Hail)

## Damage and balance

- Base staff hit damage: **8**.
- Ability damage ranges from **4–10** depending on element and category.
- Most defensive/support casts trade immediate burst for buffs (resistance, regeneration, absorption, utility).
- High-output abilities are constrained by:
  - random selection inside lane pools
  - requiring the correct offhand scroll
  - requiring player input mode (sneak/non-sneak)

## Effects used

- Regeneration, Resistance, Absorption, Speed, Jump Boost, Haste
- Water Breathing, Invisibility, Slow Falling, Fire Resistance, Strength
- Health Boost, Slowness, Night Vision, Saturation
- Knockback burst and AoE damage effects

## Necessities

- Minecraft Bedrock Edition **1.21.131** (or compatible 1.21.30+)
- Enable in world settings:
  - Holiday Creator Features / Beta APIs as needed for your platform build
  - Script API support


## Repository note (binary-free PR compatibility)

This repository intentionally does **not** track binary files (`.png`, `.mcaddon`) to support PR systems that reject binaries.

Generate all required textures/icons/package locally with:

```bash
python Wizardiuz_Staff_Addon/tools/build_addon.py
```

Outputs:
- Generated textures/icons inside `Wizardiuz_Staff_Addon/RP/textures/items/`, `BP/pack_icon.png`, `RP/pack_icon.png`
- Packaged addon: `Wizardiuz_Staff_Addon/dist/Wizardiuz_Staff.mcaddon`

## Installation

1. Build and import `Wizardiuz_Staff_Addon/dist/Wizardiuz_Staff.mcaddon`.
2. Activate both packs in your world:
   - Wizardiuz Staff BP
   - Wizardiuz Staff RP
3. Give yourself items:
   - `/give @s wizardiuz:staff_water`
   - `/give @s wizardiuz:scroll_banished_sun`

## Notes

- The script auto-replaces the held staff to match the offhand scroll's element for clear visual identity.
- Actionbar shows cast result with element, ability name, and category.
