import re

with open("src/components/properties/PhotoGalleryModal.tsx", "r") as f:
    content = f.read()

# Add imports
if "from '@/types/database'" not in content:
    content = content.replace(
        "import { useEscapeKey } from '@/hooks/useEscapeKey';",
        "import { useEscapeKey } from '@/hooks/useEscapeKey';\nimport { PropertyImage } from '@/types/database';"
    )

# Change interface
content = content.replace(
    "images: string[];",
    "images: (string | PropertyImage)[];"
)

# Replace getImageSections
new_getImageSections = """
const CATEGORY_LABELS: Record<string, string> = {
  exterior: 'Exterior & View',
  living_area: 'Living Area',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom / CR',
  kitchen: 'Kitchen & Dining',
  outdoor: 'Outdoor Spaces',
  amenities: 'Amenities',
  farm_animals: 'Farm Animals',
};

const getImageSections = (images: (string | PropertyImage)[]) => {
  if (images.length === 0) return [];
  
  const sections: { title: string; images: { url: string; fullWidth: boolean }[] }[] = [];
  
  // Backwards compatibility for string[]
  if (typeof images[0] === 'string') {
    const urls = images as string[];
    sections.push({
      title: 'Photo tour',
      images: [{ url: urls[0], fullWidth: true }]
    });
    if (urls.length > 1) {
      sections.push({ title: 'Outdoor spaces', images: urls.slice(1, 3).map(url => ({ url, fullWidth: false })) });
    }
    if (urls.length > 3) {
      sections.push({ title: 'Living area', images: [{ url: urls[3], fullWidth: true }] });
    }
    if (urls.length > 4) {
      sections.push({ title: 'More spaces', images: urls.slice(4).map(url => ({ url, fullWidth: false })) });
    }
    return sections;
  }
  
  // Logic for PropertyImage[]
  const propImages = images as PropertyImage[];
  const groups: Record<string, { url: string; fullWidth: boolean }[]> = {};
  
  propImages.forEach((img) => {
    const category = img.category || 'exterior';
    const label = CATEGORY_LABELS[category] || 'More photos';
    
    if (!groups[label]) groups[label] = [];
    
    // First image in each category is full width
    groups[label].push({
      url: img.image_url,
      fullWidth: groups[label].length === 0
    });
  });

  return Object.entries(groups).map(([title, imgs]) => ({
    title,
    images: imgs
  }));
};
"""

# Find and replace old getImageSections
old_func_pattern = re.compile(r'// Image section configuration for visual variety.*?};', re.DOTALL)
content = old_func_pattern.sub(new_getImageSections.strip(), content)

# Fix flat mapping for allImages in the component body
# const allImages = images; -> const allImages = images.map(img => typeof img === 'string' ? img : img.image_url);
content = content.replace(
    "const allImages = images;",
    "const allImages = images.map(img => typeof img === 'string' ? img : img.image_url);"
)

with open("src/components/properties/PhotoGalleryModal.tsx", "w") as f:
    f.write(content)
