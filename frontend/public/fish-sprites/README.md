# Fish Sprites Directory

This directory contains PNG sprites for different fish species in your aquarium.

## Directory Structure

Each species has its own folder (e.g., `clownfish/`, `blue-tang/`) containing:
- `tail-1.png` to `tail-4.png` - Four frames for tail wagging animation

## Creating Your Own Fish Sprites

### PNG Requirements

1. **Dimensions**: Use consistent dimensions like 20x12 pixels (or larger with the same ratio)
2. **Color Base**: For best color tinting results, create your sprites using:
   - Red tones (`#FF0000` for primary parts)
   - Lighter red (`#FF6666` for highlights) 
   - Darker red (`#CC0000` for shadows)
   - White/black for features that should remain unchanged (like eyes)
   
   The system will apply CSS filters to recolor the red tones to the user's chosen color.

3. **Transparency**: Use PNG transparency for the background so fish blend naturally with the tank

### Animation Frames

**Tail Frames (tail-1 through tail-4):**
- Create a smooth tail-wagging animation
- tail-1: Tail slightly up
- tail-2: Tail down
- tail-3: Tail neutral
- tail-4: Tail up

### Tips

- Keep the fish facing **right** in all side views
- The system automatically mirrors for left-facing
- Use simple, clean designs for best results
- Create sprites with red base colors for optimal color tinting
- White/black elements (like eyes) will remain relatively unchanged by the color filter
- PNG transparency allows fish to blend naturally with the aquarium background

## Example Species

The `clownfish/` folder contains example sprites you can use as a template.

## Supported Species

Current species (from AddFishModal):
- Clownfish ✅ (sprites included)
- Blue Tang (add your sprites here)
- Yellow Tang (add your sprites here)
- Royal Gramma (add your sprites here)
- Damselfish (add your sprites here)
- Angelfish (add your sprites here)
- Butterflyfish (add your sprites here)
- Wrasse (add your sprites here)
- Goby (add your sprites here)
- Blenny (add your sprites here)

## Fallback Behavior

If sprites are not found for a species, the system automatically falls back to the original circle-based fish rendering, so it's okay to add sprites gradually!

