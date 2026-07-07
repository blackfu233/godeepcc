from pathlib import Path
import shutil

from PIL import Image


ROOT = Path(r"C:\Users\User\Documents\go deep")
OUT = ROOT / "src" / "assets" / "generated"
BACKGROUND = Path(
    r"C:\Users\User\.codex\generated_images\019efd61-3aec-7bf2-94c1-f848bfce907b\ig_0ad83c8a0c570e8d016a3cead6f6d4819693a2e15cb762ab06.png"
)
ATLAS = Path(
    r"C:\Users\User\.codex\generated_images\019efd61-3aec-7bf2-94c1-f848bfce907b\ig_0ad83c8a0c570e8d016a3ceb14add08196b32b69ffd6d5afbe.png"
)

NAMES = [
    "small-school",
    "jelly",
    "turtle",
    "red-fish",
    "shark",
    "xuanwu",
    "white-tiger",
    "vermilion",
    "azure-dragon",
    "twin-fish",
    "golden-pearl",
    "puffer-bomb",
    "thunder-jelly",
    None,
    None,
    None,
]


def key_green_to_alpha(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    px = image.load()
    width, height = image.size
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = px[x, y]
            green_delta = green - max(red, blue)
            if green > 150 and green_delta > 45:
                new_alpha = 0 if green_delta > 95 else max(0, min(255, int(255 * (95 - green_delta) / 50)))
                px[x, y] = (red, green, blue, new_alpha)
            elif green > red and green > blue:
                px[x, y] = (red, min(green, max(red, blue) + 22), blue, alpha)
    return image


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    shutil.copy2(BACKGROUND, OUT / "deep-sea-bg.png")
    shutil.copy2(ATLAS, OUT / "fish-atlas-source.png")

    atlas = Image.open(ATLAS).convert("RGBA")
    cell_width = atlas.width // 4
    cell_height = atlas.height // 4

    for index, name in enumerate(NAMES):
        if not name:
            continue
        x = (index % 4) * cell_width
        y = (index // 4) * cell_height
        crop = atlas.crop((x, y, x + cell_width, y + cell_height))
        crop = key_green_to_alpha(crop)
        bbox = crop.getbbox()
        if bbox:
            crop = crop.crop(bbox)
        padded = Image.new("RGBA", (crop.width + 36, crop.height + 36), (0, 0, 0, 0))
        padded.alpha_composite(crop, (18, 18))
        padded.save(OUT / f"{name}.png")

    print(f"Wrote generated assets to {OUT}")


if __name__ == "__main__":
    main()
