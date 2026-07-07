from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "assets" / "reference"
HOOK_SOURCE = Path(r"C:\Users\User\Downloads\Go Deep Get Bigger.png")
UI_SOURCE = Path(r"C:\Users\User\AppData\Local\Temp\codex-clipboard-a88b4866-fa9b-4705-b84e-8554629ead24.png")


def trim_alpha(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return image
    return image.crop(bbox)


def make_hook() -> None:
    image = Image.open(HOOK_SOURCE).convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
      for x in range(image.width):
        r, g, b, a = pixels[x, y]
        whiteness = min(r, g, b)
        if whiteness > 236 and max(r, g, b) - min(r, g, b) < 28:
            pixels[x, y] = (255, 255, 255, 0)
        elif whiteness > 218:
            fade = max(0, min(255, (236 - whiteness) * 12))
            pixels[x, y] = (r, g, b, min(a, fade))
    hook = trim_alpha(image)
    hook.save(OUT / "hook-chain-reference.png")


def crop_ui() -> None:
    image = Image.open(UI_SOURCE).convert("RGB")
    crops = {
        "ui-hud-frame.png": (1066, 28, 1661, 118),
        "ui-info-frame.png": (18, 300, 572, 386),
        "ui-button-gold.png": (16, 621, 380, 699),
        "ui-button-cyan.png": (16, 707, 381, 783),
        "ui-button-green.png": (16, 790, 381, 861),
        "ui-button-purple.png": (17, 869, 381, 934),
        "ui-control-frame.png": (579, 843, 1140, 921),
        "ui-large-panel.png": (17, 14, 775, 282),
        "ui-reel-porthole.png": (390, 602, 750, 825),
    }
    for name, box in crops.items():
        image.crop(box).save(OUT / name)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    make_hook()
    crop_ui()
    print(f"Wrote reference assets to {OUT}")


if __name__ == "__main__":
    main()
